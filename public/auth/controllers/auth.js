'use strict';

angular.module('mean.controllers.login', [])
    .controller('LoginCtrl', ['$scope','Global','$rootScope','$http','$location','$window', function($scope, Global, $rootScope, $http, $location, $window) {
        $scope.global = Global;
        // This object will be filled by the form
        $scope.user = {};
        $scope.version = $scope.global.version;
        // delete any tokens upon visit
        // delete $window.sessionStorage.token;
        // Register the login() function
        $scope.login = function(){
            $http.post('/auth', $scope.user)
                .success(function(user){
                    $window.sessionStorage.token = user.token;
                    if (user.twoAuth) {
                        $location.url('/2step');
                    } else {
                        $location.url('/ioc_events');
                    }
                })
                .error(function() {
                    $scope.loginerror = 'Error: Invalid user or password';
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                });
        };
    }])
angular.module('mean.controllers.twoStep', [])
    .controller('twoStep', ['$scope','Global','$rootScope','$http','$location','$window', function($scope, Global, $rootScope, $http, $location, $window) {
        $scope.global = Global;
        $scope.login = function(){
            $http.post('/2factor/verify', $scope.user)
                .success(function(user){
                    // assign new token (by replacing old one)
                    $window.sessionStorage.token = user.token;
                    $location.url('/ioc_events');
                })
                .error(function() {
                    $scope.loginerror = 'Error: Invalid two-step authentication code';
                });
        };
    }])