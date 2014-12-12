'use strict';

angular.module('mean-factory-interceptor',[])
    .factory('httpInterceptor', ['$q', '$location', '$window', function ($q, $location, $window) {
         return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
                return config;
            },
            response: function (response) {
                if ((response.status === 401) || (response.status === 500)) {
                    $location.url('/login');
                }
                return response || $q.when(response);
            }
        };
    }
    ])
//Http Intercpetor to check auth failures for xhr requests
    .config(['$httpProvider',function($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]);