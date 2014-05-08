'use strict';

angular.module('mean.pages').controller('byLocalIpController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/extracted_files/by_local_ip?start='+$location.$$search.start+'&end='+$location.$$search.end;
	} else {
		query = '/extracted_files/by_local_ip?';
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