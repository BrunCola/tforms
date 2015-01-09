'use strict';

//Setting up route
angular.module('mean.system').config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            var checkLoggedIn = function($q, $timeout, $http, $location, $window, Global) {
                // Initialize a new promise
                var deferred = $q.defer();
                // Make an AJAX call to check if the user is logged in
                if ($window.sessionStorage.token) {
                    $http.get('/api/loggedin')
                        .success(function(user) {
                            Global.user = user;
                            if (user.first_login === 1) {
                                $location.url('/first_login');
                            } else {
                                $timeout(deferred.resolve);
                            }   
                        })
                        .error(function(user) {
                            $timeout(deferred.reject);
                            $location.url('/login');
                        })
                } else {
                    $timeout(deferred.reject);
                    $location.url('/login');
                }
                return deferred.promise;
            };

            // Check if the user is not conntected
            var checkLoggedOut = function($q, $timeout, $http, $location, $window) {
                // Initialize a new promise
                var deferred = $q.defer();
                // if there's still a token, take them back home (not login page)
                if ($window.sessionStorage.token) {
                    $http.get('/api/loggedin')
                        .success(function(user) {
                            // if success
                            $timeout(deferred.reject);
                            // go home
                            $location.url('/ioc_events');
                        })
                        .error(function(user) {
                            $timeout(deferred.resolve);
                        })
                } else {
                    $timeout(deferred.resolve);
                }
                return deferred.promise;
            };

            // For unmatched routes:
            $urlRouterProvider.otherwise('/ioc_events');
            // states for my app
            $stateProvider
                .state('auth', {
                    templateUrl: 'public/auth/views/index.html',
                    resolve: {
                        loggedin: checkLoggedOut
                    }
                })
                .state('pages', {
                    templateUrl: 'public/pages/views/index.html',
                    resolve: {
                        loggedin: checkLoggedIn
                    },
                })
                .state('survey', {
                    url: '/survey',
                    templateUrl: 'public/pages/views/survey/survey.html',
                    data: {
                        title: 'Site Survey',
                        daterange: false
                    },
                });
        }
    ])
    .config(['$locationProvider',
        function($locationProvider) {
            // $locationProvider.hashPrefix('!'); // previous url config
            $locationProvider.html5Mode(true); // new url config (no #! prepended)
        }
    ]);
