'use strict';

angular.module('mean.pages').controller('iocEventsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$interval', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, $interval, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/ioc_notifications/ioc_events?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/ioc_notifications/ioc_events?';
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            processData(data, false);            
        }
    });
    //auto refresh using angular interval
    var refreshPeriod = 60000; //in milliseconds (60 seconds)
    var newIocFound = false; //flag to track if a new IOC was found - gets reset after the new IOC is pushed to the directives
    //default values for newEnd and newStart
    var newEnd = new Date().getTime() / 1000; 
    var newStart = newEnd - refreshPeriod / 1000;
    //for keeping track of original start time, given no user-set params:
    var oldStart = Math.round(new Date().getTime() / 1000)-((3600*24)); //default date range is usually 1
    //timeout interval - repeated until user navigates away from page
    //count to keep track of number of refreshes - every 10 we'll do a larger query...
    var promise = $interval(function() {
        if ($location.$$search.start && $location.$$search.end) {
            newEnd = parseInt($location.$$search.end) + refreshPeriod / 1000;
            if(newIocFound) {//only update $location.$$search.end (which controls newStart) if new IOC is found, 
                //otherwise, keep growing the time slicey
                $location.$$search.end = "" + (newEnd - (refreshPeriod / 1000) * 5);
                newIocFound = false; //reset the flag
            }
            newStart = $location.$$search.end;            
            query = '/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;
            //update $location.$$search.start to use it for filtering out old data
            $location.$$search.start = "" + (parseInt($location.$$search.start) + refreshPeriod / 1000);

        } else {
            newEnd = new Date().getTime() / 1000; 
            if(newIocFound) {//reset the newStart to 3 refresh period away from newEnd
                newStart = newEnd - (refreshPeriod / 1000) * 5; 
                newIocFound = false; //reset the flag
            } //otherwise keep the newStart the same, so that the timeslice grows
            query = '/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;

            oldStart = oldStart + refreshPeriod / 1000;
        }
        $http({method: 'GET', url: query}).
        success(function(data) {
            processData(data, true);
        });
    }, refreshPeriod);

    //stop the interval when the user navigates away from the page
    $scope.$on("$destroy", function(event) {     
            $interval.cancel(promise);
        }
    );

    //this function handles data returned from the server, both on page load and on refresh
    //autoRefresh is boolean (true if data call is coming from refresh)
    function processData(data, autoRefresh) {
        data.crossfilter.forEach(function(d) {
            d.dd = timeFormat(d.time, 'strdDateObj');
            d.hour = d3.time.hour(d.dd);
            d.count = +d.count;
        }); 

        //first, handle crossfilter data
        var newCrossfilterData = false;

        //add new data to crossfilter, if it's coming from a refresh
        //or create the crossfilter using the whole data set, if a fresh page load
        if(autoRefresh && data.crossfilter.length > 0) {
            $scope.crossfilterData.add(data.crossfilter);
            newCrossfilterData = true;
            newIocFound = true;
        } else if(!autoRefresh) { //fresh page load
            $scope.crossfilterData = crossfilter(data.crossfilter);
            $scope.data = data;
            newCrossfilterData = true;
        } 

        //filter out old data from the crossfilter
        if(autoRefresh) {
            var timeDimension = $scope.crossfilterData.dimension(function(d) { return d.time; });
            //filter by date smaller than the old start (previously moved up by one refresh period)
            timeDimension.filter(function(d){
                if($location.$$search.start) {
                    return d < parseInt($location.$$search.start);
                } else {
                    return d < oldStart;
                }
            });
            //if something has been filtered, newCrossfilterData = true (will push to directives)
            newCrossfilterData = timeDimension.top(Infinity).length > 0;

            //remove the filtered data from crossfilter
            $scope.crossfilterData.remove();
            //add back the other data (I think this is needed)
            timeDimension.filterAll();
        }

        //if it's a fresh page load or a refresh which pulled new data, process and push to directives
        if(newCrossfilterData) {
            var rowDimension = $scope.crossfilterData.dimension(function(d) { return d.ioc + d.ioc_severity; });
            var rowGroupPre = rowDimension.group().reduceSum(function(d) { return d.count; });
            var rowGroup = rowGroupPre.reduce(
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
                }
            );
            $scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');

            var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
            var geoGroup = geoDimension.group().reduceSum(function (d) {
                return d.count;
            });
            $scope.$broadcast('geoChart', geoDimension, geoGroup);
            var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour; });
            var barGroupPre = barDimension.group();
            var barGroup = barGroupPre.reduce(
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

            if(autoRefresh) {
                $scope.$broadcast('severityUpdate');
            } else {
                $scope.$broadcast('severityLoad');
            }
        }

        //now data table
        var newTableData = false;

        if(autoRefresh && data.tables[0] != null) {
            // $scope.tableCrossfitler.add(data.tables[0].aaData);
            $scope.tableCrossfitler.add(data.tables[0].aaData);//JUST FOR TESTING
            newTableData = true;
            newIocFound = true;
        } else if(!autoRefresh) { //fresh page load
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            newTableData = true;
        } 

        //filter out old data from the crossfilter
        if(autoRefresh) {
            var timeDimension = $scope.tableCrossfitler.dimension(function(d) { return d.time; });
            //filter by date smaller than the old start (previously moved up by one refresh period)
            timeDimension.filter(function(d){
                if($location.$$search.start) {
                    return d < parseInt($location.$$search.start);
                } else {
                    return d < oldStart;
                }
            });
            //if something has been filtered, newTableData = true (will push to directives)
            newTableData = timeDimension.top(Infinity).length > 0;

            //remove the filtered data from crossfilter
            $scope.tableCrossfitler.remove();
            //add back the other data (I think this line is needed...)
            timeDimension.filterAll();
        }

        if(newTableData) {
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            if(autoRefresh) {
                $scope.$broadcast('tableUpdate', $scope.tableData, $scope.data.tables, null);
            } else {
                $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            }
            
        } 
    }

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
}]);
