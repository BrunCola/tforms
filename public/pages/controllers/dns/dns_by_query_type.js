'use strict';

angular.module('mean.pages').controller('dnsByQueryTypeController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/dns/dns_by_query_type?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/dns/dns_by_query_type?';
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

            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            $scope.$broadcast('spinnerHide');

            var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
            var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
            $scope.$broadcast('barChart', barDimension, barGroup, 'bar');
                $scope.barChartxAxis = '';
                $scope.barChartyAxis = '# DNS Queries / Hour';
        }
    });
}]);