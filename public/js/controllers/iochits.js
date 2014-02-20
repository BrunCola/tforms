'use strict';

angular.module('mean.iochits').controller('IochitsController', ['$scope', 'Global', '$http', function ($scope, Global, $http) {
    $scope.global = Global;
    $scope.onPageLoad = function() {
		$http({method: 'GET', url: '/iochits'}).
		// success(function(data, status, headers, config) {
		success(function(data) {

			var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
			//console.log(data.crossfilter);
			data.crossfilter.forEach(function(d) {
				//console.log(d.count);
				d.dd = dateFormat.parse(d.time);
				//d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});


			$scope.data = data;
			$scope.$broadcast('tableLoad');
			//$scope.$broadcast('sevChart');
			$scope.$broadcast('rowChart');










			//$scope.$broadcast('sevChart');
			//$scope.crossfilter =
			//console.log('broadcast sent');
			//
		})
    };


}]);