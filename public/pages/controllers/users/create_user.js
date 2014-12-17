'use strict';

angular.module('mean.pages').controller('createUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var timer;
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
    setTimeout(function () {
        if ($scope.global.user !== undefined) {
            if ($scope.global.user.level <= 1) {
                $location.path("/");
                $scope.$apply();
            }
        }
    }, 0 );

    $scope.createUsers = function (user) {
        //console.log(user);
        if (user.$valid === true) {
            if ((user.password === user.password2) && (user.password !== undefined)) {
                $http({method: 'POST', url: '/api/users/create_user?type=createNewUser', data: { email: user.email, username: user.username, password: user.password, db: user.database, level: user.level }})
                .success(function() {
                    $scope.users.push({
                        email: user.email,
                        database: user.database,
                        level: user.level
                    })
                    $scope.createUser = [];
                })
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
                $scope.createUser = data[0];
            }
        });           
    }

    $scope.submitEditUser = function (user) {
        //console.log(user);
        if ((user.password === user.password2) && (user.password !== undefined)) {
            $http({method: 'POST', url: '/api/users/create_user?type=submitEditUser', data: { email: user.email, username: user.username, password: user.password, db: user.database, level: user.level }})
            .success(function() {
                $scope.users.map(function(d, i){
                    if (d.email === user.email) {
                        $scope.users.splice(i, 1);
                    }
                })
                $scope.users.push({
                    email: user.email,
                    database: user.database,
                    level: user.level
                })
                $scope.createUser = [];
            })  
        } else {
            alert("passwords do not match or is null");
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

}]);