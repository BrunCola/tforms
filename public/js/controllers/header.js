'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', '$rootScope', function ($scope, Global, $rootScope) {
	$scope.global = Global;
	//$scope.global.search = $scope.search;
	//$scope.global.search = $scope.search;

	//$scope.search = $scope.search;
	// $scope.watch('search', function () {
	// 	var search = $scope.search;
	// 	$scope.global.search = search;
	// });
	//$rootScope.search = $scope.search;

	$scope.$watch('search', function(){
		$rootScope.search = $scope.search;
	});

}]);