'use strict';

angular.module('mean.pages').controller('httpByDomainLocalDrillControllerBlocked', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/http/http_by_domain_local_drill_blocked?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&host='+$location.$$search.host;
    } else {
        query = '/api/http/http_by_domain_local_drill_blocked?lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&host='+$location.$$search.host;
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
            $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);