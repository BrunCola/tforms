'use strict';

angular.module('mean.pages').controller('smtpToReceiverController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/general_network/smtp_to_receiver?start='+$location.$$search.start+'&end='+$location.$$search.end+'&to='+$location.$$search.to;
    } else {
        query = '/general_network/smtp_to_receiver?&to='+$location.$$search.to;
    }
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);