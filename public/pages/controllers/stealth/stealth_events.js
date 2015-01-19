'use strict';

angular.module('mean.pages').controller('stealthEventsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat, runPage) {
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
            get: '/api/stealth/stealth_events/crossfilter', // no get default to main url, strings will replace the default (otherwise /[from root])
            visuals: [
                {
                    type: 'barchart',
                    settings: { 
                        type: 'bar',
                        xAxis: '',
                        yAxis: 'Endpoint Events / Hour'
                    },
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.hour; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function(d) { return d.count });
                    },
                    outgoingFilter: { // Optional and ingests an array of KEYS for other visuals not of this type to match
                        'table': 'time'
                    }
                }
            ]
        },
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
            get: '/api/stealth/stealth_events/crossfilterpie', // no get default to main url, strings will replace the default (otherwise /[from root])
            visuals: [
                {
                    type: 'piechart',
                    settings: { 
                        type: 'application',
                        xAxis: '',
                        yAxis: ''
                    },
                    dimension: function(cfObj) { 
                        var countDimension = cfObj.dimension(function(d) { return d.count }).top(10).map(function(d){ return d.pie_dimension });
                        return cfObj.dimension(function(d) { 
                            if(countDimension.indexOf(d.pie_dimension) !== -1) {
                                return d.pie_dimension;
                            } else {
                                return "Other";
                            }
                        });
                    },
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function (d) { return d.count; });
                    },
                    outgoingFilter: { // Optional and ingests an array of KEYS for other visuals not of this type to match
                        'table': 'pie_dimension'
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
            get: '/api/stealth/stealth_events/table',
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
    //     query = '/api/stealth/stealth_events?start='+$location.$$search.start+'&end='+$location.$$search.end;
    // } else {
    //     query = '/api/stealth/stealth_events?';
    // }
    // $http({method: 'GET', url: query}).
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
    //         $scope.piechartData = crossfilter(data.piechart);
    //         $scope.data = data;

    //         $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
    //         $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
    //         $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);

    //         var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
    //         var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
    //         $scope.$broadcast('barChart', barDimension, barGroup, 'bar');
    //             $scope.barChartxAxis = '';
    //             $scope.barChartyAxis = 'Endpoint Events / Hour';

    //         var countDimension = $scope.piechartData.dimension(function(d) { return d.count }).top(10).map(function(d){ return d.pie_dimension });
    //         $scope.appDimension = $scope.piechartData.dimension(function(d) { 
    //             if(countDimension.indexOf(d.pie_dimension) !== -1) {
    //                 return d.pie_dimension;
    //             } else {
    //                 return "Other";
    //             }
    //         });                 
    //         $scope.pieGroup = $scope.appDimension.group().reduceSum(function (d) {
    //             return d.count;
    //         });
    //         // console.log(pieGroup.top(Infinity));
    //         $scope.$broadcast('pieChart', 'application');
    //     }
    // });
}]);