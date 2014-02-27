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

        //console.log(_this._data);
        return _this._data;
    }
]);


// angular.module('mean.system').factory('tableLink', function() {
// 	return {
// 		click: function() {
// 			alert("I'm foo!");
// 		}
// 	};
// });
