'use strict';

angular.module('mean.iochits').controller('IochitsController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', 'socket', function ($scope, Global, $http, $routeParams, $rootScope, socket) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/iochits?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/iochits?'
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

		$http({method: 'GET', url: query+'&type=ioc_notifications'}).
		success(function(data) {
			$scope.ioc_notifications = data[0].count;
		});
		$http({method: 'GET', url: query+'&type=ioc_groups'}).
		success(function(data) {
			$scope.ioc_groups = data;
		});
		$http({method: 'GET', url: query+'&type=local_ips'}).
		success(function(data) {
			$scope.local_ips = data;
		});
		$http({method: 'GET', url: query+'&type=remote_ip'}).
		success(function(data) {
			$scope.remote_ip = data;
		});
		$http({method: 'GET', url: query+'&type=query'}).
		success(function(data) {
			$scope.query = data;
		});
		$http({method: 'GET', url: query+'&type=host'}).
		success(function(data) {
			$scope.hostt = data;
		});
		$http({method: 'GET', url: query+'&type=remote_ip_ssl'}).
		success(function(data) {
			$scope.remote_ip_ssl = data;
		});
		$http({method: 'GET', url: query+'&type=name'}).
		success(function(data) {
			$scope.file_name = data;
		});
		$http({method: 'GET', url: query+'&type=l7_proto'}).
		success(function(data) {
			$scope.l7_proto = data;
		});
		$http({method: 'GET', url: query+'&type=remote_country'}).
		success(function(data) {
			$scope.remote_country = data;
		});
		//////////////////////////////////
		//////////////////////////////////
		$http({method: 'GET', url: query+'&type=bandwidth_in'}).
		success(function(data) {
			$scope.bandwidth_in = data.count;
		});
		$http({method: 'GET', url: query+'&type=bandwidth_out'}).
		success(function(data) {
			$scope.bandwidth_out = data;
		});
		$http({method: 'GET', url: query+'&type=new_ip'}).
		success(function(data) {
			$scope.new_ip = data;
		});
		$http({method: 'GET', url: query+'&type=new_dns'}).
		success(function(data) {
			$scope.new_dns = data;
		});
		$http({method: 'GET', url: query+'&type=new_http'}).
		success(function(data) {
			$scope.new_http = data;
		});
		$http({method: 'GET', url: query+'&type=new_ssl'}).
		success(function(data) {
			$scope.new_ssl = data;
		});
		$http({method: 'GET', url: query+'&type=new_layer7'}).
		success(function(data) {
			$scope.new_layer7 = data;
		});
		$http({method: 'GET', url: query+'&type=conn_meta'}).
		success(function(data) {
			$scope.conn_meta = data;
		});
		$http({method: 'GET', url: query+'&type=remote_ip_conn_meta'}).
		success(function(data) {
			$scope.remote_ip_conn_meta = data;
		});
		$http({method: 'GET', url: query+'&type=remote_country_conn_meta'}).
		success(function(data) {
			$scope.remote_country_conn_meta = data;
		});
	};
	$rootScope.rootpage = true;
}]);
