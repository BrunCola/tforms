'use strict';

angular.module('mean.pages').controller('smtpFromSenderController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/email/smtp_from_sender?start='+$location.$$search.start+'&end='+$location.$$search.end+'&mailfrom='+$location.$$search.mailfrom+'&receiptto='+$location.$$search.receiptto;
    } else {
        query = '/api/email/smtp_from_sender?&mailfrom='+$location.$$search.mailfrom+'&receiptto='+$location.$$search.receiptto;
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
            $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);
            $scope.$broadcast('spinnerHide');
        }
    });
}]);