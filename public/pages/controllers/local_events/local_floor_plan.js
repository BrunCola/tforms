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
            $scope.$broadcast('draggable');
        }
    });  

    // $scope.uploadFile = function(files) {
    //     console.log("IN FUNCTION");
    //     $http({method: 'POST', url: '/upload/render', data: files}).
    //         success( console.log("UPLOADED");
    //             // function(data, status, headers, config) {
    //             // var fil = tableData.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
    //             // $scope.tableCrossfitler.remove(fil);
    //             // tableData.filterAll();
    //             // redrawTable();
    //         })

    // };
}]);
