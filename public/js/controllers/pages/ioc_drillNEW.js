'use strict';

angular.module('mean.iochits').controller('IocDrillController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/ioc_drill?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_ip='+$routeParams.lan_ip+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		} else {
			query = '/ioc_drill?lan_ip='+$routeParams.lan_ip+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			$scope.$broadcast('tableLoad');
			$scope.$broadcast('sevDrillChart');
			$scope.sevDrillChartxAxis = '';
			$scope.sevDrillChartyAxis = '# IOC / Hour';

			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);
