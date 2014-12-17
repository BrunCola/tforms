'use strict';

angular.module('mean.pages').controller('endpointFullController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/local_events/endpoint_full?start='+$location.$$search.start+'&end='+$location.$$search.end+'&event_type='+$location.$$search.event_type+'&lan_zone='+$location.$$search.lan_zone+'&lan_user='+$location.$$search.lan_user;
    } else {
        query = '/api/local_events/endpoint_full?&event_type='+$location.$$search.event_type+'&lan_zone='+$location.$$search.lan_zone+'&lan_user='+$location.$$search.lan_user;
    }
    $http({method: 'GET', url: query}).
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