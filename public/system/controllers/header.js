'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', '$location', 'socket', '$modal', 'iocIcon', '$http', '$state', '$upload',
	function($scope, $rootScope, Global, $location, socket, $modal, iocIcon, $http, $state, $upload) {
		$scope.global = Global;
		$scope.socket = socket;

		$scope.reload = function ( path ) {
			var searchObj = {};
			searchObj.start = moment().subtract('days', 1).unix();
			searchObj.end = moment().unix();
			$state.go('ioc_events', searchObj);
		};

		// session modal settings
		$scope.$watch('search', function(){
			$rootScope.search = $scope.search;
		});
		$scope.go = function ( path ) {
			$location.path(path);
		};
		// Session Timeout Modal
		$scope.open = function () {
			$scope.modalInstance = $modal.open({
				templateUrl: 'sessionModal.html',
				controller: ModalInstanceCtrl,
				keyboard: false
			});
		};
		var ModalInstanceCtrl = function ($scope, $modalInstance) {
			$scope.ok = function () {
				$modalInstance.close(window.location.href = '/logout');
			};
		};
		$scope.retest = function(){
			console.log('boom')
			socket.emit('checkreport');
			$http.post('/uploads', {test: 'test'}).success(successCallback);
		}
		// User Settings Modal
		$scope.userSettings = function () {
			$scope.modalInstance = $modal.open({
				templateUrl: 'userModal.html',
				controller: settingsCtrl,
				resolve: {
					user: function() {
						return $scope.global.user;
					}
				},
			});
		};
		var settingsCtrl = function ($scope, $modalInstance, user) {
			$scope.ok = function () {
				$modalInstance.close();
			};
			$scope.passBad = false;
			$scope.user = {
				email: user.email,
				password: null,
				cpassword: null
			};
			$scope.submitForm = function(form) {
				// check to make sure the form is completely valid
				if (form.$valid) {
					if (($scope.user.password) && ($scope.user.cpassword === $scope.user.password)) {
						socket.emit('updateUser', { oldemail: user.email, newemail: $scope.user.email, newPass: $scope.user.password });
						$http.get('/logout')
							.success(function() {
							window.location.href = '/';
							// $http.post('/users/session', {username: user.username, password:$scope.user.password}).success($route.reload())
							// $http.post('/login', {email: $scope.user.email, password:$scope.user.password}).success($modalInstance.close(window.location.href = '/'))
						});
					} else if ($scope.user.email !== user.email) {
						socket.emit('updateUser', { oldemail: user.email, newemail: $scope.user.email });
						$http.get('/logout')
							.success(function() {
							window.location.href = '/';
							// $http.post('/users/session', {username: $scope.global.user.username, password:$scope.user.upassword}).success($route.reload())
							// $http.post('/login', {email: $scope.user.email, password:$scope.user.upassword}).success(window.location.href = '/')
							// .success(function(){
							//     $modalInstance.close();
							// });
						});
					}
				}
			};
		};


		// report modal
		$scope.reportSettings = function () {
			$scope.modalInstance = $modal.open({
				templateUrl: 'reportModal.html',
				controller: reportCtrl
			});
		};
		// console.log(window.user);
		var reportCtrl = function ($scope, $modalInstance) {
			$scope.ok = function () {
				// $modalInstance.close(window.location.href = '/signout');
				$modalInstance.close();
			};
			$scope.report = {};
			$scope.submitForm = function(form) {
				// check to make sure the form is completely valid
				// console.log($scope.user)
				if (form.$valid) {
					socket.emit('report_generate', {
						email: $scope.report.email,
						subject: $scope.report.subject,
						body: $scope.report.body,
						file: $scope.report.file,
						database: $scope.report.database
					});
				}
			};
		};

		$scope.uploadOpen = function () {
			$scope.modalInstance = $modal.open({
				templateUrl: 'uploadModal.html',
				controller: uploadInstanceCtrl,
				keyboard: true,
				// resolve: {
				// 	$upload: $upload
				// }
			});
		};
		var uploadInstanceCtrl = function ($scope, $modalInstance, $upload) {
			$scope.onFileSelect = function($files) {
				//$files: an array of files selected, each file has name, size, and type.
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/uploads', //upload.php script, node.js route, or servlet url
						method: 'POST',
						data: { myObj: $scope.fileUploadObj },
						file: file, // or list of files: $files for html5 only
					}).progress(function(evt) {
						console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						// file is uploaded successfully
						console.log('done');
						console.log(data)
					});
				}
			};
		};



		// $scope.test = function() {
		//  $scope.socket.emit('report_generate', {email: 'andrewdillion6@gmail.com'});
		// }

		// IOC notification settings
		$scope.socket.on('disconnect', function(){
			$scope.open();
		});
		$scope.iocalerts = [];
		$scope.socket.emit('init', {username: $scope.global.user.username, checkpoint: $scope.global.user.checkpoint, database: $scope.global.user.database});
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
			$scope.socket.emit('checkpoint', {username: $scope.global.user.username, id: $scope.global.user.id});
			$rootScope.$broadcast('killNoty');
			$scope.flagged_drop = '';
			for (var i in $scope.iocalerts) {
				$scope.iocalerts[i].class = '';
				$scope.iocalerts[i].newIOC = false;
			}
		}
}]);