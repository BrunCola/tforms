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
            $scope.forcedata = data.force;
            $scope.$broadcast('forceChart', data.force, {height: 1000});
            $scope.$broadcast('spinnerHide');
        }
    });

    $scope.requery = function(data, button) {
        console.log(data)
        var results = $scope.forcedata.links.filter(function(d){
            if ((d.class !== undefined) && ((d.source.index === data.index) || (d.target.index === data.index))) {
                return d.target;
            }
        })
        console.log(results)
        console.log($scope.forcedata)
        $scope.appendInfo({'test': 'test'})
    }
}]);