'use strict';

angular.module('mean.iochits').controller('IochitsController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', 'socket', function ($scope, Global, $http, $routeParams, $rootScope, socket) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/iochits?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/iochits'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			$scope.$broadcast('tableLoad');
			$scope.$broadcast('rowChart');
			$scope.$broadcast('geoChart');
			$scope.$broadcast('sevChart');
				$scope.sevChartxAxis = '';
				$scope.sevChartyAxis = '# IOC / Hour';
			$scope.$broadcast('severityLoad');
			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);
