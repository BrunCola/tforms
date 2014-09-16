'use strict';

angular.module('mean.pages').controller('usersCoiGroupsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;

	query = '/local_events/users_COI_groups?';
	
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (!data.force) {
			$scope.$broadcast('loadError');
		} else {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

			$scope.data = data;

			$scope.$broadcast('stealthForceChart', data.force, {height: 1000});
			
			$scope.$broadcast('spinnerHide');

		}
	});
}]);