'use strict';

angular.module('mean.pages').controller('byDomainLocalController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
		if ($location.$$search.start && $location.$$search.end) {
			query = '/extracted_files/by_domain_local?start='+$location.$$search.start+'&end='+$location.$$search.end+'&http_host='+$location.$$search.http_host;
		} else {
			query = '/extracted_files/by_domain_local?http_host='+$location.$$search.http_host;
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