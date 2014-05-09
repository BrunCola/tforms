'use strict';

angular.module('mean.pages').controller('iocTopLocalIpsDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
	 query = '/ioc_notifications/ioc_top_local_ips_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip;
	} else {
		query = '/ioc_notifications/ioc_top_local_ips_drill?&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip;
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

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroupPre = barDimension.group();
				var barGroup = barGroupPre.reduce(
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded += v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated += v.count;
						}
						if (v.ioc_severity === 3) {
							p.high += v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe += v.count;
						}
						if (v.ioc_severity === null) {
							p.other += v.count;
						}
						return p;
					},
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded -= v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated -= v.count;
						}
						if (v.ioc_severity === 3) {
							p.high -= v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe -= v.count;
						}
						if (v.ioc_severity === null) {
							p.other -= v.count;
						}
						return p;
					},
					function() {
						return {
							guarded:0,
							elevated:0,
							high:0,
							severe:0,
							other:0
						};
					}
				);
				$scope.$broadcast('barChart', barDimension, barGroup, 'severity');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# IOC / Hour';
				$scope.$broadcast('severityLoad');
			}
		});
}]);