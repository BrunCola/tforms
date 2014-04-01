'use strict';

angular.module('mean.iochits').controller('IndexController', ['$scope', 'Global', '$routeParams', '$rootScope', function ($scope, Global, $routeParams, $rootScope) {
	$scope.global = Global;
	//$scope.breadcrumbs = breadcrumbs;

	//this can be used for date selector
	$scope.onHeadLoad = function() {
		//console.log('test');
		if ($routeParams.start && $routeParams.end) {
			$scope.start = moment.unix($routeParams.start).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($routeParams.end).format('MMMM D, YYYY h:mm A');
			$rootScope.start = moment.unix($routeParams.start).format('MMMM D, YYYY h:mm A');
			$rootScope.end = moment.unix($routeParams.end).format('MMMM D, YYYY h:mm A');
		} else {
			$scope.start = moment.unix($scope.global.startTime).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($scope.global.endTime).format('MMMM D, YYYY h:mm A');
			$rootScope.start = moment.unix($scope.global.startTime).format('MMMM D, YYYY h:mm A');
			$rootScope.end = moment.unix($scope.global.endTime).format('MMMM D, YYYY h:mm A');
		}
		// $scope = $rootScope;
		$rootScope.$watch('rootpage', function(){
			$scope.rootpage = $rootScope.rootpage;
		})
	};
}]);