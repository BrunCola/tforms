'use strict';

angular.module('mean.iochits').controller('IOCremote2LocalController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/ioc_top_remote2local?start='+$routeParams.start+'&end='+$routeParams.end+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		} else {
			query = '/ioc_top_remote2local?remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			$scope.data = data;

			$scope.$broadcast('tableLoad');
			$scope.$broadcast('spinnerHide');
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);
