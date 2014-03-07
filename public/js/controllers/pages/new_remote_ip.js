'use strict';

angular.module('mean.iochits').controller('NewRemoteIpController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/new_remote_ip?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/new_remote_ip'
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
			$scope.$broadcast('geoChart');
			$scope.$broadcast('barChart');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# New IP / Hour';
			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'New Remote IPs Detected';
	};
	$rootScope.rootpage = true;
}]);
