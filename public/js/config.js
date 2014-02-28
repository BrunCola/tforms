'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        // IOC Hits Page
        when('/iochits', {
            templateUrl: 'views/pages/iochits.html'
        }).
        when('/iochits?:start&:end', {
            templateUrl: 'views/pages/iochits.html'
        }).
        //IOC Drill Page
        when('/ioc_drill', {
            templateUrl: 'views/pages/ioc_drill.html'
        }).
        when('/ioc_drill?:lan_ip&:remote_ip&:ioc', {
            templateUrl: 'views/pages/ioc_drill.html'
        }).
        when('/ioc_drill?:start&:end&:lan_ip&:remote_ip&:ioc', {
            templateUrl: 'views/pages/ioc_drill.html'
        }).

        // Other Pages
        // when('/articles', {
        //     templateUrl: 'views/articles/list.html'
        // }).
        // when('/articles/create', {
        //     templateUrl: 'views/articles/create.html'
        // }).
        // when('/articles/:articleId/edit', {
        //     templateUrl: 'views/articles/edit.html'
        // }).
        // when('/articles/:articleId', {
        //     templateUrl: 'views/articles/view.html'
        // }).

        // when('/', {
        //     templateUrl: 'views/pages/index.html'
        // }).
        otherwise({
            redirectTo: '/iochits'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);