'use strict';

angular.module('mean.iochits').controller('TitleController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.title = 'IOC Drilldown';
	$scope.subheading = '';
}]);

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
			$scope.lan_ip = $routeParams.lan_ip;
			$scope.lan_port = data.info.main[0].lan_port;
			$scope.machine_name = data.info.main[0].machine;
			$scope.packets_recieved = data.info.main[0].out_packets;
			$scope.bytes_received = data.info.main[0].out_bytes;

			$scope.country = data.info.main[0].remote_country;
			$scope.flag = data.info.main[0].remote_cc;
			$scope.remote_ip = $routeParams.remote_ip;
			$scope.remote_port = data.info.main[0].remote_port;
			$scope.in_packets = data.info.main[0].in_packets;
			$scope.in_bytes = data.info.main[0].in_bytes;
			$scope.time = data.info.main[0].time;
			$scope.l7_proto = data.info.main[0].l7_proto;
			$scope.remote_asn = data.info.main[0].remote_asn;
			$scope.remote_asn_name = data.info.main[0].remote_asn_name;

			$scope.ioc = data.info.main[0].ioc;
			$scope.ioc_type = data.info.main[0].ioc_type;
			// $scope.desc = data.info.desc[0].description;

			// if (data.crossfilter.length === 0) {
			// 	$scope.$broadcast('loadError');
			// }
		});
	};
	$rootScope.rootpage = true;
}]);
