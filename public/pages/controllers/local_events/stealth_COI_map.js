'use strict';

angular.module('mean.pages').controller('stealthCoiMapController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    query = '/local_events/stealth_COI_map?';
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (!data.force) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            $scope.$broadcast('stealthForceChart', data.force, {height: 1000});
            $scope.$broadcast('spinnerHide');
        }
    });
    $scope.requery = function(data) {
        var results = [];
        // get children hanging off of parent nodes
        var rTargets = $scope.data.force.links.filter(function(d){
            if (d.source.index === data.index) {
                return true;
            }
        })
        var rSource = $scope.data.force.links.filter(function(d){
            if (d.target.index === data.index) {
                return true;
            }
        })
        for (var i in rTargets) {
            results.push($scope.data.force.nodes[rTargets[i].target.index].index)
            //console.log($scope.data.force.nodes[rTargets[i].target.index].index);
        }
        for (var i in rSource) {
            results.push($scope.data.force.nodes[rSource[i].source.index].index)
            //console.log($scope.data.force.nodes[rSource[i].source.index].index);
        }
        //console.log(results);
        //$scope.appendInfo(results);
        return results;
    }
}]);