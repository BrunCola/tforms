'use strict';

angular.module('mean.iochits').controller('TitleController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.title = 'IOC Drilldown';
	$scope.subheading = '';
}]);

angular.module('mean.iochits').controller('IocDrillController', ['$scope', 'Global', '$http', '$routeParams', function ($scope, Global, $http, $routeParams) {
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
			console.log(data);
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			var crossfilterData = crossfilter(data.crossfilter);
			$scope.cf_data = crossfilterData; // feed it through crossfilter
			$scope.all = $scope.cf_data.groupAll();

			$scope.data = data;

			var dateAccessor = function (d){return d.date;};
			var dateExtent = [];
			var date = d3.extent(data, dateAccessor);

			$scope.$broadcast('tableLoad', crossfilterData);
			$scope.$broadcast('sevChart');
		});
	};
}]);
