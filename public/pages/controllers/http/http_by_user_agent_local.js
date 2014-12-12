'use strict';

angular.module('mean.pages').controller('httpByUserAgentLocalController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/http/http_by_user_agent_local?start='+$location.$$search.start+'&end='+$location.$$search.end+'&user_agent='+$location.$$search.user_agent;
    } else {
        query = '/api/http/http_by_user_agent_local?user_agent='+$location.$$search.user_agent;
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
            $scope.$broadcast('spinnerHide');
        }
    });
}]);