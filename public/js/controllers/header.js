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
	$scope.iocalerts = [];
	$scope.socket.emit('init', {username: window.user.username, checkpoint: window.user.checkpoint, database: window.user.database});
	$scope.socket.on('initial iocs', function(data, count){
		$scope.iocCount = 0;
		if (count > 0) {
			$scope.iocCount = count;
		}
		data.forEach(function(d){
			if (d.newIOC == true) {
				d.class = 'flagged_drop';
			}
		})
		$scope.iocalerts = data;
		$scope.$apply();
	});
	$scope.socket.on('newIOC', function(data, iCount){
		$scope.iocCount += iCount;
		data.forEach(function(d){
			$rootScope.$broadcast('newNoty', d.ioc);
			if (d.newIOC == true) {
				d.class = 'flagged_drop'
			}
		})
		$scope.iocalerts.splice(0, data.length);
		for (var i in data) {
			$scope.iocalerts.splice(0, 0, data[i]);
		}
		$scope.$apply();
	});
	$scope.checkpoint = function() {
		$scope.iocCount = 0;
		$scope.socket.emit('checkpoint', {username: window.user.username, id: window.user.id});
		$rootScope.$broadcast('killNoty');
		$scope.flagged_drop = '';
		for (var i in $scope.iocalerts) {
			$scope.iocalerts[i].class = '';
			$scope.iocalerts[i].newIOC = false;
		}
	}

}]);