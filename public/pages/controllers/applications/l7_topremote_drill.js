'use strict';

angular.module('mean.pages').controller('l7TopremoteDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/applications/l7_topremote_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&remote_ip='+$location.$$search.remote_ip+'&l7_proto='+$location.$$search.l7_proto;
	} else {
		query = '/applications/l7_topremote_drill?remote_ip='+$location.$$search.remote_ip+'&l7_proto='+$location.$$search.l7_proto;
	}
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (data.tables[0] === null) {
			$scope.$broadcast('loadError');
		} else {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
			var geoGroup = geoDimension.group().reduceSum(function (d) {
				return d.count;
			});
			$scope.$broadcast('geoChart', geoDimension, geoGroup);
			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

			var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
			var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
			$scope.$broadcast('barChart', barDimension, barGroup, 'bar');

			$scope.barChartxAxis = '';
			$scope.barChartyAxis = '# MB / Hour';
		}
	});
}]);