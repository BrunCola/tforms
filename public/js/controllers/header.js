'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', '$rootScope', '$location', function ($scope, Global, $rootScope, $location) {
	$scope.global = Global;

	$scope.$watch('search', function(){
		$rootScope.search = $scope.search;
	});

	$scope.go = function ( path ) {
		$location.path( path );
	};

	var socket = io.connect('http://localhost:3000');
	socket.on('initial iocs', function(data){
		$scope.iocalerts = data;
		$scope.$apply();
	});

}]);