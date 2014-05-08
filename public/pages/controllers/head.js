'use strict';

angular.module('mean.pages').controller('headController', ['$scope', 'Global', '$rootScope', '$location', '$state', function ($scope, Global, $rootScope, $location, $state) {
	$scope.global = Global;
	//$scope.breadcrumbs = breadcrumbs;

	//this can be used for date selector
	$scope.onHeadLoad = function() {
		if ($location.$$search.start && $location.$$search.end) {
			$scope.start = moment.unix($location.$$search.start).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($location.$$search.end).format('MMMM D, YYYY h:mm A');
			$rootScope.start = moment.unix($location.$$search.start).format('MMMM D, YYYY h:mm A');
			$rootScope.end = moment.unix($location.$$search.end).format('MMMM D, YYYY h:mm A');
		} else {
			$scope.start = moment.unix($scope.global.startTime).format('MMMM D, YYYY h:mm A');
			$scope.end = moment.unix($scope.global.endTime).format('MMMM D, YYYY h:mm A');
			$rootScope.start = moment.unix($scope.global.startTime).format('MMMM D, YYYY h:mm A');
			$rootScope.end = moment.unix($scope.global.endTime).format('MMMM D, YYYY h:mm A');
		}
	};
	$scope.title = $state.current.data.title;
	$scope.daterange = $state.current.data.daterange;
	if ($location.$$absUrl.search('/report#!/') === -1) {
		$scope.isReport = false;
		$scope.isNotReport = true;
	} else {
		console.log('is report')
		$scope.isReport = true;
		$scope.isNotReport = false;
	}
}]);