'use strict';

angular.module('mean.pages').controller('localCoiRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/local_COI_remote?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/local_events/local_COI_remote?';
    }
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (data.force === null) {
            $scope.$broadcast('loadError');
        } else {
            data.force.nodes.forEach(function(d) {
                d.group = 0
            });
            $scope.$broadcast('forceChart', data.force, {height: 1000});
            $scope.$broadcast('spinnerHide');
            
        }
    });
}]);