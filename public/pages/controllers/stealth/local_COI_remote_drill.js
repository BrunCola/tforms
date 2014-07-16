'use strict';

angular.module('mean.pages').controller('localCoiRemoteDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/stealth/local_COI_remote_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&ip='+$location.$$search.ip;
	} else {
		query = '/stealth/local_COI_remote_drill?ip='+$location.$$search.ip;
	}

	function fishchart(data) {
		var all = [];
		$scope.$broadcast('fishChartData', {
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
	}

	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (data.sankey === null) {
			$scope.$broadcast('loadError');
		} else {
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
			}
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

			$scope.data = data;
			$scope.$broadcast('sankey_new', data.sankey, null);
			fishchart(data);

			$scope.$broadcast('spinnerHide');
		}
	});
}]);