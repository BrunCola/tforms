'use strict';

angular.module('mean.pages').controller('endpointEventsSharepointFullController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/endpoint_full?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+$location.$$search.lan_ip+'&lan_zone='+$location.$$search.lan_zone+'&lan_user='+$location.$$search.lan_user;
    } else {
        query = '/local_events/endpoint_full?&event_type='+$location.$$search.event_type+'&lan_zone='+$location.$$search.lan_zone+'&lan_user='+$location.$$search.lan_user+'&lan_ip='+$location.$$search.lan_ip;
    }
    $http({method: 'GET', url: query}).
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