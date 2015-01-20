'use strict';

angular.module('mean.pages').controller('l7RemoteDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat, runPage, Crossfilter) {
    $scope.global = Global;
    var query;
    
    
    // var query = '/ioc_notifications/ioc_events'; // string with no '?' at end - function should have a check for url construction
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
            get: '/api/applications/l7_remote_drill/crossfilter', // no get default to main url, strings will replace the default (otherwise /[from root])
            visuals: [
                {
                    type: 'barchart',
                    settings: { 
                        type: 'bandwidth',
                        xAxis: '',
                        yAxis: '# MB / Hour'
                    },
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.hour; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduce(
                            function(p, v) {
                                p.in_bytes += v.in_bytes;
                                p.out_bytes += v.out_bytes;
                                return p;
                            },
                            function(p, v) {
                                p.in_bytes -= v.in_bytes;
                                p.out_bytes -= v.out_bytes;
                                return p;
                            },
                            function() {
                                return {
                                    in_bytes: 0,
                                    out_bytes: 0
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
            get: '/api/applications/l7_remote_drill/table',
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

}]);