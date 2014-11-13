'use strict';

angular.module('mean.pages').controller('stealthCoiConnViewController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/stealth/stealth_coi_conn_view?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/stealth/stealth_coi_conn_view?';
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.chord === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.forcedata = data.chord;
            $scope.$broadcast('chordChart', data.chord);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);