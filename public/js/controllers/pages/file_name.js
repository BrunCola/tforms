'use strict';

angular.module('mean.iochits').controller('fileNameController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/file_name?start='+$routeParams.start+'&end='+$routeParams.end+'&mime='+$routeParams.mime;
		} else {
			query = '/file_name?mime='+$routeParams.mime;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			$scope.data = data;

			$scope.$broadcast('tableLoad');
			$scope.$broadcast('spinnerHide');
		});
		$rootScope.pageTitle = 'Extracted Files';
	};
	$rootScope.rootpage = true;
}]);