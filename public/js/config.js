'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		// IOC Hits Page
		when('/iochits', {
			templateUrl: 'views/pages/iochits.html'
		}).
		when('/ioc_drill', {
			templateUrl: 'views/pages/ioc_drill.html'
		}).
		//IOC Event Page
		when('/ioc_event', {
			templateUrl: 'views/pages/ioc_event.html'
		}).

		//IOC Top Remote
		when('/ioc_top_remote', {
			templateUrl: 'views/pages/ioc_top_remote.html'
		}).

		//Local Drill
		// when('/local_drill', {
		// 	templateUrl: 'views/pages/local_drill.html'
		// }).

		//New Remote IPs
		when('/new_remote_ip', {
			templateUrl: 'views/pages/new_remote_ip.html'
		}).
		//New DNS Queries
		when('/new_dns_query', {
			templateUrl: 'views/pages/new_dns_query.html'
		}).
		//New Http Host
		when('/new_http_hosts', {
			templateUrl: 'views/pages/new_http_hosts.html'
		}).

		//New SSL Hosts
		when('/new_ssl_hosts', {
			templateUrl: 'views/pages/new_ssl_hosts.html'
		}).
		// File Mime
		when('/file_mime', {
			templateUrl: 'views/pages/file_mime.html'
		}).
		// File Name
		when('/file_name', {
			templateUrl: 'views/pages/file_name.html'
		}).
		// File Local
		when('/file_local', {
			templateUrl: 'views/pages/file_local.html'
		}).
		//L7
		when('/l7', {
			templateUrl: 'views/pages/l7.html'
		}).
		//l7 drill Page
		when('/l7_drill', {
			templateUrl: 'views/pages/l7_drill.html'
		}).
		//l7 local Page
		when('/l7_local', {
			templateUrl: 'views/pages/l7_local.html'
		}).
		//top local
		when('/top_local', {
			templateUrl: 'views/pages/top_local.html'
		}).
		//top local2remote
		when('/top_local2remote', {
			templateUrl: 'views/pages/top_local2remote.html'
		}).
		//top remote
		when('/top_remote', {
			templateUrl: 'views/pages/top_remote.html'
		}).
		when('/top_remote?:start&:end', {
			templateUrl: 'views/pages/top_remote.html'
		}).

		//top remote2local
		when('/top_remote2local', {
			templateUrl: 'views/pages/top_remote2local.html'
		}).
		//ioc top remote2local
		when('/ioc_top_remote2local', {
			templateUrl: 'views/pages/ioc_top_remote2local.html'
		}).

		//archive
		when('/archive', {
			templateUrl: 'views/pages/archive.html'
		}).

		//map
		when('/map', {
			templateUrl: 'views/pages/map.html'
		}).

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