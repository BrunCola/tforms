'use strict';

angular.module('mean.pages').controller('liveConnectionsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
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
                // $scope.$broadcast('lineChart', data.map, data.start, data.end);
            }
        });
    }
    // $scope.mapCountries = true;
    $scope.mapApplications = true;
    // $scope.mapLocalIp = false;
    // $scope.mapRemoteIp = false;

    $scope.lineChartStart = moment().subtract('minutes', 9).unix()*1000;
    $scope.lineChartEnd = Math.round(new Date().getTime()) - 254000; //- 504000;// + 3060000;
    $scope.totalMap = [];
    getMap();
    $scope.$on('$destroy', function() {
        clearTimeout(timer);
    });
    $scope.$on('canIhazMoreMap', function() {
        getMap();
    });
}]);