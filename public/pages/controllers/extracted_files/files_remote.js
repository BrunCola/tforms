'use strict';

angular.module('mean.pages').controller('fileRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/extracted_files/files_remote?start='+$location.$$search.start+'&end='+$location.$$search.end+'&remote_ip='+$location.$$search.remote_ip+'&mime='+$location.$$search.mime;
    } else {
        query = '/api/extracted_files/files_remote?remote_ip='+$location.$$search.remote_ip+'&mime='+$location.$$search.mime;
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