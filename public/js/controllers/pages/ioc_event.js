'use strict';

angular.module('mean.iochits').controller('IocEventController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query = '/ioc_event?conn_uids='+$routeParams.conn_uids;
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			$scope.data = data;

			$scope.$broadcast('tableLoad');

			$scope.lan_zone = data.info.main[0].lan_zone;
			$scope.lan_ip = data.info.main[0].lan_ip;
			$scope.lan_port = data.info.main[0].lan_port;
			$scope.machine_name = data.info.main[0].machine;
			$scope.packets_recieved = data.info.main[0].out_packets;
			$scope.bytes_received = data.info.main[0].out_bytes;

			$scope.rCountry = data.info.main[0].remote_country;
			if (data.info.main[0].remote_cc){
				$scope.flag = data.info.main[0].remote_cc.toLowerCase();
			}
			$scope.remote_ip = data.info.main[0].remote_ip;
			$scope.remote_port = data.info.main[0].remote_port;
			$scope.in_packets = data.info.main[0].in_packets;
			$scope.in_bytes = data.info.main[0].in_bytes;
			$scope.time = data.info.main[0].time;
			$scope.l7_proto = data.info.main[0].l7_proto;
			$scope.remote_asn = data.info.main[0].remote_asn;
			$scope.remote_asn_name = data.info.main[0].remote_asn_name;

			$scope.ioc = data.info.main[0].ioc;
			$scope.ioc_type = data.info.main[0].ioc_typeIndicator;

			//run description query now
			var query = '/ioc_event?ioc='+data.info.main[0].ioc;
			$http({method: 'GET', url: query}).
			success(function(data) {
				if (data[0].description) {
					var description = data[0].description;
					var len = description.length;
					if (len > 200) {
						$scope.desc = description.substr(0,200);
						$scope.$broadcast('iocDesc', description);
					} else {
						$scope.desc = description;
					}
				}
			});
			// if (data.crossfilter.length === 0) {
			// 	$scope.$broadcast('loadError');
			// }
		});
	$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);
