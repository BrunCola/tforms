'use strict';

angular.module('mean.controllers.login', [])
    .controller('LoginCtrl', ['$scope','Global','$rootScope','$http','$location','$window', function($scope, Global, $rootScope, $http, $location, $window) {
        $scope.global = Global;
        // This object will be filled by the form
        $scope.user = {};
        $scope.version = $scope.global.version;
        // Register the login() function
        $scope.login = function(){
            $http.post('/login', $scope.user)
                .success(function(user){
                    console.log($scope.global.user)
                    $window.sessionStorage.token = user.token;
                    if ($scope.global.user.first_login === 1) {
                        $location.url('/first_login');
                    } else {
                        $location.url('/home');
                    }   
                })
                .error(function() {
                    $scope.loginerror = 'Error: Invalid user, password, or two-step authentication code';
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                });
        };
    }])