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
    //success(function(data, status, headers, config) {
    // console.log($location.$$search);
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            processData(data, false);            
        }
    });
    //auto refresh using angular interval
    var refreshPeriod = 30000; //in milliseconds (30 seconds)
    var promise = $interval(function() {
        console.log("AUTO REFRESH");
        var newStart, newEnd;
        if ($location.$$search.start && $location.$$search.end) {
            newEnd = parseInt($location.$$search.end) + refreshPeriod / 1000;
            newStart = $location.$$search.end;            

            query = '/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;

            $location.$$search.end = "" + (parseInt($location.$$search.end) + refreshPeriod / 1000);
        } else {
            newEnd = new Date().getTime() / 1000; 
            newStart = newEnd - refreshPeriod / 1000;

            query = '/ioc_notifications/ioc_events?start='+newStart+'&end='+newEnd;
        }
        $http({method: 'GET', url: query}).
        success(function(data) {
            console.log("table data");
            console.log(data.tables[0]);
            console.log("crossfilter data");
            console.log(data.crossfilter);
            //TODO: Filter out the timeslice between the old start and old start + refresh period (and update directives)

            processData(data, true);


        });
    }, refreshPeriod);

    $scope.$on("$destroy", function(event) {     
            $interval.cancel(promise);
        }
    );


    function processData(data, autoRefresh) {
        data.crossfilter.forEach(function(d) {
            d.dd = timeFormat(d.time, 'strdDateObj');
            d.hour = d3.time.hour(d.dd);
            d.count = +d.count;
        }); 

        //first, crossfilter
        var newCrossfilterData = false;

        //if this is a call from an auto refresh, just add the data to the existing crossfilters
        //otherwise create the crossfilters
        // if(autoRefresh) { //for testing...
        //     data.crossfilter = [{
        //         count: 1, 
        //         dd: "Mon Nov 10 2014 09:21:47 GMT+0000 (GMT)",
        //         hour: "Mon Nov 10 2014 09:00:00 GMT+0000 (GMT)",
        //         in_bytes: 0.0018,
        //         ioc: "Known Hostile IP",
        //         ioc_severity: 3,
        //         out_bytes: 0.0022,
        //         remote_country: "United States",
        //         time: 1415640420,
        //     }];

        //     data.tables[0] = {
        //         aaData: [{
        //             in_bytes: 44,
        //             in_packets: 1,
        //             ioc: "Suspected Hostile IP",
        //             ioc_attrID: "200494",
        //             ioc_childID: "200494",
        //             ioc_count: 1,
        //             ioc_rule: "141.212.121.0/24",
        //             ioc_severity: 2,
        //             ioc_typeIndicator: "IP Subnet",
        //             ioc_typeInfection: "Pre-Infection",
        //             lan_ip: "10.0.0.30",
        //             lan_user: "-",
        //             lan_zone: "Dev",
        //             machine: "-",
        //             out_bytes: 84,
        //             out_packets: 2,
        //             proxy_blocked: 0,
        //             remote_asn_name: "UMICH-AS-5",
        //             remote_cc: "US",
        //             remote_country: "United States",
        //             remote_ip: "141.212.121.61",
        //             stealth: 0,
        //             time: 1415725920.396433}],
        //         params: [ 
        //             { sTitle: 'Last Seen',
        //                mData: 'time',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Stealth',
        //                mData: 'stealth',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Severity',
        //                mData: 'ioc_severity',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'IOC Hits',
        //                mData: 'ioc_count',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'IOC',
        //                mData: 'ioc',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'IOC Type',
        //                mData: 'ioc_typeIndicator',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'IOC Stage',
        //                mData: 'ioc_typeInfection',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'IOC Rule',
        //                mData: 'ioc_rule',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Zone',
        //                mData: 'lan_zone',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Machine',
        //                mData: 'machine',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Local User',
        //                mData: 'lan_user',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Local IP',
        //                mData: 'lan_ip',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Remote IP',
        //                mData: 'remote_ip',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Remote Country',
        //                mData: 'remote_country',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Flag',
        //                mData: 'remote_cc',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Remote ASN',
        //                mData: 'remote_asn_name',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Bytes to Remote',
        //                mData: 'in_bytes',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Bytes from Remote',
        //                mData: 'out_bytes',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Packets to Remote',
        //                mData: 'in_packets',
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: 'Packets from Remote',
        //                mData: 'out_packets',
        //                sType: undefined,
        //                bVisible: false,
        //                link: undefined,
        //                sClass: null },
        //              { sTitle: '',
        //                mData: null,
        //                sType: undefined,
        //                bVisible: true,
        //                link: undefined,
        //                sClass: null } ],
        //                sort: [ [ 0, 'desc' ] ],
        //               div: 'table',
        //               title: 'Indicators of Compromise (IOC) Notifications',
        //           };

        //     console.log(data.tables);
        // }
        if(autoRefresh && data.crossfilter.length > 0) {
            $scope.crossfilterData.add(data.crossfilter);
            newCrossfilterData = true;
        } else if(!autoRefresh) { //fresh page load
            $scope.crossfilterData = crossfilter(data.crossfilter);
            $scope.data = data;
            newCrossfilterData = true;
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
        } else if(!autoRefresh) { //fresh page load
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            newTableData = true;
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
