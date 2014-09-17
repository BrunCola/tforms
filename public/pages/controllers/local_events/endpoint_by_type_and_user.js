'use strict';

angular.module('mean.pages').controller('endpointTypeUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/endpoint_by_type_and_user?start='+$location.$$search.start+'&end='+$location.$$search.end+'&event_type='+$location.$$search.event_type;
    } else {
        query = '/local_events/endpoint_by_type_and_user?&event_type='+$location.$$search.event_type;
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

            $scope.data = data;

            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);