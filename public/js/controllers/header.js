'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', '$rootScope', function ($scope, Global, $rootScope) {
	$scope.global = Global;

	$scope.$watch('search', function(){
		$rootScope.search = $scope.search;
	});

	var socket = io.connect('http://localhost:3000');
	socket.on('initial iocs', function(data){
		$scope.iocalerts = data;
		$scope.$apply();
	});

}]);