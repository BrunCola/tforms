'use strict';

angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';
	//Then init the app
	angular.bootstrap(document, ['mean']);
});

// Default modules
var modules = ['ngCookies', 'ngResource', 'ui.bootstrap', 'ui.router', 'mean.system', 'mean.pages', 'mean.auth'];

// Combined modules
angular.module('mean', modules);
