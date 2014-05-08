'use strict';

//Setting up route
angular.module('mean.system').config(['$stateProvider', '$urlRouterProvider',
		function($stateProvider, $urlRouterProvider) {

			var checkLoggedin = function($q, $timeout, $http, $location) {
				// Initialize a new promise
				var deferred = $q.defer();

				// Make an AJAX call to check if the user is logged in
				$http.get('/loggedin').success(function(user) {
					// Authenticated
					if (user !== '0')
						$timeout(deferred.resolve, 0);

					// Not Authenticated
					else {
						$timeout(function() {
							deferred.reject();
						}, 0);
						$location.url('/login');
					}
				});

				return deferred.promise;
			};

			// For unmatched routes:
			$urlRouterProvider.otherwise('/ioc_events');

			// states for my app
			$stateProvider
				.state('auth', {
					templateUrl: 'public/auth/views/index.html'
				});
		}
	])
	.config(['$locationProvider',
		function($locationProvider) {
			$locationProvider.hashPrefix('!');
		}
	]);
