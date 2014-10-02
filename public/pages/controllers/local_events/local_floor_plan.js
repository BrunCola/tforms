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
        });//.success( console.log("UPLOADED");).error( console.log("error!"); );
    };  
}]);
