'use strict';

angular.module('mean.iochits').controller('TitleController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.title = 'IOC Hits';
	$scope.subheading = '';
}]);

angular.module('mean.iochits').controller('IochitsController', ['$scope', 'Global', '$http', '$routeParams', function ($scope, Global, $http, $routeParams) {
	$scope.global = Global;
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

			// var dateAccessor = function (d){return d.date;};
			// var dateExtent = [];
			// var date = d3.extent(data, dateAccessor);

			$scope.$broadcast('tableLoad');
			$scope.$broadcast('sevChart');
			$scope.$broadcast('rowChart');
			$scope.$broadcast('severityLoad');
			$scope.$broadcast('geoChart');
		});
	};
}]);
