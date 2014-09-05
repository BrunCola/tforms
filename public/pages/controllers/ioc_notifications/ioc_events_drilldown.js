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
		$scope.columns = data.columns;
		$scope.crossfilterData = crossfilter();
		// var laneIndex = 0;
		if ($scope.global.user.level === 3) {
			$scope.lanes = ['conn', 'file', 'dns', 'http', 'ssl', 'endpoint', 'stealth'];
		} else {
			$scope.lanes = ['conn', 'file', 'dns', 'http', 'ssl', 'endpoint'];
		}
		var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
		var id = 0;
		data.laneGraph.forEach(function(parent) {
			var index = $scope.lanes.indexOf(parent[0].type.replace('_ioc', ''));
			parent.forEach(function(child) {
				child.id = id;
				child.dd = dateFormat.parse(child.time);
				child.segment = d3.time.hour(child.dd);
				child.lane = index;
				id++;
			})
			$scope.crossfilterData.add(parent);
		});
		$scope.$broadcast('laneGraph');


		$scope.open = function (d, columns) {
			var mData = d;
			var columns = columns[d.type];
			// $scope.$broadcast('moodal', d);
			$scope.modalInstance = $modal.open({
				templateUrl: 'tableModal.html',
				controller: ModalInstanceCtrl,
				keyboard: true,
				resolve: {
					data: function() {
						return {data: mData, columns: columns};
					}
				},
				windowClass: 'modalTable'
			});
		};
		var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
			$scope.ok = function () {
				$modalInstance.close();
			};

			$scope.data = [];
			$scope.data.push(data.data);
			$scope.columns = data.columns;
		};



		$scope.description = function (d) {
			$scope.mData = d;
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
						return $location.$$search.ioc;
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
					$scope.columns = data.columns;
					$scope.crossfilterDeep = crossfilter();
					var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
					data.laneGraph.forEach(function(parent) {
						var index = $scope.lanes.indexOf(parent[0].type.replace('_ioc', ''));
						parent.forEach(function(child) {
							child.dd = dateFormat.parse(child.time);
							child.segment = d3.time.hour(child.dd);
							child.lane = index;
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

	// function fishchart(data) {
	// 	var all = [];
	// 	$scope.$broadcast('buildFishChart', {
	// 		maxIOC: data.maxIOC,
	// 		yAxis: data.maxConn,
	// 		xAxis: [parseInt(data.start), parseInt(data.end)]
	// 	})
	// 	for (var n in data.result) {
	// 		data.result[n].forEach(function(d){
	// 			all.push(d);
	// 		})
	// 	}
	// 	$scope.all = all;
	// 	$scope.$broadcast('fishChart', all);
	// 	if(data.info.desc[0]) {
	// 		if (data.info.desc[0].description !== undefined) {
	// 			var description = data.info.desc[0].description;
	// 			var len = description.length;
	// 			if (len > 300) {
	// 				$scope.desc = description.substr(0,300);
	// 				$scope.$broadcast('iocDesc', description);
	// 			} else {
	// 				$scope.desc = description;
	// 			}
	// 		}
	// 	}
	// }
}]);