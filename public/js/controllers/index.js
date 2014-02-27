'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', 'Global', '$routeParams', function ($scope, Global, $routeParams) {
	$scope.global = Global;
	//this can be used for date selector
	$scope.onHeadLoad = function() {
		//console.log('test');
		if ($routeParams.start && $routeParams.end) {
			$scope.start = moment.unix($routeParams.start).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($routeParams.end).format('MMMM D, YYYY h:mm A');
		} else {
			$scope.start = $scope.global.startTime;
			$scope.end = $scope.global.endTime;
		}
	};
}]);