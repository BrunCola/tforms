'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', '$rootScope', '$location', 'socket', function ($scope, Global, $rootScope, $location, socket) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.$watch('search', function(){
		$rootScope.search = $scope.search;
	});

	$scope.go = function ( path ) {
		$location.path( path );
	}
	//var socket = io.connect('http://localhost:3000');
	$scope.socket.on('initial iocs', function(data){
		$scope.iocCount = 0;
		for (var n in data) {
			if (data[n].newIOC) {
				$scope.iocCount++;
			}
		}
		if (data.length >= 11) {
			$scope.iocalerts = data.reverse().splice(0,10);
		} else {
			$scope.iocalerts = data;
			//emit for more data (send difference and append it to current list)
		}
		$scope.$apply();
	});

	$scope.report = function($event) {
		socket.emit('test', {email: 'andrewdillion6@gmail.com'});
		$rootScope.$broadcast('newNoty', 'Test');
	}

}]);