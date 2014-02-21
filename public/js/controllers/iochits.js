'use strict';

angular.module('mean.iochits').controller('IochitsController', ['$scope', 'Global', '$http', function ($scope, Global, $http) {
    $scope.global = Global;
    $scope.onPageLoad = function() {
		$http({method: 'GET', url: '/iochits'}).
		// success(function(data, status, headers, config) {
		success(function(data) {
			//$scope.oData = data;

			var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
			//console.log(data.crossfilter);
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				//console.log(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			$scope.cf_data = crossfilter(data.crossfilter); // feed it through crossfilter
			$scope.all = $scope.cf_data.groupAll();

			//console.log(data.crossfilter);

			//console.log($scope.world);
			$scope.data = data;
			$scope.$broadcast('tableLoad');
			//$scope.$broadcast('barChart');
			$scope.$broadcast('sevChart');
			$scope.$broadcast('rowChart');
			$scope.$broadcast('geoChart');


			// console.log($scope.cf_data.dimension(function(d){
			// 	return d.value;
			// }).top(Infinity));

		// to-be inserted into keyboard-up crossfilter search
		// var dim = $scope.cf_data.dimension(function(d){ return d});
		// var sort = dim.top(Infinity).filter(function(d) {
		// 	for (var i in d) {
		// 		if (d[i] === "RBN") { //convert to regex
		// 			return d;
		// 		}
		// 	}
		// });


			//$scope.$broadcast('sevChart');
			//$scope.crossfilter =
			//console.log('broadcast sent');
			//
		})
    };


}]);