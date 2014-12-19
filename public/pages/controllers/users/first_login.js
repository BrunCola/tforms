'use strict';

angular.module('mean.pages').controller('firstLoginController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query = '/api/users/first_login';
    // $http({method: 'GET', url: query}).
    // success(function(data) {
    //     if (data.users.length === 0) { 
    //     } else {
    //         $scope.users = data.users;
    //     }
    // });
    if ($scope.global.user !== undefined) {
        if ($scope.global.user.first_login != 1) {
            $location.path("/");
        }
    }

    $scope.setForm = function (form) {
        $scope.firstLogin = form;
    }

    $scope.savePassword = function (user) {
        console.log(user)
        if (user.$valid === true) {
            if ((user.password === user.password2) && (user.password !== undefined)) {
                $http({method: 'POST', url: '/api/users/first_login?type=savePassword', data: { password: user.password }})
                .success(function() {
                    $location.path("/");
                })  
            } else {
                alert("passwords do not match or is null");
            }   
        } else {
            alert("Not all fields are filled correctly");
        }
    }
}]);