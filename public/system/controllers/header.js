'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', '$location', 'socket', '$modal', 'iocIcon', '$http',
    function($scope, $rootScope, Global, $location, socket, $modal, iocIcon, $http) {
        $scope.global = Global;
        $scope.socket = socket;
        // $scope.menus = {};

        // Default hard coded menu items for main menu
        // var defaultMainMenu = [{
        //     'roles': ['authenticated'],
        //     'title': 'Articles',
        //     'link': 'all articles'
        // }, {
        //     'roles': ['authenticated'],
        //     'title': 'Create New Article',
        //     'link': 'create article'
        // }];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        // function queryMenu(name, defaultMenu) {

        //     Menus.query({
        //         name: name,
        //         defaultMenu: defaultMenu
        //     }, function(menu) {
        //         $scope.menus[name] = menu;
        //     });
        // }

        // Query server for menus and check permissions
        // queryMenu('main', defaultMainMenu);

        // $scope.isCollapsed = false;

        // $rootScope.$on('loggedin', function() {
        //     // queryMenu('main', defaultMainMenu);
        //     $scope.global = {
        //         authenticated: !! $rootScope.user,
        //         user: $rootScope.user
        //     };
        // });


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
        // User Settings Modal
        $scope.userSettings = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'userModal.html',
                controller: settingsCtrl
            });
        };
        // console.log(window.user);
        var settingsCtrl = function ($scope, $modalInstance) {
            $scope.ok = function () {
                // $modalInstance.close(window.location.href = '/signout');
                $modalInstance.close();
            };
            $scope.passBad = false;
            $scope.user = {
                email: $scope.global.user.email,
                upassword: null,
                password: null
            };
            $scope.showpass = function() {
                if ($scope.global.user.email !== $scope.user.email) {
                    return true;
                } else if ($scope.user.password !== null) {
                    return true;
                } else {
                    return false;
                }
            };
            $scope.submitForm = function(form) {
             // check to make sure the form is completely valid
             // console.log($scope.user)
             if (form.$valid) {
                 console.log($scope.user);
                 socket.emit('checkPass', {password: $scope.user.upassword, id: $scope.global.user.id});
                 socket.on('passGood', function() {
                     if ($scope.user.password) {
                         socket.emit('updateUser', {id: $scope.global.user.id, email: $scope.user.email, password: $scope.user.upassword, newPass: $scope.user.password});
                         $scope.global.user.email = $scope.user.email;
                         $http.get('/signout')
                         .success(function() {
                             // $http.post('/users/session', {username: $scope.global.user.username, password:$scope.user.password}).success($route.reload())
                             $http.post('/users/session', {username: $scope.global.user.username, password:$scope.user.password}).success()
                             .success(function(){
                                 $modalInstance.close();
                             });
                         });
                     } else if (($scope.user.email !== $scope.global.user.email)) {
                         socket.emit('updateUser', {id: $scope.global.user.id, email: $scope.user.email, password: $scope.user.upassword });
                         $scope.global.user.email = $scope.user.email;
                         $http.get('/signout')
                         .success(function() {
                             // $http.post('/users/session', {username: $scope.global.user.username, password:$scope.user.upassword}).success($route.reload())
                             $http.post('/users/session', { password:$scope.user.upassword}).success()
                             .success(function(){
                                 $modalInstance.close();
                             });
                         });
                     }
                 });
                 socket.on('passBad', function() {
                     $scope.passBad = true;
                 });
             }
            };
        };

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

    // $scope.test = function() {
    //  $scope.socket.emit('report_generate', {email: 'andrewdillion6@gmail.com'});
    // }
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