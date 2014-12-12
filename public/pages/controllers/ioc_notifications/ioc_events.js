'use strict';

angular.module('mean.pages').controller('iocEventsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$interval', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, $interval, timeFormat) {
    $scope.global = Global;
    var query;
    var crossfilterTimeDimension, tableTimeDimension, rowDimension, rowGroup, geoDimension, geoGroup, barDimension, barGroup;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/ioc_notifications/ioc_events?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/api/ioc_notifications/ioc_events?';
    }
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else { 
            data.crossfilter.forEach(function(d) {
                d.dd = timeFormat(d.time, 'strdDateObj');
                d.hour = d3.time.hour(d.dd);
                d.count = +d.count;
            });
            $scope.crossfilterData = crossfilter(data.crossfilter);
            $scope.data = data;
            crossfilterTimeDimension = $scope.crossfilterData.dimension(function(d) { return d.time; });
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            tableTimeDimension = $scope.tableCrossfitler.dimension(function(d) { return d.time; });
            rowDimension = $scope.crossfilterData.dimension(function(d) { return d.ioc + d.ioc_severity; });
            var rowGroupPre = rowDimension.group().reduceSum(function(d) { return d.count; });
            rowGroup = rowGroupPre.reduce(
                function (d, v) {
                    //++d.count;
                    d.severity = v.ioc_severity - 1;
                    d.count += v.count;
                    return d;
                },
                /* callback for when data is removed from the current filter results */
                function (d, v) {
                    //--d.count;
                    d.severity = v.ioc_severity - 1;
                    d.count -= v.count;
                    return d;
                },
                /* initialize d */
                function () {
                    return {count: 0, severity: 0};
                },
                function (d) {
                    return d.severity;
                }
            );
            $scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');
            geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
            geoGroup = geoDimension.group().reduceSum(function (d) {
                return d.count;
            });
            $scope.$broadcast('geoChart', geoDimension, geoGroup);
            barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour; });
            var barGroupPre = barDimension.group();
            barGroup = barGroupPre.reduce(
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
            $scope.$broadcast('barChart', barDimension, barGroup, 'severity');
            $scope.barChartxAxis = '';
            $scope.barChartyAxis = '# IOC / Hour';
            $scope.$broadcast('severityLoad');
        }
    });
    //first time through, call to populate summary sections
    getSummaryInfo(query);


    //*****************
    // AUTO REFRESH
    //*****************
    //auto refresh using angular interval
    var refreshPeriod = 60000; //in milliseconds (60 seconds)
    var newIocFound = false; //flag to track if a new IOC was found - gets reset after the new IOC is pushed to the directives

    //default values for newEnd and newStart
    var newEnd, newStart;
    if($location.$$search.start && $location.$$search.end) {
        newEnd = parseInt($location.$$search.end) + refreshPeriod / 1000;
        newStart = $location.$$search.end;
    } else {
        newEnd = new Date().getTime() / 1000; 
        newStart = newEnd - refreshPeriod / 1000;
    }

    //for keeping track of original start time, given no user-set params:
    var oldStart = Math.round(new Date().getTime() / 1000)-((3600*24)); //default date range is usually 1 day
    //timeout interval - repeated until user navigates away from page
    var promise = $interval(function() {
        if ($location.$$search.start && $location.$$search.end) {
            newEnd = newEnd + refreshPeriod / 1000; //move newEnd forward
            if(newIocFound) {//only update $location.$$search.end (which controls newStart) if new IOC is found, 
                //otherwise, keep growing the time slice
                //start time moved to 5 minutes before new end time, to give a wider search, accounting for delay between IOC ident and insertion into DB
                $location.$$search.end = "" + (newEnd - (refreshPeriod / 1000) * 5);
                newStart = $location.$$search.end; //update newStart...
                newIocFound = false; //reset the flag
            }         
            query = '/api/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;

            //update $location.$$search.start to use it for filtering out old data
            $location.$$search.start = "" + (parseInt($location.$$search.start) + refreshPeriod / 1000);
        } else {
            newEnd = new Date().getTime() / 1000; //automatically moves forward by one refreshPeriod
            if(newIocFound) {//reset the newStart to 5 refresh period away from newEnd
                //start time moved to 5 minutes before new end time, to give a wider search, accounting for delay between IOC ident and insertion into DB
                newStart = newEnd - (refreshPeriod / 1000) * 5; 
                newIocFound = false; //reset the flag
            } //otherwise keep the newStart the same, so that the timeslice grows
            query = '/api/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;

            oldStart = oldStart + refreshPeriod / 1000; //move the start forward by a refresh period to use for filtering old data
        }
        $http({method: 'GET', url: query}).
        success(function(data) {
            processData(data);
        });
    }, refreshPeriod);

    //stop the interval when the user navigates away from the page
    $scope.$on("$destroy", function(event) {     
            $interval.cancel(promise);
        }
    ); 

    function processData(data) {
        //*******************
        // CROSSFILTER
        //*******************
        var newCrossfilterData = false;

        data.crossfilter.forEach(function(d) {
            d.dd = timeFormat(d.time, 'strdDateObj');
            d.hour = d3.time.hour(d.dd);
            d.count = +d.count;
        }); 

        if(data.crossfilter.length > 0) {
            $scope.crossfilterData.add(data.crossfilter);

            newIocFound = true;
            newCrossfilterData = true;

            //filter by date smaller than the old start (previously moved up by one refresh period)
            crossfilterTimeDimension.filter(function(d){
                if($location.$$search.start) {
                    return d < parseInt($location.$$search.start);
                } else {
                    return d < oldStart;
                }
            });

            //remove the filtered data from crossfilter
            $scope.crossfilterData.remove();
            //add back the other data (I think this is needed)
            crossfilterTimeDimension.filterAll();

            $scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');
            $scope.$broadcast('geoChart', geoDimension, geoGroup);
            $scope.$broadcast('barChart', barDimension, barGroup, 'severity');
            $scope.$broadcast('severityUpdate');
        }

        //*******************
        // DATA TABLE
        //*******************
        var newTableData = false;

        if(data.tables[0] != null) {
            $scope.tableCrossfitler.add(data.tables[0].aaData);//JUST FOR TESTING

            newIocFound = true;
            newTableData = true;

            //filter by date smaller than the old start (previously moved up by one refresh period)
            tableTimeDimension.filter(function(d){
                if($location.$$search.start) {
                    return d < parseInt($location.$$search.start);
                } else {
                    return d < oldStart;
                }
            });

            //remove the filtered data from crossfilter
            $scope.tableCrossfitler.remove();
            //add back the other data (I think this line is needed...)
            tableTimeDimension.filterAll();

            $scope.$broadcast('tableUpdate', $scope.tableData, $scope.data.tables, null); 
        }

        //SUMMARY STUFF
        if(newCrossfilterData || newTableData) {
            var query;
            if($location.$$search.start && $location.$$search.end) {
                query = '/api/ioc_notifications/ioc_events?start='+$location.$$search.start+'&end='+newEnd;
            } else {
                query = '/api/ioc_notifications/ioc_events?start='+oldStart+'&end='+newEnd;
            }
            getSummaryInfo(query);
        }
    }

    //*******************
    // SUMMARY SECTIONS
    //*******************
    function getSummaryInfo(query) {
        $http({method: 'GET', url: query+'&type=ioc_notifications'}).
        success(function(data) {
            $scope.ioc_notifications = data[0].count;
        });
        $http({method: 'GET', url: query+'&type=ioc_groups'}).
        success(function(data) {
            $scope.ioc_groups = data;
        });
        $http({method: 'GET', url: query+'&type=local_ips'}).
        success(function(data) {
            $scope.local_ips = data;
        });
        $http({method: 'GET', url: query+'&type=remote_ip'}).
        success(function(data) {
            $scope.remote_ip = data;
        });
        $http({method: 'GET', url: query+'&type=query'}).
        success(function(data) {
            $scope.query = data;
        });
        $http({method: 'GET', url: query+'&type=host'}).
        success(function(data) {
            $scope.hostt = data;
        });
        $http({method: 'GET', url: query+'&type=remote_ip_ssl'}).
        success(function(data) {
            $scope.remote_ip_ssl = data;
        });
        $http({method: 'GET', url: query+'&type=name'}).
        success(function(data) {
            $scope.file_name = data;
        });
        $http({method: 'GET', url: query+'&type=l7_proto'}).
        success(function(data) {
            $scope.l7_protoo = data;
        });
        $http({method: 'GET', url: query+'&type=remote_country'}).
        success(function(data) {
            $scope.remote_country = data;
        });
        //////////////////////////////////
        //////////////////////////////////
        $http({method: 'GET', url: query+'&type=bandwidth_in'}).
        success(function(data) {
            $scope.bandwidth_in = data[0].bandwidth+' Kb/s';
        });
        $http({method: 'GET', url: query+'&type=bandwidth_out'}).
        success(function(data) {
            $scope.bandwidth_out = data[0].bandwidth+' Kb/s';
        });
        $http({method: 'GET', url: query+'&type=new_ip'}).
        success(function(data) {
            $scope.new_ip = data;
        });
        $http({method: 'GET', url: query+'&type=new_dns'}).
        success(function(data) {
            $scope.new_dns = data;
        });
        $http({method: 'GET', url: query+'&type=new_http'}).
        success(function(data) {
            $scope.new_http = data;
        });
        $http({method: 'GET', url: query+'&type=new_ssl'}).
        success(function(data) {
            $scope.new_ssl = data;
        });
        $http({method: 'GET', url: query+'&type=new_layer7'}).
        success(function(data) {
            $scope.new_layer7 = data;
        });
        $http({method: 'GET', url: query+'&type=conn_meta'}).
        success(function(data) {
            $scope.conn_meta = data;
        });
        $http({method: 'GET', url: query+'&type=remote_ip_conn_meta'}).
        success(function(data) {
            $scope.remote_ip_conn_meta = data;
        });
        $http({method: 'GET', url: query+'&type=remote_country_conn_meta'}).
        success(function(data) {
            $scope.remote_country_conn_meta = data;
        });
    }
}]);
