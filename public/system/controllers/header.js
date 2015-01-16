'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', '$location', '$modal', 'iocIcon', '$http', '$state', '$upload', '$timeout', '$window',
    function($scope, $rootScope, Global, $location, $modal, iocIcon, $http, $state, $upload, $timeout, $window) {
        $scope.global = Global;
        // update password function
        function updatePassword(email, newPassword, callback) {
            $http({method: 'POST', url: '/api/users/updatepass', data: {email: email, newPass: newPassword}}).
                success(function(data, status, headers, config) {
                    callback();
                });
        }
        // update email function
        function updateEmail(email, newEmail, callback) {
            $http({method: 'POST', url: '/api/users/updateemail', data: {email: email, newEmail: newEmail}}).
                success(function(data, status, headers, config) {
                    callback();
                });
        }
        function enable2factor(email, passcode, callback) {
            $http({method: 'POST', url: '/api/users/enable2factor', data: {email: email, passcode: passcode}}).
                success(function(data, status, headers, config) {
                    callback(null, true);
                }).
                error(function(data, status, headers, config) {
                    callback(true, null);
                });
        }
        function disable2factor(email, callback) {
            $http({method: 'POST', url: '/api/users/disable2factor', data: {email: email}}).
                success(function(data, status, headers, config) {
                    callback();
                })
        }
        $scope.logout = function() {
            delete $window.sessionStorage.token;
            $location.url('/login');
        }
        $scope.reload = function ( path ) {
            $location.url(path);
        };
        // session modal settings
        $scope.$watch('search', function() {
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
            // theres another $scope.logout instance here so it can be local to this function/modal
            $scope.logout = function() {
                $modalInstance.close();
                delete $window.sessionStorage.token;
                $location.url('/login');
            }
            var count = 0;      
            $scope.googleSrc = function(){
                count++;
                if ($scope.user.twoStepAuth == 1) {
                    return 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=200x200&chld=M|0&cht=qr&chl=otpauth://totp/'+user.username+'@rapidphire.com%3Fsecret%3D'+user.twoAuthHash+'&issuer=rapidPHIRE';
                }
            }
            $scope.user = {
                email: user.email,
                password: null,
                cpassword: null,
                twoStepAuth: user.two_step_auth,
                prevTwoStepAuth: user.two_step_auth
            };

            $scope.disable2Auth = function() {
                disable2factor(user.email, function(){
                    $modalInstance.close();
                    $scope.logout();
                })
            }

            $scope.submit2Auth = function(form) {
                if (form.$valid) {
                    enable2factor(user.email, $scope.user.verify, function(err, result){
                        if (err) { $scope.twoFactorError = 'Wrong passcode'; return }
                        $modalInstance.close();
                        $scope.logout();
                    })
                }
            }
            $scope.ok = function () {
                $modalInstance.close();
            };
            
            $scope.submitForm = function(form) {
                // check to make sure the form is completely valid
                if (form.$valid) {
                    async.parallel([
                        function(callback){
                            if (($scope.user.password) && ($scope.user.cpassword === $scope.user.password)) {
                                updatePassword(user.email, $scope.user.password, function(){
                                    callback();
                                });
                            } else {
                                callback();
                            }
                        },
                        function(callback){
                            if ($scope.user.email !== user.email) {
                                updateEmail(user.email, $scope.user.email, function(){
                                    callback();
                                });
                            } else {
                                callback();
                            }
                        }
                    ],
                    function(err){
                        $modalInstance.close();
                        $scope.logout();
                    });
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
                            };
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
                    xhr.upload.addEventListener('abort', function() { 
                        console.log('abort complete');
                    }, false);
                });
            };
        };

        // session modal
        // $scope.open();


    }
]);
