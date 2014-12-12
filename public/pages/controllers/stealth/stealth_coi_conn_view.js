'use strict';

angular.module('mean.pages').controller('stealthCoiConnViewController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/stealth/stealth_coi_conn_view?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/api/stealth/stealth_coi_conn_view?';
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.chord === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.forcedata = data.chord;
            $scope.$broadcast('chordChart', data.chord);
            $scope.$broadcast('spinnerHide');
        }
    });

    // $scope.requery = function(data, button) {
    //     console.log(data)
    //     var results = [];
    //     switch(button) {
    //         case 'rules':
    //             $scope.appendInfo(data, 'rules');
    //         break;
    //         case 'authorized':
    //             // get children hanging off of parent nodes
    //             var rTargets = $scope.forcedata.links.filter(function(d){
    //                 if ((d.class !== undefined) && (d.source.index === data.index) && (d.source.value.allow === "authorized")) {
    //                     return true;
    //                 }
    //             })
    //             var rSource = $scope.forcedata.links.filter(function(d){
    //                 if ((d.class !== undefined) && (d.target.index === data.index) && (d.source.value.allow === "authorized")) {
    //                     return true;
    //                 }
    //             })
    //             for (var i in rTargets) {
    //                 results.push($scope.forcedata.nodes[rTargets[i].target.index].value)
    //             }
    //             for (var i in rSource) {
    //                 results.push($scope.forcedata.nodes[rSource[i].source.index].value)
    //             }
    //             $scope.appendInfo(results, 'authorized');
    //         break;
    //         case 'blocked':
    //             // get children hanging off of parent nodes
    //             var rTargets = $scope.forcedata.links.filter(function(d){
    //                 if ((d.class !== undefined) && (d.source.index === data.index) && (d.target.value.allow === "blocked")) {
    //                     return true;
    //                 }
    //             })
    //             var rSource = $scope.forcedata.links.filter(function(d){
    //                 if ((d.class !== undefined) && (d.target.index === data.index) && (d.source.value.allow === "blocked")) {
    //                     return true;
    //                 }
    //             })
    //             for (var i in rTargets) {
    //                 results.push($scope.forcedata.nodes[rTargets[i].target.index].value)
    //             }
    //             for (var i in rSource) {
    //                 results.push($scope.forcedata.nodes[rSource[i].source.index].value)
    //             }
    //             $scope.appendInfo(results, 'blocked');
    //         break;
    //         case 'users':
    //             var thisObj = $scope.forcedata.uniqueNodes[""+data.name];
    //             for (var i in thisObj) {
    //                 var obj = {};
    //                 obj[i] = Object.keys($scope.forcedata.uniqueUsers[i]);
    //                 results.push(obj)
    //             }
    //             console.log(results)
    //             $scope.appendInfo(results, 'top');
    //         break;
    //         case 'top':
    //             // clear the div (replace with loading thing later)
    //             query += '&type=top';
    //             $http({method: 'GET', url: query}).
    //             success(function(data) {
    //                 if (data.force === null) {
    //                     $scope.$broadcast('loadError');
    //                 } else {
    //                     // $scope.forcedata = data.force;
    //                     // $scope.$broadcast('forceChart', data.force, {height: 1000});
    //                     // $scope.$broadcast('spinnerHide');
    //                     console.log(data)
    //                 }
    //             });
    //             $scope.appendInfo(results, 'top');
    //         break;
    //         /* case 'pageload':
    //             var thisObj = $scope.forcedata.uniqueNodes[""+data.name];
    //             for (var i in thisObj) {
    //                 var obj = {};
    //                 obj[i] = Object.keys($scope.forcedata.uniqueUsers[i]);
    //                 results.push(obj)
    //             }
    //             $scope.appendInfo(results, 'users');
    //         break;*/
    //     }
    // }
}]);