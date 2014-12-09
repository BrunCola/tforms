'use strict';

angular.module('mean.pages').controller('liveConnectionsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'socket', function ($scope, $stateParams, $location, Global, $rootScope, $http, socket) {
    $scope.global = Global;
    $scope.socket = socket;
    var timer;
    var query = '/live_connections/live_connections';
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
                // $scope.$broadcast('lineChart', data.map, data.start, data.end);
            }
        });
    }

    $scope.lineChartStart = moment().subtract('minutes', 9).unix()*1000;
    $scope.lineChartEnd = Math.round(new Date().getTime());// + 3060000;
    $scope.totalMap = [];
    getMap();
    $scope.$on('$destroy', function() {
        clearTimeout(timer);
    });
    $scope.$on('canIhazMoreMap', function() {
        getMap();
    });
}]);