'use strict';

angular.module('mean.pages').controller('appByApplicationController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
     query = '/applications/app_by_application?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/applications/app_by_application?';
    }
    $http({method: 'GET', url: query}).
        //success(function(data, status, headers, config) {
        success(function(data) {
            if (data.tables[0] === null) {
                $scope.$broadcast('loadError');
            } else {
                var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
                data.crossfilter.forEach(function(d) {
                    d.dd = dateFormat.parse(d.time);
                    d.hour = d3.time.hour(d.dd);
                    d.in_bytes = parseInt(d.in_bytes);
                    d.count = +d.count;
                });
                $scope.crossfilterData = crossfilter(data.crossfilter);
                $scope.piechartData = crossfilter(data.piechart);
                $scope.data = data;

                $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
                $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
                $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

                var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
                var barGroupPre = barDimension.group();
                var barGroup = barGroupPre.reduce(
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
                $scope.$broadcast('barChart', barDimension, barGroup, 'bandwidth');

                var countDimension = $scope.piechartData.dimension(function(d) { return d.app_count }).top(10).map(function(d){ return d.l7_proto });
                $scope.appDimension = $scope.piechartData.dimension(function(d) { 
                    if(countDimension.indexOf(d.l7_proto) !== -1) {
                        return d.l7_proto;
                    } else {
                        return "Other";
                    }
                });                 
                $scope.pieGroup = $scope.appDimension.group().reduceSum(function (d) {
                    return d.app_count;
                });
                // console.log(pieGroup.top(Infinity));
                $scope.$broadcast('pieChart', 'application');

                $scope.barChartxAxis = '';
                $scope.barChartyAxis = '# MB / Hour';
            }
        });
}]);