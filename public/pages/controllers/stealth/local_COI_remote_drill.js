'use strict';

angular.module('mean.pages').controller('localCoiRemoteDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/stealth/local_COI_remote_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&src_ip='+$location.$$search.src_ip;
	} else {
		query = '/stealth/local_COI_remote_drill?src_ip='+$location.$$search.src_ip;
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



	$http({method: 'GET', url: query}).
	success(function(data) {
		$scope.data = data;
		$scope.crossfilterData = crossfilter();
		// var laneIndex = 0;
		if ($scope.global.user.level === 3) {
			$scope.lanes = ['conn', 'file', 'dns', 'http', 'ssl', 'endpoint', 'stealth'];
		} else {
			$scope.lanes = ['conn', 'file', 'dns', 'http', 'ssl', 'endpoint'];
		}
		var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
		data.laneGraph.forEach(function(parent) {
			var index = $scope.lanes.indexOf(parent[0].type.replace('_ioc', ''));
			parent.forEach(function(child) {
				child.dd = dateFormat.parse(child.time);
				child.segment = d3.time.hour(child.dd);
				child.lane = index;
			})
			$scope.crossfilterData.add(parent);
		});
		$scope.$broadcast('laneGraph');
		$scope.$broadcast('sankey_new', data.sankey, null);
		$scope.$broadcast('spinnerHide');


		$scope.open = function (d, columns) {
			console.log(d);
			console.log(columns)
			$scope.mData = d;
			$scope.columns = columns;
			// $scope.$broadcast('moodal', d);
			$scope.modalInstance = $modal.open({
				templateUrl: 'tableModal.html',
				controller: ModalInstanceCtrl,
				keyboard: true,
				resolve: {
					data: function() {
						return {data: $scope.mData, columns: $scope.columns};
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
			var query = '/stealth/local_COI_remote_drill?start='+minUnix+'&end='+maxUnix+'&src_ip='+$location.$$search.src_ip+'&type=drill';
			$http({method: 'GET', url: query}).
				success(function(data) {
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




	$scope.$on('grouping', function (event, val){
		$http({method: 'GET', url: query+'&group='+val}).
		success(function(data) {
			fishchart(data);
		});
	})





}]);