'use strict';

//Global service for global variables
angular.module('mean.system').factory('Global', [
	function() {
		var _this = this;
		_this._data = {
				user: window.user,
				authenticated: !! window.user,
				startTime: window.startTime,
				endTime: window.endTime
		};
		return _this._data;
	}
]);

// angular.module('mean.system').factory('breadcrumbs', ['$rootScope', '$location', function($rootScope, $location){

// 	var breadcrumbs = [];
// 	var breadcrumbsService = {};

// 	//we want to update breadcrumbs only when a route is actually changed
// 	//as $location.path() will get updated imediatelly (even if route change fails!)
// 	$rootScope.$on('$routeChangeSuccess', function(event, current){

// 		var pathElements = $location.path().split('/'), result = [], i;
// 		var breadcrumbPath = function (index) {
// 			return '/' + (pathElements.slice(0, index + 1)).join('/');
// 		};

// 		pathElements.shift();
// 		for (i=0; i<pathElements.length; i++) {
// 			result.push({name: pathElements[i], path: breadcrumbPath(i)});
// 		}

// 		breadcrumbs = result;
// 	});

// 	breadcrumbsService.getAll = function() {
// 		return breadcrumbs;
// 	};

// 	breadcrumbsService.getFirst = function() {
// 		return breadcrumbs[0] || {};
// 	};

// 	return breadcrumbsService;
// }]);


// angular.module('mean.system').factory('socket', ['$location', '$rootScope',
// 	function($location, $rootScope) {
// 		var socket = io.connect('https://'+$location.$$host+':'+$location.$$port, {secure: true});
// 			return {
// 				on: function (eventName, callback) {
// 					socket.on(eventName, function () {
// 						var args = arguments;
// 						$rootScope.$apply(function () {
// 							callback.apply(socket, args);
// 						});
// 					});
// 				},
// 				emit: function (eventName, data, callback) {
// 					socket.emit(eventName, data, function () {
// 					var args = arguments;
// 					$rootScope.$apply(function () {
// 						if (callback) {
// 							callback.apply(socket, args);
// 						}
// 					});
// 				})
// 			}
// 		};
// 	}
// ]);
angular.module('mean.system').factory('socket', ['$location',
	function($location) {
		var socket = io.connect('https://'+$location.$$host+':'+$location.$$port, {secure: true});
		return socket;
	}
]);

angular.module('mean.system').factory('iocIcon',
	function() {
		var iocIcon = function(severity) {
			switch(severity){
				case 1:
					return 'fa-flag';
					break;
				case 2:
					return 'fa-bullhorn';
					break;
				case 3:
					return 'fa-bell';
					break;
				case 4:
					return 'fa-exclamation-circle';
					break;
				default:
					return 'fa-question';
			}
		}
		return iocIcon;
	}
);

// angular.module('mean.system').factory('active', ['$location',
// 	function($location) {
// 		var active = function(link) {
// 			if ()
// 		}
// 	}
// ]);