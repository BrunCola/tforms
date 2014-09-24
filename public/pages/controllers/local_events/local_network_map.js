'use strict';

angular.module('mean.pages').controller('localNetworkMapController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/local_network_map?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/local_events/local_network_map?';
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
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            var divHeight = 620;
            $scope.$broadcast('networkChart', data.network);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);