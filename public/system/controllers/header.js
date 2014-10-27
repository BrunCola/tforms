'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', '$location', 'socket', '$modal', 'iocIcon', '$http', '$state', '$upload', '$timeout',
	function($scope, $rootScope, Global, $location, socket, $modal, iocIcon, $http, $state, $upload, $timeout) {
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
						$http({method: 'POST', url: '/actions/update', data: {newemail: $scope.user.email, newPass: $scope.user.password}}).
							success(function(data, status, headers, config) {
								window.location.href = '/logout';
							})
					} else if ($scope.user.email !== user.email) {
						$http({method: 'POST', url: '/actions/update', data: {newemail: $scope.user.email}}).
							success(function(data, status, headers, config) {
								window.location.href = '/logout';
							})
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


		// UPLOAD PANE
		$scope.uploadOpen = function () {
			$scope.modalInstance = $modal.open({
				templateUrl: 'uploadModal.html',
				controller: uploadInstanceCtrl,
				keyboard: true
			});
		};
		var uploadInstanceCtrl = function ($scope, $modalInstance, $upload) {
			$scope.ok = function () {
				$modalInstance.close();
			};
			$scope.onFileSelect = function($files) {
				$scope.selectedFiles = [];
				$scope.progress = [];
				if ($scope.upload && $scope.upload.length > 0) {
					for (var i = 0; i < $scope.upload.length; i++) {
						if ($scope.upload[i] != null) {
							$scope.upload[i].abort();
						}
					}
				}
				$scope.upload = [];
				$scope.uploadResult = [];
				$scope.selectedFiles = $files;
				$scope.dataUrls = [];
				for ( var i = 0; i < $files.length; i++) {
					var $file = $files[i];
					if (window.FileReader && $file.type.indexOf('image') > -1) {
						var fileReader = new FileReader();
						fileReader.readAsDataURL($files[i]);
						var loadFile = function(fileReader, index) {
							fileReader.onload = function(e) {
								$timeout(function() {
									$scope.dataUrls[index] = e.target.result;
								});
							}
						}(fileReader, i);
					}
					$scope.progress[i] = -1;
					$scope.start(i);
				}
			};
			$scope.start = function(index) {
				$scope.progress[index] = 0;
				$scope.errorMsg = null;
				$scope.upload[index] = $upload.upload({
					url : '/uploads',
					method: 'POST',
					data : {
						myModel : $scope.myModel
					},
					file: $scope.selectedFiles[index],
				}).then(function(response) {
					$scope.uploadResult.push(response.data);
				}, function(response) {
					if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
				}, function(evt) {
					// Math.min is to fix IE which reports 200% sometimes
					$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
				}).xhr(function(xhr){
					xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
				});
			};
		};


		// IOC notification settings
		var disconnect = false;
        $scope.socket.on('connection', function() {
            disconnect = false;
            console.log('connected again')
        })
        $scope.socket.on('disconnect', function() {
            disconnect = true;
            setTimeout(function() {
                if (disconnect === true) {
                    $scope.open();
                }
            }, 3600);
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
			$scope.socket.emit('checkpoint', {username: $scope.global.user.username, id: $scope.global.user.id, database: $scope.global.user.database});
			$rootScope.$broadcast('killNoty');
			$scope.flagged_drop = '';
			for (var i in $scope.iocalerts) {
				$scope.iocalerts[i].class = '';
				$scope.iocalerts[i].newIOC = false;
			}
		}
}]);