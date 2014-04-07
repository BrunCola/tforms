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