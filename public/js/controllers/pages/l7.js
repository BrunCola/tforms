'use strict';

angular.module('mean.iochits').controller('TitleController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.onHeadLoad = function() {
		$scope.title = 'Archive';
		$scope.subheading = '';
	}
}]);

angular.module('mean.iochits').controller('l7Controller', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/l7?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/l7'
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
			$scope.$broadcast('barChart');
			$scope.barChartxAxis = '';
			$scope.barChartyAxis = '# MB / Hour';			
			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Layer 7 Protocols'
	};
	$rootScope.rootpage = true;
}]);
