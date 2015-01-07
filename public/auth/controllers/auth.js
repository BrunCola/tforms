'use strict';

angular.module('mean.controllers.login', [])
    .controller('LoginCtrl', ['$scope','Global','$rootScope','$http','$location','$window', function($scope, Global, $rootScope, $http, $location, $window) {
        $scope.global = Global;
        // This object will be filled by the form
        $scope.user = {};
        $scope.version = $scope.global.version;
        // Register the login() function
        $scope.login = function(){
            $http.post('/auth', $scope.user)
                .success(function(user){
                    $window.sessionStorage.token = user.token;
                    $location.url('/home');
                })
                .error(function() {
                    $scope.loginerror = 'Error: Invalid user or password';
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                });
        };
    }])