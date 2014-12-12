'use strict';

angular.module('mean.pages').controller('newFtpRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/first_seen/new_ftp_remote?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/api/first_seen/new_ftp_remote?';
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

            var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
            var geoGroup = geoDimension.group().reduceSum(function (d) {
                return d.count;
            });
            $scope.$broadcast('geoChart', geoDimension, geoGroup);
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
            var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
            $scope.$broadcast('barChart', barDimension, barGroup, 'bar');
            $scope.barChartxAxis = '';
            $scope.barChartyAxis = '# New IP / Hour';
        }
    });
}]);