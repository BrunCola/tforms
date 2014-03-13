'use strict';

angular.module('mean.iochits').controller('localDrillController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', 'socket', function ($scope, Global, $http, $routeParams, $rootScope, socket) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/local_drill?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/local_drill'
		}
		$scope.socket.emit('test', {});
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			console.log(data);
			// var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			// data.crossfilter.forEach(function(d) {
			// 	d.dd = dateFormat.parse(d.time);
			// 	d.hour = d3.time.hour(d.dd);
			// 	d.count = +d.count;
			// });
			// $scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			$scope.$broadcast('swimChart', data.swimchart);

			// if (data.crossfilter.length === 0) {
			// 	$scope.$broadcast('loadError');
			// }
		});

		//Broadcast swimchart and have it setup the inital socket connection

		// $scope.$broadcast('swimChart');
		$rootScope.pageTitle = 'SET TITLE';
	};
	$rootScope.rootpage = true;
}]);
