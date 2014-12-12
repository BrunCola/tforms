'use strict';

//Setting up route
angular.module('mean.auth').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('auth.login', {
                url: '/login',
                templateUrl: 'public/auth/views/login.html'
            })
    }
]);
