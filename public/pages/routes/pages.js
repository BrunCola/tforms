'use strict';

//Setting up page routes
angular.module('mean.pages').config(['$stateProvider', '$httpProvider',
    function($stateProvider, $httpProvider) {
        // $httpProvider.interceptors.push('authInterceptor');
        $stateProvider
        
        // HOME
            .state('pages.home', {
                url: '/home',
                templateUrl: 'public/pages/views/home.html',
                data: {
                    title: 'Home',
                }
            })

        // EDIT CLIENT
            .state('pages.client', {
                url: '/client',
                templateUrl: 'public/pages/views/client/client.html',
                data: {
                    title: 'Edit Client',
                }
            })
    }
]);