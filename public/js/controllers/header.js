'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', '$rootScope', '$location', 'socket', '$modal', '$log', function ($scope, Global, $rootScope, $location, socket, $modal, $log) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.$watch('search', function(){
		$rootScope.search = $scope.search;
	});

	$scope.go = function ( path ) {
		$location.path( path );
	}

	$scope.open = function () {
		var modalInstance = $modal.open({
			templateUrl: 'sessionModal.html',
			controller: ModalInstanceCtrl,
			keyboard: false
		});
	};

	var ModalInstanceCtrl = function ($scope, $modalInstance) {
		$scope.ok = function () {
			$modalInstance.close(window.location.href = "/signout");
		};
	};

	$scope.socket.on('disconnect', function(){
		$scope.open();
	});

	$scope.socket.emit('init', {username: window.user.username, checkpoint: window.user.checkpoint, database: window.user.database});
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
	// 	console.log('new checkpoint recieved from server: '+data);
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
	// 
	// 
	// 

}]);