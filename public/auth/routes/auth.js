'use strict';

//Setting up route
angular.module('mean.auth').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('auth.login', {
                url: '/login',
                templateUrl: 'public/auth/views/login.html'
            })
            .state('auth.twoStep', {
                url: '/2step',
                templateUrl: 'public/auth/views/2step.html'
            })
    }
]);
