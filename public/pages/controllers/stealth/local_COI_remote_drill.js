'use strict';

angular.module('mean.pages').controller('localCoiRemoteDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/stealth/local_COI_remote_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+$location.$$search.lan_ip+'&lan_user='+$location.$$search.lan_user;
	} else {
		query = '/stealth/local_COI_remote_drill?lan_ip='+$location.$$search.lan_ip+'&lan_user='+$location.$$search.lan_user;
	}

	// $http({method: 'GET', url: query}).
	// //success(function(data, status, headers, config) {
	// success(function(data) {
	// 	if (data.sankey === null) {
	// 		$scope.$broadcast('loadError');
	// 	} else {
	// 		$scope.open = function (d) {
	// 			$scope.mData = d;
	// 			// $scope.$broadcast('moodal', d);
	// 			$scope.modalInstance = $modal.open({
	// 				templateUrl: 'tableModal.html',
	// 				controller: ModalInstanceCtrl,
	// 				keyboard: true,
	// 				resolve: {
	// 					data: function() {
	// 						return $scope.mData;
	// 					}
	// 				},
	// 				windowClass: 'modalTable'
	// 			});
	// 		};
	// 		var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
	// 			$scope.ok = function () {
	// 				$modalInstance.close();
	// 			};
	// 			$scope.data = data;
	// 		}
	// 		var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

	// 		$scope.data = data;
	// 		$scope.$broadcast('sankey_new', data.sankey, null);
	// 		fishchart(data);

	// 		$scope.$broadcast('spinnerHide');
	// 	}
	// });

	$scope.clickedNode = function(d) {
		console.log(d)
	}

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
		$scope.$broadcast('spinnerHide');
		$scope.$broadcast('networkChart', data.network);

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
			var query = '/stealth/local_COI_remote_drill?start='+minUnix+'&end='+maxUnix+'&lan_ip='+$location.$$search.lan_ip+'&lan_user='+$location.$$search.lan_user+'&type=drill';
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
						$scope.crossfilterData.add(parent);
					});
					var itemsDimension = $scope.crossfilterDeep.dimension(function(d){ return d.time });
					$scope.deepItems = itemsDimension.top(Infinity);
					callback($scope.deepItems);
					$scope.alert.style('display', 'block');
				});
		}
	}



}]);