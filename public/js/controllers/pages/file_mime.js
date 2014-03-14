'use strict';

angular.module('mean.iochits').controller('fileMimeController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/file_mime?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/file_mime'
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