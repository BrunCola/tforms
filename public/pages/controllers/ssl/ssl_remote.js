'use strict';

angular.module('mean.pages').controller('sslRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/api/ssl/ssl_remote?start='+$location.$$search.start+'&end='+$location.$$search.end;
	} else {
		query = '/api/ssl/ssl_remote?';
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