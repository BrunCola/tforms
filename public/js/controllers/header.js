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

	// $scope.socket.on('disconnected', function(){
	// 	console.log('disconnected');
	// });

	$scope.socket.emit('init', {username: window.user.username, checkpoint: window.user.checkpoint});
	//$scope.socket.emit('init', {username: 'rapidPHIRE', database: 'rapidPHIRE'});
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
	// $scope.socket.on('checkpointSet', function(data){
	// 	window.user.checkpoint = data;
	// 	console.log(window.user);
	// });

	// $scope.socket.on('newIOC', function(data){
	// 	// window.user.checkpoint = data;
	// 	console.log(data);
	// 	console.log('NEW IOC');
	// 	// console.log(window.user);
	// });

	$scope.checkpoint = function() {
		//socket.emit('checkpoint', JSON.stringify(window.user));
		$scope.socket.emit('checkpoint', {username: window.user.username, id: window.user.id});
		//$rootScope.$broadcast('newNoty', 'Test');
	}

}]);