'use strict';

angular.module('mean.iochits').controller('TitleController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.title = 'L7 Proto';
	$scope.subheading = '';

}]);

angular.module('mean.iochits').controller('l7DrillController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/l7_drill?start='+$routeParams.start+'&end='+$routeParams.end+'&l7_proto='+$routeParams.l7_proto;
		} else {
			query = '/l7_drill?l7_proto='+$routeParams.l7_proto;
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
			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
	};
	$rootScope.rootpage = true;
}]);
