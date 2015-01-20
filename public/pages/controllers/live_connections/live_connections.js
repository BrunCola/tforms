'use strict';

angular.module('mean.pages').controller('liveConnectionsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$window', function ($scope, $stateParams, $location, Global, $rootScope, $http, $window) {
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
                $scope.$broadcast('map', data.map, data.start, data.end, data.zone);
                // $scope.$broadcast('lineChart', data.map, data.start, data.end);
            }
        });
    }

    $scope.mapChecked =  {mapCountries : true, mapApplications : true, mapLocalIp : true, mapRemoteIp : true};

    if ($window.sessionStorage[$window.location.pathname.replace("/", '')] !== undefined) {
        $scope.mapChecked = angular.fromJson($window.sessionStorage[$window.location.pathname.replace("/", '')])
    } else {
        window.sessionStorage.setItem($window.location.pathname.replace("/", ''), JSON.stringify($scope.mapChecked));
    } 

    $scope.showHide = function(mapChecked) {
        setTimeout(function () {
            $window.sessionStorage.setItem($window.location.pathname.replace("/", ''), JSON.stringify($scope.mapChecked));
            $scope.mapChecked = angular.fromJson($window.sessionStorage[$window.location.pathname.replace("/", '')])
        }, 0);
    }

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