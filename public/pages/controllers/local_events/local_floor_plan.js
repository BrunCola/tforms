'use strict';

angular.module('mean.pages').controller('floorPlanController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    query = '/local_events/local_floor_plan?';
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (!data.force) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            $scope.$broadcast('floorPlan', data.force, {height: 1000});
            $scope.$broadcast('spinnerHide');
        }
    });  

    $scope.requery = function(d) {       
        var userInfo = [];

        $scope.appendInfo("","","clear");
        $scope.appendInfo(d,"","userinfo");

        var query = '/local_events/local_floor_plan?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=flooruser';                        

        $http({method: 'GET', url: query+'&typeinfo=localioc'}).
            success(function(data) {
                $scope.appendInfo(d,data[0],"localioc");
            });

        $http({method: 'GET', url: query+'&typeinfo=localapp'}).
            success(function(data) {
                $scope.appendInfo(d,data[0],"localapp");
            });

        $http({method: 'GET', url: query+'&typeinfo=localhttp'}).
            success(function(data) {
                $scope.appendInfo(d,data[0],"localhttp");
            });

        $http({method: 'GET', url: query+'&typeinfo=localfiles'}).
            success(function(data) {
                userInfo.push(data);
                $scope.appendInfo(d,data[0],"localfiles");
            });


                $scope.appendInfo(userInfo);
    }
}]);
