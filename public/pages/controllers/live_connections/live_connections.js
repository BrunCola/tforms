'use strict';

angular.module('mean.pages').controller('liveConnectionsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;

	var query = '/live_connections/live_connections';
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		$scope.$broadcast('map', data.map);
	});
}]);