'use strict';

angular.module('mean.pages').controller('liveConnectionsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'socket', function ($scope, $stateParams, $location, Global, $rootScope, $http, socket) {
    $scope.global = Global;
    $scope.socket = socket;
    var timer;
    var query = '/api/live_connections/live_connections';
    function getMap() {
        $http({method: 'GET', url: query}).
        success(function(data) {
            if (data.map.features.length === 0) {
                console.log('No data to display, waiting a minute.');
                timer = setTimeout(function(){
                    getMap();
                }, 60000)
            } else {
                $scope.$broadcast('map', data.map, data.start, data.end);
            }
        });
    }
    getMap();
    $scope.$on('$destroy', function() {
        clearTimeout(timer);
    });
    $scope.$on('canIhazMoreMap', function() {
        getMap();
    });
}]);