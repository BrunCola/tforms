'use strict';

angular.module('mean.pages').controller('iocRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat, runPage, Crossfilter) {
    $scope.global = Global;
    var query;
    
    

    var page = [
        /////////////////
        // CROSSFILTER //
        /////////////////
        {
            type: 'crossfilter', // required
            // key: 'crossfilter', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            run: function(data) { // optional run function to run after data has been fetched (takes an array of data)
                data.forEach(function(d) {
                    d.dd = timeFormat(d.time, 'strdDateObj');
                    d.hour = d3.time.hour(d.dd);
                    d.count = +d.count;
                });
            },
            get: '/api/ioc_notifications/ioc_remote/crossfilter', // no get default to main url, strings will replace the default (otherwise /[from root])
            visuals: [
                {
                    type: 'barchart',
                    settings: { 
                        type: 'severity',
                        xAxis: '',
                        yAxis: '# IOC / Hour'
                    },
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.hour; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduce(
                            function(p, v) {
                                if (v.ioc_severity === 1) {
                                    p.guarded += v.count;
                                }
                                if (v.ioc_severity === 2) {
                                    p.elevated += v.count;
                                }
                                if (v.ioc_severity === 3) {
                                    p.high += v.count;
                                }
                                if (v.ioc_severity === 4) {
                                    p.severe += v.count;
                                }
                                if (v.ioc_severity === null) {
                                    p.other += v.count;
                                }
                                return p;
                            },
                            function(p, v) {
                                if (v.ioc_severity === 1) {
                                    p.guarded -= v.count;
                                }
                                if (v.ioc_severity === 2) {
                                    p.elevated -= v.count;
                                }
                                if (v.ioc_severity === 3) {
                                    p.high -= v.count;
                                }
                                if (v.ioc_severity === 4) {
                                    p.severe -= v.count;
                                }
                                if (v.ioc_severity === null) {
                                    p.other -= v.count;
                                }
                                return p;
                            },
                            function() {
                                return {
                                    guarded:0,
                                    elevated:0,
                                    high:0,
                                    severe:0,
                                    other:0
                                };
                            }
                        );
                    },
                    // outgoingFilter: ['hour'] // Optional and ingests an array of KEYS for other visuals not of this type to match
                },
                {
                    type: 'geochart',
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.remote_country; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function (d) {
                            return d.count;
                        });
                    },
                    outgoingFilter: ['remote_country'] // Optional and ingests an array of KEYS for other visuals not of this type to match
                },
                {
                    type: 'severityLevels',
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.ioc_severity; })},
                    group: function(dimension) {
                        return dimension.group().reduceSum(function (d) {
                            return d.count;
                        })
                    },
                    outgoingFilter: {
                        'table': 'ioc_severity'
                    }
                }
            ]
        },
        /////////////////
        ///// TABLE /////
        /////////////////
        {
            type: 'table', // required either array or single object
            key: 'table', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            get: '/api/ioc_notifications/ioc_remote/table',
            run: function(data) {
                // TODO - check if this is needed for all tables, if so - place this in the service
                var id = 0;
                data.aaData.forEach(function(d){
                    if (!d.id) {
                        d.id = id++;
                    }
                })
            }
        }        
    ];
    $rootScope.search = $scope.search;
    runPage($scope, page);

    // if ($location.$$search.start && $location.$$search.end) {
    //     query = '/api/ioc_notifications/ioc_remote?start='+$location.$$search.start+'&end='+$location.$$search.end;
    // } else {
    //     query = '/api/ioc_notifications/ioc_remote?';
    // }
    // $http({method: 'GET', url: query}).
    // //success(function(data, status, headers, config) {
    // success(function(data) {
    //     if (data.tables[0] === null) {
    //         $scope.$broadcast('loadError');
    //     } else {
    //         data.crossfilter.forEach(function(d) {
    //             d.dd = timeFormat(d.time, 'strdDateObj');
    //             d.hour = d3.time.hour(d.dd);
    //             d.count = +d.count;
    //         });
    //         $scope.crossfilterData = crossfilter(data.crossfilter);
    //         $scope.data = data;

    //         $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
    //         $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
    //         $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);
    //         var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
    //         var geoGroup = geoDimension.group().reduceSum(function (d) {
    //             return d.count;
    //         });
    //         $scope.$broadcast('geoChart', geoDimension, geoGroup);
    //         var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
    //         var barGroupPre = barDimension.group();
    //         var barGroup = barGroupPre.reduce(
    //             function(p, v) {
    //                 if (v.ioc_severity === 1) {
    //                     p.guarded += v.count;
    //                 }
    //                 if (v.ioc_severity === 2) {
    //                     p.elevated += v.count;
    //                 }
    //                 if (v.ioc_severity === 3) {
    //                     p.high += v.count;
    //                 }
    //                 if (v.ioc_severity === 4) {
    //                     p.severe += v.count;
    //                 }
    //                 if (v.ioc_severity === null) {
    //                     p.other += v.count;
    //                 }
    //                 return p;
    //             },
    //             function(p, v) {
    //                 if (v.ioc_severity === 1) {
    //                     p.guarded -= v.count;
    //                 }
    //                 if (v.ioc_severity === 2) {
    //                     p.elevated -= v.count;
    //                 }
    //                 if (v.ioc_severity === 3) {
    //                     p.high -= v.count;
    //                 }
    //                 if (v.ioc_severity === 4) {
    //                     p.severe -= v.count;
    //                 }
    //                 if (v.ioc_severity === null) {
    //                     p.other -= v.count;
    //                 }
    //                 return p;
    //             },
    //             function() {
    //                 return {
    //                     guarded:0,
    //                     elevated:0,
    //                     high:0,
    //                     severe:0,
    //                     other:0
    //                 };
    //             }
    //         );
    //         $scope.$broadcast('barChart', barDimension, barGroup, 'severity');
    //         $scope.barChartxAxis = '';
    //         $scope.barChartyAxis = '# IOC / Hour';
    //         $scope.$broadcast('severityLoad');
    //     }
    // });
}]);