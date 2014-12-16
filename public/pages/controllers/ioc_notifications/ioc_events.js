'use strict';

angular.module('mean.pages').controller('iocEventsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$interval', 'timeFormat', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, $interval, timeFormat, runPage) {
    $scope.global = Global;
    var query;
    // var crossfilterTimeDimension, tableTimeDimension, rowDimension, rowGroup, geoDimension, geoGroup, barDimension, barGroup;
    // if ($location.$$search.start && $location.$$search.end) {
    //     query = '/ioc_notifications/ioc_events?start='+$location.$$search.start+'&end='+$location.$$search.end;
    // } else {
    //     query = '/ioc_notifications/ioc_events?';
    // }
    $scope.crossfilterData = crossfilter();
    var tableCrossfitler = crossfilter();
    // var query = '/ioc_notifications/ioc_events'; // string with no '?' at end - function should have a check for url construction

    var page = [
        /////////////////
        // CROSSFILTER //
        /////////////////
        {
            type: 'crossfilter', // required
            crossfilterObj: $scope.crossfilterData, // required (if crossfilter)
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
            get: '/api/ioc_notifications/ioc_events/crossfilter', // no get default to main url, strings will replace the default (otherwise /[from root])
            visuals: [
                {
                    type: 'rowchart', // required
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.ioc + d.ioc_severity; })}, // required
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function(d) { 
                            return d.count; 
                        }).reduce(
                            function (d, v) {
                                //++d.count;
                                d.severity = v.ioc_severity - 1;
                                d.count += v.count;
                                return d;
                            },
                            // callback for when data is removed from the current filter results 
                            function (d, v) {
                                //--d.count;
                                d.severity = v.ioc_severity - 1;
                                d.count -= v.count;
                                return d;
                            },
                            /* initialize d */
                            function () {
                                return {count: 0, severity: 0};
                            }
                        )
                    },
                },
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
                },
                {
                    type: 'geochart',
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.remote_country; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function (d) {
                            return d.count;
                        });
                    },
                }
            ]
        },
        /////////////////
        ///// TABLE /////
        /////////////////
        {
            type: 'table', // required either array or single object
            crossfilterObj: tableCrossfitler, // required (if crossfilter)
            key: 'tables', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            // get: '' // no get default to main url, strings will replace the default
        },
        //////////////////
        /////  VARS  /////
        //////////////////
        {
            type: 'var',
            name: 'ioc_notifications', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            // GETparams: [],
            get: '/api/ioc_notifications/ioc_events/ioc_notifications'
            // run: function() { // optional run function that can handle the return and assign it to the scope obj

            // }
        },
        {
            type: 'var',
            name: 'ioc_groups', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            // params: [],
            get: '/api/ioc_notifications/ioc_events/ioc_groups'
        },
        {
            type: 'var',
            name: 'local_ips', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/local_ips'
        },
        {
            type: 'var',
            name: 'remote_ip', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/remote_ip'
        },
        {
            type: 'var',
            name: 'query', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/query'
        },
        {
            type: 'var',
            name: 'host', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/host'
        },
        {
            type: 'var',
            name: 'remote_ip_ssl', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/remote_ip_ssl'
        },
        {
            type: 'var',
            name: 'file_name', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/name'
        },
        {
            type: 'var',
            name: 'remote_country', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/remote_country'
        },
        {
            type: 'var',
            name: 'bandwidth_in', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'bandwidth',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/bandwidth_in',
            run: function(data) {
                return data+' Kb/s';
            }
        },
        {
            type: 'var',
            name: 'bandwidth_out', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'bandwidth',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/bandwidth_out',
            run: function(data) {
                return data+' Kb/s';
            }
        },
        {
            type: 'var',
            name: 'new_ip', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/new_ip'
        },
        {
            type: 'var',
            name: 'new_dns', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/new_dns'
        },
        {
            type: 'var',
            name: 'new_http', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/new_http'
        },
        {
            type: 'var',
            name: 'new_ssl', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/new_ssl'
        },
        {
            type: 'var',
            name: 'new_layer7', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/new_layer7'
        },
        {
            type: 'var',
            name: 'conn_meta', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/conn_meta'
        },
        {
            type: 'var',
            name: 'remote_ip_conn_meta', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/remote_ip_conn_meta'
        },
        {
            type: 'var',
            name: 'remote_country_conn_meta', // required (if var)
            refresh: true, // optional, no if undefined
            key: 'count',
            get: '/api/ioc_notifications/ioc_events/ioc_notifications/remote_country_conn_meta'
        },
    ];
    runPage($scope, page);

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
    //         crossfilterTimeDimension = $scope.crossfilterData.dimension(function(d) { return d.time; });
    //         $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
    //         $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
    //         $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
    //         tableTimeDimension = $scope.tableCrossfitler.dimension(function(d) { return d.time; });
    //         rowDimension = $scope.crossfilterData.dimension(function(d) { return d.ioc + d.ioc_severity; });
    //         var rowGroupPre = rowDimension.group().reduceSum(function(d) { return d.count; });
    //         rowGroup = rowGroupPre.reduce(
    //             function (d, v) {
    //                 //++d.count;
    //                 d.severity = v.ioc_severity - 1;
    //                 d.count += v.count;
    //                 return d;
    //             },
    //             /* callback for when data is removed from the current filter results */
    //             function (d, v) {
    //                 //--d.count;
    //                 d.severity = v.ioc_severity - 1;
    //                 d.count -= v.count;
    //                 return d;
    //             },
    //             /* initialize d */
    //             function () {
    //                 return {count: 0, severity: 0};
    //             }
    //         );
    //         $scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');
    //         geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
    //         geoGroup = geoDimension.group().reduceSum(function (d) {
    //             return d.count;
    //         });
    //         $scope.$broadcast('geoChart', geoDimension, geoGroup);
    //         barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour; });
    //         var barGroupPre = barDimension.group();
    //         barGroup = barGroupPre.reduce(
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
    // //first time through, call to populate summary sections
    // getSummaryInfo(query);

    // //*****************
    // // AUTO REFRESH
    // //*****************
    // //auto refresh using angular interval
    // var refreshPeriod = 60000; //in milliseconds (60 seconds)
    // var newIocFound = false; //flag to track if a new IOC was found - gets reset after the new IOC is pushed to the directives

    // //default values for newEnd and newStart
    // var newEnd, newStart;
    // if($location.$$search.start && $location.$$search.end) {
    //     newEnd = parseInt($location.$$search.end) + refreshPeriod / 1000;
    //     newStart = $location.$$search.end;
    // } else {
    //     newEnd = new Date().getTime() / 1000; 
    //     newStart = newEnd - refreshPeriod / 1000;
    // }

    // //for keeping track of original start time, given no user-set params:
    // var oldStart = Math.round(new Date().getTime() / 1000)-((3600*24)); //default date range is usually 1 day
    // //timeout interval - repeated until user navigates away from page
    // var promise = $interval(function() {
    //     if ($location.$$search.start && $location.$$search.end) {
    //         newEnd = newEnd + refreshPeriod / 1000; //move newEnd forward
    //         if(newIocFound) {//only update $location.$$search.end (which controls newStart) if new IOC is found, 
    //             //otherwise, keep growing the time slice
    //             //start time moved to 5 minutes before new end time, to give a wider search, accounting for delay between IOC ident and insertion into DB
    //             $location.$$search.end = "" + (newEnd - (refreshPeriod / 1000) * 5);
    //             newStart = $location.$$search.end; //update newStart...
    //             newIocFound = false; //reset the flag
    //         }         
    //         query = '/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;

    //         //update $location.$$search.start to use it for filtering out old data
    //         $location.$$search.start = "" + (parseInt($location.$$search.start) + refreshPeriod / 1000);
    //     } else {
    //         newEnd = new Date().getTime() / 1000; //automatically moves forward by one refreshPeriod
    //         if(newIocFound) {//reset the newStart to 5 refresh period away from newEnd
    //             //start time moved to 5 minutes before new end time, to give a wider search, accounting for delay between IOC ident and insertion into DB
    //             newStart = newEnd - (refreshPeriod / 1000) * 5; 
    //             newIocFound = false; //reset the flag
    //         } //otherwise keep the newStart the same, so that the timeslice grows
    //         query = '/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;

    //         oldStart = oldStart + refreshPeriod / 1000; //move the start forward by a refresh period to use for filtering old data
    //     }
    //     $http({method: 'GET', url: query}).
    //     success(function(data) {
    //         processData(data);
    //     });
    // }, refreshPeriod);

    // //stop the interval when the user navigates away from the page
    // $scope.$on("$destroy", function(event) {     
    //         $interval.cancel(promise);
    //     }
    // ); 

    // function processData(data) {
    //     //*******************
    //     // CROSSFILTER
    //     //*******************
    //     var newCrossfilterData = false;

    //     data.crossfilter.forEach(function(d) {
    //         d.dd = timeFormat(d.time, 'strdDateObj');
    //         d.hour = d3.time.hour(d.dd);
    //         d.count = +d.count;
    //     }); 

    //     if(data.crossfilter.length > 0) {
    //         $scope.crossfilterData.add(data.crossfilter);

    //         newIocFound = true;
    //         newCrossfilterData = true;

    //         //filter by date smaller than the old start (previously moved up by one refresh period)
    //         crossfilterTimeDimension.filter(function(d){
    //             if($location.$$search.start) {
    //                 return d < parseInt($location.$$search.start);
    //             } else {
    //                 return d < oldStart;
    //             }
    //         });

    //         //remove the filtered data from crossfilter
    //         $scope.crossfilterData.remove();
    //         //add back the other data (I think this is needed)
    //         crossfilterTimeDimension.filterAll();

    //         $scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');
    //         $scope.$broadcast('geoChart', geoDimension, geoGroup);
    //         $scope.$broadcast('barChart', barDimension, barGroup, 'severity');
    //         $scope.$broadcast('severityUpdate');
    //     }

    //     //*******************
    //     // DATA TABLE
    //     //*******************
    //     var newTableData = false;

    //     if(data.tables[0] != null) {
    //         $scope.tableCrossfitler.add(data.tables[0].aaData);//JUST FOR TESTING

    //         newIocFound = true;
    //         newTableData = true;

    //         //filter by date smaller than the old start (previously moved up by one refresh period)
    //         tableTimeDimension.filter(function(d){
    //             if($location.$$search.start) {
    //                 return d < parseInt($location.$$search.start);
    //             } else {
    //                 return d < oldStart;
    //             }
    //         });

    //         //remove the filtered data from crossfilter
    //         $scope.tableCrossfitler.remove();
    //         //add back the other data (I think this line is needed...)
    //         tableTimeDimension.filterAll();

    //         $scope.$broadcast('tableUpdate', $scope.tableData, $scope.data.tables, null); 
    //     }

    //     //SUMMARY STUFF
    //     if(newCrossfilterData || newTableData) {
    //         var query;
    //         if($location.$$search.start && $location.$$search.end) {
    //             query = '/ioc_notifications/ioc_events?start='+$location.$$search.start+'&end='+newEnd;
    //         } else {
    //             query = '/ioc_notifications/ioc_events?start='+oldStart+'&end='+newEnd;
    //         }
    //         getSummaryInfo(query);
    //     }
    // }

    // //*******************
    // // SUMMARY SECTIONS
    // //*******************
    // function getSummaryInfo(query) {
    //     $http({method: 'GET', url: query+'&type=ioc_notifications'}).
    //     success(function(data) {
    //         $scope.ioc_notifications = data[0].count;
    //     });
    //     $http({method: 'GET', url: query+'&type=ioc_groups'}).
    //     success(function(data) {
    //         $scope.ioc_groups = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=local_ips'}).
    //     success(function(data) {
    //         $scope.local_ips = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=remote_ip'}).
    //     success(function(data) {
    //         $scope.remote_ip = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=query'}).
    //     success(function(data) {
    //         $scope.query = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=host'}).
    //     success(function(data) {
    //         $scope.hostt = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=remote_ip_ssl'}).
    //     success(function(data) {
    //         $scope.remote_ip_ssl = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=name'}).
    //     success(function(data) {
    //         $scope.file_name = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=l7_proto'}).
    //     success(function(data) {
    //         $scope.l7_protoo = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=remote_country'}).
    //     success(function(data) {
    //         $scope.remote_country = data;
    //     });
    //     //////////////////////////////////
    //     //////////////////////////////////
    //     $http({method: 'GET', url: query+'&type=bandwidth_in'}).
    //     success(function(data) {
    //         $scope.bandwidth_in = data[0].bandwidth+' Kb/s';
    //     });
    //     $http({method: 'GET', url: query+'&type=bandwidth_out'}).
    //     success(function(data) {
    //         $scope.bandwidth_out = data[0].bandwidth+' Kb/s';
    //     });
    //     $http({method: 'GET', url: query+'&type=new_ip'}).
    //     success(function(data) {
    //         $scope.new_ip = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=new_dns'}).
    //     success(function(data) {
    //         $scope.new_dns = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=new_http'}).
    //     success(function(data) {
    //         $scope.new_http = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=new_ssl'}).
    //     success(function(data) {
    //         $scope.new_ssl = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=new_layer7'}).
    //     success(function(data) {
    //         $scope.new_layer7 = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=conn_meta'}).
    //     success(function(data) {
    //         $scope.conn_meta = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=remote_ip_conn_meta'}).
    //     success(function(data) {
    //         $scope.remote_ip_conn_meta = data;
    //     });
    //     $http({method: 'GET', url: query+'&type=remote_country_conn_meta'}).
    //     success(function(data) {
    //         $scope.remote_country_conn_meta = data;
    //     });
    // }
}]);
