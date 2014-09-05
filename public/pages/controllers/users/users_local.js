'use strict';

angular.module('mean.pages').controller('usersLocalController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/users/users_local?start='+$location.$$search.start+'&end='+$location.$$search.end;
	} else {
		query = '/users/users_local?';
	}
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (data.tables[0] === null) {
			$scope.$broadcast('loadError');
		} else {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

			$scope.data = data;

			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

			var divHeight = 620;
			$scope.$broadcast('networkChart', data.network[0], {height: divHeight});

			$scope.$broadcast('spinnerHide');

		}
	});
}]);