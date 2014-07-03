'use strict';

angular.module('mean.pages').controller('localCoiRemoteDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/stealth/local_COI_remote_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&ip='+$location.$$search.ip;
	} else {
		query = '/stealth/local_COI_remote_drill?ip='+$location.$$search.ip;
	}
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (data.sankey === null) {
			$scope.$broadcast('loadError');
		} else {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

			$scope.data = data;
			$scope.$broadcast('sankey', data.sankey, null);

			$scope.$broadcast('spinnerHide');
		}
	});
}]);