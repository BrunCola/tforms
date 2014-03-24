'use strict';

angular.module('mean', ['ngCookies', 'ngResource', 'ngRoute', 'ui.bootstrap', 'ui.route', 'mean.system', 'mean.articles', 'mean.iochits', 'ui.bootstrap']);

angular.module('mean.system', ['ui.bootstrap']);
angular.module('mean.articles', []);
angular.module('mean.iochits', ['ui.bootstrap']);