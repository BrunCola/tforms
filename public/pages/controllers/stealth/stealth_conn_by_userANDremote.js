'use strict';

angular.module('mean.pages').controller('stealthConnByUserAndRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/stealth/stealth_conn_by_userANDremote?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_machine='+$location.$$search.lan_machine+'&lan_user='+$location.$$search.lan_user+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip;
    } else {
        query = '/api/stealth/stealth_conn_by_userANDremote?lan_zone='+$location.$$search.lan_zone+'&lan_machine='+$location.$$search.lan_machine+'&lan_user='+$location.$$search.lan_user+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip;
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);