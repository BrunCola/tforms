'use strict';

angular.module('mean.pages').factory('iocIcon', [
	function() {
		var iocIcon = function(severity) {
			switch(severity){
				case 1:
					return 'fa-flag';
				case 2:
					return 'fa-bullhorn';
				case 3:
					return 'fa-bell';
				case 4:
					return 'fa-exclamation-circle';
				default:
					return 'fa-question';
			}
		};
		return iocIcon;
	}
]);
