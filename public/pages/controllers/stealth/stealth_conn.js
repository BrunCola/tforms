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
            var crossfilterconcat = data.crossfilter.concat(data.cf_stealth_conn,data.cf_stealth_drop);
            crossfilterconcat.forEach(function(d) {
                d.dd = timeFormat(d.time, 'strdDateObj');
                d.hour = d3.time.hour(d.dd);
            });
            $scope.crossfilterData = crossfilter(crossfilterconcat);
            $scope.data = data;
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
                        p.out_bytes2 += v.out_bytes2;
                    }
                    if(v.in_bytes3!==undefined){
                        p.in_bytes3 += v.in_bytes3;
                    }
                    if(v.out_bytes3!==undefined){
                        p.out_bytes3 += v.out_bytes3;
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
                    return p;
                },
                function() {
                    return {
                        in_bytes: 0,
                        out_bytes: 0,
                        in_bytes2: 0,
                        out_bytes2: 0,
                        in_bytes3: 0,
                        out_bytes3: 0
                    };
                }
            );
            $scope.$broadcast('barChart', barDimension, barGroup, 'stealthtraffic');
            $scope.barChartxAxis = '';
            $scope.barChartyAxis = '# MB / Hour';
        }
    });
}]);