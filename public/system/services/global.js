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
