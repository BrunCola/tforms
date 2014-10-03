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

    $scope.uploadFile = function(files) {
        var fd = new FormData();
        //Take the first selected file

        fd.append("file", files[0]);
        console.log(fd);
        var uploadUrl = '../../../uploads/'; //TODO Different folders per client? Diff folders for User photos and floor plans?
        $http.post(uploadUrl, fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        });

        // $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: e.offsetX, y_coord: e.offsetY, map_name: rowData.map, lan_ip: rowData.lan_ip, lan_zone: rowData.lan_zone}}).
        //             success(function(data) {
        //                 //console.log("successfully saved Coordinates");
        //                 //$scope.requery(rowData, 'flooruser');
        //             })
    };  
}]);
