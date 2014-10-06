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
         // get user image
        if ($scope.lan_ip !== '-') {
            var userInfo = [];
            var query = '/local_events/local_floor_plan?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=flooruser'; 
            
            $http({method: 'GET', url: query+'&typeinfo=assets'}).
                success(function(data) {
                    if (data[0] !== undefined) {
                        $scope.appendInfo(d,'public/pages/assets/img/staff/'+data[0].file,"assets");
                    }else{
                        $scope.appendInfo(d,'',"assets");
                    }
                });

            $scope.appendInfo("","","clear");
            $scope.appendInfo(d,"","userinfo");
                       

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
                    $scope.appendInfo(d,data[0],"localfiles");
                });

            $http({method: 'GET', url: query+'&typeinfo=endpoint'}).
                success(function(data) {
                    $scope.appendInfo(d,data[0],"endpoint");
                });

          
            //$scope.appendInfo(userInfo);
        }
    }

    $scope.uploadFile = function(files) {
        var fd = new FormData();
        //Use native angular upload to get the file to the 
        //serverside uploads.js function, which handles the rest of the upload from there

        fd.append("file", files[0]);
        console.log(fd);
        var uploadUrl = '../../../uploads/'; //This is the 
        $http.post(uploadUrl, fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        });
    };  
}]);
