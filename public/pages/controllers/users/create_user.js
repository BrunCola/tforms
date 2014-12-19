'use strict';

angular.module('mean.pages').controller('createUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var query = '/api/users/create_user';
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.users.length === 0) { 
        } else {
            $scope.users = data.users;
            $scope.databases = [];

            $scope.users.filter(function(db){ 
                if($scope.databases.indexOf(db.database) == -1) {
                    $scope.databases.push(db.database)
                }
            });
                
            $scope.showEdit = false;
        }
    });
    if ($scope.global.user !== undefined) {
        if (($scope.global.user.user_level !== "superadmin") && ($scope.global.user.user_level !== "admin")) {
            $location.path("/");
        }
    }

    $scope.setForm = function (form) {
        $scope.createUser = form;
    }

    $scope.createUsers = function (user) {
        if (user.$valid === true) {
            if ((user.password === user.password2) && (user.password !== undefined)) {
                if ($scope.global.user.user_level !== "superadmin") {
                    user.database = "-";
                }
                $http({method: 'POST', url: '/api/users/create_user?type=createNewUser', data: { email: user.email, username: user.username, password: user.password, db: user.database, user_level: user.user_level }})
                .success(function() {
                    if ($scope.global.user.user_level === "admin") {
                        user.database = $scope.global.user.database;
                    }
                    $scope.users.push({
                        email: user.email,
                        database: user.database,
                        user_level: user.user_level
                    })
                    $scope.createUser = [];
                })
                .error(function(data, status, headers, config) {
                    if (status == 500) {
                        alert("email already in use");
                    }
                });
            } else {
                alert("passwords do not match or is null");
            }
        } else {
            alert("Not all fields are filled correctly");
        }
    }

    $scope.editUser = function (user) {
        $http({method: 'GET', url: '/api/users/create_user?type=editUser&userEmail='+user.email}).
            success(function(data) {
            if (data[0] !== undefined) { 
                $scope.showEdit = true;
                for (var d in data[0]) {
                    // if ((d === "hide_proxy") || (d === "hide_stealth")) {
                    //     $scope.accessInfo[d] = data[0][d];
                    // }
                    $scope.createUser[d] = data[0][d];
                }
            }
        });           
    }

    $scope.submitEditUser = function (user) {
        if (user.$valid === true) {
            if ((user.password === user.password2) && (user.password !== undefined)) {
                $http({method: 'POST', url: '/api/users/create_user?type=submitEditUser', data: { email: user.email, username: user.username, password: user.password, db: user.database, user_level: user.user_level }})
                .success(function() {
                    $scope.users.map(function(d, i){
                        if (d.email === user.email) {
                            $scope.users.splice(i, 1);
                        }
                    })
                    $scope.users.push({
                        email: user.email,
                        database: user.database,
                        user_level: user.user_level
                    })
                    $scope.showEdit = false;  
                    $scope.createUser = [];
                })  
            } else {
                alert("passwords do not match or is null");
            }   
        } else {
            alert("Not all fields are filled correctly");
        }
    }

    $scope.deleteUser = function (user) {
        $http({method: 'POST', url: '/api/users/create_user?type=deleteUser', data: { email: user.email }})
        .success(function() {
            $scope.users.map(function(d, i){
                if (d.email === user.email) {
                    $scope.users.splice(i, 1);
                }
            })
        })
    }

    $scope.setAccessInfo = function (data) {
         $http({method: 'POST', url: '/api/users/create_user?type=editAccess', data: { email: data.email, hide_stealth: data.hide_stealth, hide_proxy: data.hide_proxy }})
        .success(function() {
            // $scope.showEdit = false;  
            // $scope.createUser = [];
            alert("Access Levels are saved!")
        })
    }

}]);