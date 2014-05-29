'use strict';

angular.module('mean.pages').controller('topIpsSharedController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/general_network/top_ips_shared?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+$location.$$search.lan_ip+'&lan_zone='+$location.$$search.lan_zone+'&remote_ip='+$location.$$search.remote_ip;
	} else {
		query = '/general_network/top_ips_shared?&lan_ip='+$location.$$search.lan_ip+'&lan_zone='+$location.$$search.lan_zone+'&remote_ip='+$location.$$search.remote_ip;
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
			$scope.$broadcast('spinnerHide');

		}
	});
}]);