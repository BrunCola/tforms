'use strict';

angular.module('mean.pages').controller('iocEventsDrilldownController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/ioc_notifications/ioc_events_drilldown?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID;
	} else {
		query = '/ioc_notifications/ioc_events_drilldown?lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID;
	}
	// $scope.$on('grouping', function (event, grouping){
	// 	var get = query + '&group='+grouping;
	// 	$http({method: 'GET', url: get}).
	// 		success(function(data) {
	// 			fishchart(data);
	// 		});
	// })
	// max time grouping by minute
	// $scope.minslider = 1;
	// $scope.number = 60;
	// $scope.getNumber = function(num) {
	// 	return new Array(num);
	// };
	
	$http({method: 'GET', url: query}).
	success(function(data) {
		$scope.crossfilterData = crossfilter();
		$scope.lanes = data.laneGraph.lanes;
		var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
		var id = 0;
		data.laneGraph.data.forEach(function(parent) {
			parent.forEach(function(child) {
				child.dd = dateFormat.parse(child.time);
				child.id = id;
				id++;
			})
			$scope.crossfilterData.add(parent);
		});

		$scope.$broadcast('laneGraph');

		$scope.description = function (d, e) {
			$scope.mData = d;
			$scope.mTitle = e;
			// $scope.$broadcast('moodal', d);
			$scope.modalInstance = $modal.open({
				templateUrl: 'descModal.html',
				controller: descInstanceCtrl,
				keyboard: true,
				resolve: {
					data: function() {
						return $scope.mData;
					},
					ioc: function() {
						if(e){
							return $scope.mTitle
						}else{
							return $location.$$search.ioc;
						}
					}
				}
			});
		};

			

		var descInstanceCtrl = function ($scope, $modalInstance, data, ioc) {
			$scope.ok = function () {
				$modalInstance.close();
			};
			$scope.data = data;
			$scope.iocc = ioc;
		};

		if (data.tree.childCount >= 35) {
			var divHeight = data.tree.childCount*12;
		} else {
			var divHeight = 420;
		}

		$scope.$broadcast('forceChart', data.force, {height: divHeight});
		$scope.$broadcast('treeChart', data.tree, {height: divHeight});

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
		$scope.ioc_rule = data.info.main[0].ioc_rule;

		if (data.info.desc[0] !== undefined) {
			$scope.$broadcast('iocDesc', data.info.desc[0].description)
		}
		
		// // draw chart
		// fishchart(data);

		// get user image
		// if ($scope.lan_ip !== '-') {
		// 	$http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?lan_zone='+$scope.lan_zone+'&lan_ip='+$scope.lan_ip+'&type=assets'}).
		// 	success(function(data) {
		// 		if (data) {
		// 			$scope.userImage = 'public/pages/assets/img/staff/'+data[0].file;
		// 		}
		// 	});
		// }
	});

	$scope.requery = function(min, max, callback) {
		var minUnix = moment(min).unix();
		var maxUnix = moment(max).unix();
		if (($scope.inTooDeep.min === minUnix) && ($scope.inTooDeep.max === maxUnix)) {
			$scope.inTooDeep.areWe = true;
			// $scope.inTooDeep.min = minUnix;
			// $scope.inTooDeep.max = maxUnix;
		}
		if (($scope.inTooDeep.areWe === true) && (minUnix >= $scope.inTooDeep.min) && (maxUnix <= $scope.inTooDeep.max)) {
			var deepItems = $scope.deepItems.filter(function(d) { if((d.dd < max) && (d.dd > min)) {return true};});
			callback(deepItems);
			$scope.alert.style('display', 'block');
		} else {
			//  set $scope.inTooDeep
			$scope.inTooDeep = {
				areWe: true,
				min: minUnix,
				max: maxUnix
			};
			//  grab more from api
			var query = '/ioc_notifications/ioc_events_drilldown?start='+minUnix+'&end='+maxUnix+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID+'&type=drill';
			$http({method: 'GET', url: query}).
				success(function(data) {
					$scope.crossfilterDeep = crossfilter();
					var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
					var id = 0;
					data.laneGraph.data.forEach(function(parent) {
						parent.forEach(function(child) {
							child.dd = dateFormat.parse(child.time);
							child.id = id;
							id++;
						})
						$scope.crossfilterDeep.add(parent);
					});
					var itemsDimension = $scope.crossfilterDeep.dimension(function(d){ return d.time });
					$scope.deepItems = itemsDimension.top(Infinity);
					callback($scope.deepItems);
					$scope.alert.style('display', 'block');
				});
		}
	}

}]);