'use strict';

angular.module('mean.pages').controller('endpointEventsLocalAlertInfoDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/local_events/endpoint_events_local_alert_info_drill?start='+$location.$$search.start+'&end='+$location.$$search.end+'&alert_info='+$location.$$search.alert_info+'&src_ip='+$location.$$search.src_ip;
	} else {
		query = '/local_events/endpoint_events_local_alert_info_drill?&alert_info='+$location.$$search.alert_info+'&src_ip='+$location.$$search.src_ip;
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