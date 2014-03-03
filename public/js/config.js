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
		//IOC Event Page
		when('/ioc_event', {
			templateUrl: 'views/pages/ioc_event.html'
		}).
		when('/ioc_event?:conn_uids', {
			templateUrl: 'views/pages/ioc_event.html'
		}).
		when('/ioc_event?:start&:end&:conn_uids', {
			templateUrl: 'views/pages/ioc_event.html'
		}).
		//IOC Top Remote
		when('/ioc_top_remote', {
			templateUrl: 'views/pages/ioc_top_remote.html'
		}).
		when('/ioc_top_remote?:start&:end', {
			templateUrl: 'views/pages/ioc_top_remote.html'
		}).
		//New Remote IPs
		when('/new_remote_ip', {
			templateUrl: 'views/pages/new_remote_ip.html'
		}).
		when('/new_remote_ip?:start&:end', {
			templateUrl: 'views/pages/new_remote_ip.html'
		}).
		//New DNS Queries
		when('/new_dns_query', {
			templateUrl: 'views/pages/new_dns_query.html'
		}).
		when('/new_dns_query?:start&:end', {
			templateUrl: 'views/pages/new_dns_query.html'
		}).
		//New Http Host
		when('/new_http_hosts', {
			templateUrl: 'views/pages/new_http_hosts.html'
		}).
		when('/new_http_hosts?:start&:end', {
			templateUrl: 'views/pages/new_http_hosts.html'
		}).
		//New SSL Hosts
		when('/new_ssl_hosts', {
			templateUrl: 'views/pages/new_ssl_hosts.html'
		}).
		when('/new_ssl_hosts?:start&:end', {
			templateUrl: 'views/pages/new_ssl_hosts.html'
		}).
		//L7
		when('/l7', {
			templateUrl: 'views/pages/l7.html'
		}).
		when('/l7?:start&:end', {
			templateUrl: 'views/pages/l7.html'
		}).
		//L7
		when('/top_local', {
			templateUrl: 'views/pages/top_local.html'
		}).
		when('/top_local?:start&:end', {
			templateUrl: 'views/pages/top_local.html'
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