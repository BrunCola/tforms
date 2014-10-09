'use strict';

angular.module('mean.pages').controller('localCoiRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/local_COI_remote?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/local_events/local_COI_remote?';
    }
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (data.force === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.forcedata = data.force;
            $scope.$broadcast('forceChart', data.force, {height: 1000});
            $scope.$broadcast('spinnerHide');
        }
    });


    $scope.onloadInfo = function (){
        var nodeInfo = [];
        var nodeName = [];
        for(var i in $scope.forcedata.uniqueNodes){
            var nodeAppend = [];
            var selected = $scope.forcedata.nodes.filter(function(d){ 
                if (i === d.name){
                    nodeAppend["name"] = d.name;
                    nodeAppend["count"] = d.count;
                    nodeAppend["index"] = d.index;
                }
            });

            nodeAppend["allowed"] = 0;
            nodeAppend["block"] = 0;
            var selected = $scope.forcedata.links.filter(function(d){
                if ((d.class !== undefined) && ((d.target.index === nodeAppend["index"]) || (d.source.index === nodeAppend["index"]))) {
                    if (d.allowed === "authorized") { 
                        nodeAppend["allowed"]++;
                    } else if (d.allowed === "blocked") {
                        nodeAppend["block"]++;
                    }
                }
            });
            nodeInfo.push(nodeAppend);
        }
        $scope.pageLoadInfo(nodeInfo, "onload");
    }








    $scope.requery = function(data, button) {
        var results = [];
        switch(button) {
            case 'rules':
                $scope.appendInfo(data, 'rules');
            break;
            case 'authorized':
            // get children hanging off of parent nodes
                var rTargets = $scope.forcedata.links.filter(function(d){
                    if ((d.class !== undefined) && (d.source.index === data.index) && (d.source.value.allow === "authorized")) {
                        return true;
                    }
                })
                var rSource = $scope.forcedata.links.filter(function(d){
                    if ((d.class !== undefined) && (d.target.index === data.index) && (d.source.value.allow === "authorized")) {
                        return true;
                    }
                })
                for (var i in rTargets) {
                    results.push($scope.forcedata.nodes[rTargets[i].target.index].value)
                }
                for (var i in rSource) {
                    results.push($scope.forcedata.nodes[rSource[i].source.index].value)
                }
                $scope.appendInfo(results, 'authorized');
            break;
            case 'blocked':
           // console.log(data)
            // get children hanging off of parent nodes
                var rTargets = $scope.forcedata.links.filter(function(d){
                    if ((d.class !== undefined) && (d.source.index === data.index) && (d.source.value.allow === "blocked")) {
                        console.log("test2");
                        return true;
                    }
                })
                var rSource = $scope.forcedata.links.filter(function(d){
                    if ((d.class !== undefined) && (d.target.index === data.index) && (d.source.value.allow === "blocked")) {
                        return true;
                    }
                })
                for (var i in rTargets) {
                    results.push($scope.forcedata.nodes[rTargets[i].target.index].value)
                }
                for (var i in rSource) {
                    results.push($scope.forcedata.nodes[rSource[i].source.index].value)
                }
                $scope.appendInfo(results, 'blocked');
            break;
            case 'users':
                var thisObj = $scope.forcedata.uniqueNodes[""+data.name];
                for (var i in thisObj) {
                    var obj = {};
                    obj[i] = Object.keys($scope.forcedata.uniqueUsers[i]);
                    results.push(obj)
                }
                $scope.appendInfo(results, 'users');
            break;
            case 'top':
                // clear the div (replace with loading thing later)
                // $scope.appendInfo({});
                query += '&type=top';
                $http({method: 'GET', url: query}).
                //success(function(data, status, headers, config) {
                success(function(data) {
                    if (data.force === null) {
                        $scope.$broadcast('loadError');
                    } else {
                        // $scope.forcedata = data.force;
                        // $scope.$broadcast('forceChart', data.force, {height: 1000});
                        // $scope.$broadcast('spinnerHide');
                        console.log(data)
                    }
                });
                $scope.appendInfo(results, 'top');
            break;
           /* case 'pageload':
                var thisObj = $scope.forcedata.uniqueNodes[""+data.name];
                for (var i in thisObj) {
                    var obj = {};
                    obj[i] = Object.keys($scope.forcedata.uniqueUsers[i]);
                    results.push(obj)
                }
                $scope.appendInfo(results, 'users');
            break;*/
        }
    }
}]);