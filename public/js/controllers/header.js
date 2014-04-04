'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', '$rootScope', '$location', 'socket', '$modal', 'iocIcon', '$http', '$route', function ($scope, Global, $rootScope, $location, socket, $modal, iocIcon, $http, $route) {
	$scope.global = Global;
	$scope.socket = socket;
	$scope.$watch('search', function(){
		$rootScope.search = $scope.search;
	});
	$scope.go = function ( path ) {
		$location.path( path );
	}
	// Session Timeout Modal
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
	// User Settings Modal
	$scope.userSettings = function () {
		var modalInstance = $modal.open({
			templateUrl: 'userModal.html',
			controller: settingsCtrl
		});
	};
	console.log(window.user);
	var settingsCtrl = function ($scope, $modalInstance) {
		$scope.ok = function () {
			// $modalInstance.close(window.location.href = "/signout");
			$modalInstance.close();
		};
		$scope.passBad = false;
		$scope.user = {
			email: window.user.email,
			username: window.user.username,
			upassword: null,
			password: null
		}
		$scope.showpass = function() {
			console.log($scope.user.password)
			if (window.user.email !== $scope.user.email) {
				return true;
			} else if (window.user.username !== $scope.user.username) {
				return true;
			} else if ($scope.user.password !== null) {
				return true;
			} else {
				return false;
			}
		}
		$scope.submitForm = function(form) {
			// check to make sure the form is completely valid
			// console.log($scope.user)
			if (form.$valid) {
				console.log($scope.user)
				socket.emit('checkPass', {password: $scope.user.upassword, id: window.user.id});
				socket.on('passGood', function() {
					if ($scope.user.password) {
						socket.emit('updateUser', {id: window.user.id, email: $scope.user.email, password: $scope.user.upassword, username: $scope.user.username, newPass: $scope.user.password});
						window.user.email = $scope.user.email;
						window.user.username = $scope.user.username;
						$http.get('/signout')
						.success(function() {
							$http.post('/users/session', {username: window.user.username, password:$scope.user.password}).success($route.reload())
							.success(function(){
								$modalInstance.close();
							})
						});
					} else if (($scope.user.email !== window.user.email) || ($scope.user.username !== window.username)) {
						socket.emit('updateUser', {id: window.user.id, email: $scope.user.email, password: $scope.user.upassword, username: $scope.user.username});
						window.user.email = $scope.user.email;
						window.user.username = $scope.user.username;
						$http.get('/signout')
						.success(function() {
							$http.post('/users/session', {username: window.user.username, password:$scope.user.upassword}).success($route.reload())
							.success(function(){
								$modalInstance.close();
							})
						});
					}
				});
				socket.on('passBad', function() {
					$scope.passBad = true;
				});
			}
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
			d.icon = iocIcon(d.ioc_severity);
		})
		$scope.iocalerts = data;
		$scope.$apply();
	});
	$scope.socket.on('newIOC', function(data, iCount){
		$scope.iocCount += iCount;
		$scope.iocalerts.splice(0, data.length);
		data.forEach(function(d){
			$rootScope.$broadcast('newNoty', d.ioc);
			if (d.newIOC == true) {
				d.class = 'flagged_drop'
			}
			d.icon = iocIcon(d.ioc_severity);
			$scope.iocalerts.splice(0, 0, d);
		})
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