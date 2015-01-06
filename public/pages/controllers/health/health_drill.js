'use strict';

angular.module('mean.pages').controller('healthDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/health/health_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&zone='+$location.$$search.zone+'&client='+$location.$$search.client;
    } else {
        query = '/api/health/health_drill?zone='+$location.$$search.zone+'&client='+$location.$$search.client;
    }
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            // $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);
            $scope.$broadcast('tableLoad', null, $scope.data.tables, 'drill');
            $scope.$broadcast('spinnerHide');
        }
    });
}]);