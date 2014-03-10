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
				d.count = +d.count;
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			$scope.$broadcast('tableLoad');
			$scope.$broadcast('sevChart');
			$scope.sevChartxAxis = '';
			$scope.sevChartyAxis = '# IOC / Hour';

			$scope.lan_zone = data.info.main[0].lan_zone;
			$scope.lan_ip = $routeParams.lan_ip;
			$scope.lan_port = data.info.main[0].lan_port;
			$scope.machine_name = data.info.main[0].machine;
			$scope.packets_recieved = data.info.main[0].out_packets;
			$scope.bytes_received = data.info.main[0].out_bytes;

			$scope.countryy = data.info.main[0].remote_country;
			if (data.info.main[0].remote_cc){
				$scope.flag = data.info.main[0].remote_cc.toLowerCase();
			}
			$scope.remote_ip = $routeParams.remote_ip;
			$scope.remote_port = data.info.main[0].remote_port;
			$scope.in_packets = data.info.main[0].in_packets;
			$scope.in_bytes = data.info.main[0].in_bytes;
			$scope.first = data.info.main[0].first;
			$scope.l7_proto = data.info.main[0].l7_proto;
			$scope.remote_asn = data.info.main[0].remote_asn;
			$scope.remote_asn_name = data.info.main[0].remote_asn_name;
			$scope.last = data.info.main[0].last;

			$scope.iocc = $routeParams.ioc;
			$scope.ioc_type = data.info.main[0].ioc_typeIndicator;

			if (data.info.desc[0].description) {
				var description = data.info.desc[0].description;
				var len = description.length;
				if (len > 200) {
					$scope.desc = description.substr(0,200);
					$scope.$broadcast('iocDesc', description);
				} else {
					$scope.desc = description;
				}
			}

			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);
