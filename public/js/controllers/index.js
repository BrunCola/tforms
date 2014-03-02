'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', 'Global', '$routeParams', '$rootScope', 'breadcrumbs', function ($scope, Global, $routeParams, $rootScope, breadcrumbs) {
	$scope.global = Global;
	$scope.breadcrumbs = breadcrumbs;

	//this can be used for date selector
	$scope.onHeadLoad = function() {
		//console.log('test');
		if ($routeParams.start && $routeParams.end) {
			$scope.start = moment.unix($routeParams.start).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($routeParams.end).format('MMMM D, YYYY h:mm A');
		} else {
			$scope.start = moment.unix($scope.global.startTime).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($scope.global.endTime).format('MMMM D, YYYY h:mm A');
		}
	};
}]);