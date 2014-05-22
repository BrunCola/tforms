'use strict';

angular.module('mean.pages').controller('iocEventsDrilldownController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/ioc_notifications/ioc_events_drilldown?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc;
	} else {
		query = '/ioc_notifications/ioc_events_drilldown?&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc;
	}
	$scope.$on('grouping', function (event, grouping){
		var get = query + '&group='+grouping;
		$http({method: 'GET', url: get}).
			success(function(data) {
				fishchart(data);
			});
	})
	// max time grouping by minute
	$scope.minslider = 1;
	$scope.number = 60;
	$scope.getNumber = function(num) {
		return new Array(num);
	};
	$http({method: 'GET', url: query}).
	success(function(data) {
		$scope.open = function (d) {
			$scope.mData = d;
			// $scope.$broadcast('moodal', d);
			$scope.modalInstance = $modal.open({
				templateUrl: 'tableModal.html',
				controller: ModalInstanceCtrl,
				keyboard: true,
				resolve: {
					data: function() {
						return $scope.mData;
					}
				},
				windowClass: 'modalTable'
			});
		};
		var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
			$scope.ok = function () {
				$modalInstance.close();
			};
			$scope.data = data;
		};

		$scope.lan_zone = data.info.main[0].lan_zone;
		$scope.lan_ip = $location.$$search.lan_ip;

		$scope.lan_port = data.info.main[0].lan_port;
		$scope.machine_name = data.info.main[0].machine;
		$scope.packets_recieved = data.info.main[0].out_packets;
		$scope.bytes_received = data.info.main[0].out_bytes;

		$scope.countryy = data.info.main[0].remote_country;
		if (data.info.main[0].remote_cc){
			$scope.flag = data.info.main[0].remote_cc.toLowerCase();
		}
		$scope.remote_ip = $location.$$search.remote_ip;
		$scope.remote_port = data.info.main[0].remote_port;
		$scope.in_packets = data.info.main[0].in_packets;
		$scope.in_bytes = data.info.main[0].in_bytes;
		$scope.first = data.info.main[0].first;
		$scope.l7_proto = data.info.main[0].l7_proto;
		$scope.remote_asn = data.info.main[0].remote_asn;
		$scope.remote_asn_name = data.info.main[0].remote_asn_name;
		$scope.last = data.info.main[0].last;

		$scope.iocc = $location.$$search.ioc;
		$scope.ioc_type = data.info.main[0].ioc_typeIndicator;

		// draw chart
		fishchart(data);

		// get user image
		if ($scope.lan_ip !== '-') {
			$http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?lan_zone='+$scope.lan_zone+'&lan_ip='+$scope.lan_ip+'&type=assets'}).
			success(function(data) {
				if (data) {
					console.log(data);
					$scope.userImage = 'public/pages/assets/img/staff/'+data[0].file;
				}
			});
		}
	});

	function fishchart(data) {
		var all = [];
		$scope.$broadcast('buildFishChart', {
			maxIOC: data.maxIOC,
			yAxis: data.maxConn,
			xAxis: [parseInt(data.start), parseInt(data.end)]
		})
		for (var n in data.result) {
			data.result[n].forEach(function(d){
				all.push(d);
			})
		}
		$scope.all = all;
		$scope.$broadcast('fishChart', all);
		if (data.info.desc !== null) {
			var description = data.info.desc[0].description;
			var len = description.length;
			if (len > 300) {
				$scope.desc = description.substr(0,300);
				$scope.$broadcast('iocDesc', description);
			} else {
				$scope.desc = description;
			}
		}
	}
}]);