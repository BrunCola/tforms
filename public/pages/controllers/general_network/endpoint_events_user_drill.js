'use strict';

angular.module('mean.pages').controller('topEndpointEventsUserDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/general_network/endpoint_events_user_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&alert_info='+$location.$$search.alert_info+'&src_user='+$location.$$search.src_user;
	} else {
		query = '/general_network/endpoint_events_user_drill?&alert_info='+$location.$$search.alert_info+'&src_user='+$location.$$search.src_user;
	}
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (data.tables[0] === null) {
			$scope.$broadcast('loadError');
		} else {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

			$scope.data = data;

			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
			$scope.$broadcast('spinnerHide');

		}
	});
}]);