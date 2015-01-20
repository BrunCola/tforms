angular.module('mean.system').controller('archiveController', ['$scope', 'Global', '$http', '$rootScope', '$location', 'timeFormat', 'runPage', function ($scope, Global, $http, $rootScope, $location, timeFormat, runPage) {
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
            get: '/api/archive/crossfilter', // no get default to main url, strings will replace the default (otherwise /[from root])
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
                    outgoingFilter: { // Optional and ingests an array of KEYS for other visuals not of this type to match
                        'table': 'time'
                    }
                },
                {
                    type: 'geochart',
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.remote_country; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function (d) {
                            return d.count;
                        });
                    },
                    outgoingFilter: { // Optional and ingests an array of KEYS for other visuals not of this type to match
                        'table': 'remote_country'
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
            get: '/api/archive/table',
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

    $rootScope.rootpage = true;
    $scope.archiveBtn = true;
    $scope.emptyarchive = function() {
        var r = confirm("Are you sure?");
        if (r === true) {
            $http({method: 'POST', url: '/api/actions/clear'}).
            success(function(data, status, headers, config) {
                // $route.reload();
                $location.path('/');
            }).
            error(function(data, status, headers, config) {
                alert('There was an error clearing Archive. Please try again in a couple minutes.')
            });
        }
    }
    $rootScope.rootpage = true;
}]);