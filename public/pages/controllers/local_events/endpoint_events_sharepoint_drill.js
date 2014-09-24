'use strict';

angular.module('mean.pages').controller('endpointEventsSharepointDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/endpoint_events_sharepoint_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&event_id='+$location.$$search.event_id+'&lan_ip='+$location.$$search.lan_ip;//+'&lan_zone='+$location.$$search.lan_zone;
    } else {
        query = '/local_events/endpoint_events_sharepoint_drill?event_id='+$location.$$search.event_id+'&lan_ip='+$location.$$search.lan_ip;//+'&lan_zone='+$location.$$search.lan_zone;
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