'use strict';

angular.module('mean.iochits').controller('TitleController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.onHeadLoad = function() {
		$scope.title = 'Archive';
		$scope.subheading = '';
	}

}]);

angular.module('mean.iochits').controller('topRemoteController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/top_remote?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/top_remote'
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

			$scope.$broadcast('geoChart');
			$scope.$broadcast('tableLoad');
			$scope.$broadcast('barChart');
			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Remote IP Addresses'
	};
	$rootScope.rootpage = true;
}]);
