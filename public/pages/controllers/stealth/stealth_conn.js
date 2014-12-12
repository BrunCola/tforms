'use strict';

angular.module('mean.pages').controller('stealthConnController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/stealth/stealth_conn?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/api/stealth/stealth_conn?';
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            var crossfilterconcat = data.crossfilter.concat(data.cf_stealth_conn, data.cf_stealth_drop, data.cf_stealth_conn_v3, data.cf_stealth_drop_v3);
            crossfilterconcat.forEach(function(d) {
                d.dd = timeFormat(d.time, 'strdDateObj');
                d.hour = d3.time.hour(d.dd);
            });
            $scope.crossfilterData = crossfilter(crossfilterconcat);
            $scope.data = data;
            if ($scope.data.tables.length > 1) {
                for (var x in $scope.data.tables[1].aaData) {
                    $scope.data.tables[0].aaData.push($scope.data.tables[1].aaData[x]);
                }
            }
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
            var barGroupPre = barDimension.group();
            var barGroup = barGroupPre.reduce(
                function(p, v) {
                    if(v.in_bytes!==undefined){
                        p.in_bytes += v.in_bytes;
                    }
                    if(v.out_bytes!==undefined){
                        p.out_bytes += v.out_bytes;
                    }
                    if(v.in_bytes2!==undefined){
                        p.in_bytes2 += v.in_bytes2;
                    }
                    if(v.out_bytes2!==undefined){
                        p.out_bytes2 += v.out_bytes2;data.cf_stealth_conn_v3,data.cf_stealth_drop_v3
                    }
                    if(v.in_bytes3!==undefined){
                        p.in_bytes3 += v.in_bytes3;
                    }
                    if(v.out_bytes3!==undefined){
                        p.out_bytes3 += v.out_bytes3;
                    }
                    if(v.in_bytes4!==undefined){
                        p.in_bytes4 += v.in_bytes4;
                    }
                    if(v.out_bytes4!==undefined){
                        p.out_bytes4 += v.out_bytes4;
                    }
                    if(v.in_bytes5!==undefined){
                        p.in_bytes5 += v.in_bytes5;
                    }
                    if(v.out_bytes5!==undefined){
                        p.out_bytes5 += v.out_bytes5;
                    }
                    return p;
                },
                function(p, v) {
                    if(v.in_bytes!==undefined){
                        p.in_bytes -= v.in_bytes;
                    }
                    if(v.out_bytes!==undefined){
                        p.out_bytes -= v.out_bytes;
                    }
                    if(v.in_bytes2!==undefined){
                        p.in_bytes2 -= v.in_bytes2;
                    }
                    if(v.out_bytes2!==undefined){
                        p.out_bytes2 -= v.out_bytes2;
                    }
                    if(v.in_bytes3!==undefined){
                        p.in_bytes3 -= v.in_bytes3;
                    }
                    if(v.out_bytes3!==undefined){
                        p.out_bytes3 -= v.out_bytes3;
                    }
                    if(v.in_bytes4!==undefined){
                        p.in_bytes4 -= v.in_bytes4;
                    }
                    if(v.out_bytes4!==undefined){
                        p.out_bytes4 -= v.out_bytes4;
                    }
                    if(v.in_bytes5!==undefined){
                        p.in_bytes5 -= v.in_bytes5;
                    }
                    if(v.out_bytes5!==undefined){
                        p.out_bytes5 -= v.out_bytes5;
                    }
                    return p;
                },
                function() {
                    return {
                        in_bytes: 0,
                        out_bytes: 0,
                        in_bytes2: 0,
                        out_bytes2: 0,
                        in_bytes3: 0,
                        out_bytes3: 0,
                        in_bytes4: 0,
                        out_bytes4: 0,
                        in_bytes5: 0,
                        out_bytes5: 0
                    };
                }
            );
            if ((data.cf_stealth_conn_v3.length > 0) || (data.cf_stealth_drop_v3.length > 0)) {
                $scope.$broadcast('barChart', barDimension, barGroup, 'stealthtraffic_v3');
            } else {
                $scope.$broadcast('barChart', barDimension, barGroup, 'stealthtraffic');
            }
            $scope.barChartxAxis = '';
            $scope.barChartyAxis = '# MB / Hour';
        }
    });
}]);