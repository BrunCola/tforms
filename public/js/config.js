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
		when('/iochits_report', {
			templateUrl: 'views/pages/iochits_report.html'
		}).
		when('/iochits_report?:start&:end', {
			templateUrl: 'views/pages/iochits_report.html'
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
		//l7 drill Page
		when('/l7_drill', {
			templateUrl: 'views/pages/l7_drill.html'
		}).
		when('/l7_drill?:l7_proto', {
			templateUrl: 'views/pages/l7_drill.html'
		}).
		when('/l7_drill?:start&:end&:l7_proto', {
			templateUrl: 'views/pages/l7_drill.html'
		}).
		//l7 local Page
		when('/l7_local', {
			templateUrl: 'views/pages/l7_local.html'
		}).
		when('/l7_local?:lan_ip&:l7_proto', {
			templateUrl: 'views/pages/l7_local.html'
		}).
		when('/l7_local?:start&:end&:lan_ip&:l7_proto', {
			templateUrl: 'views/pages/l7_local.html'
		}).
		//top local
		when('/top_local', {
			templateUrl: 'views/pages/top_local.html'
		}).
		when('/top_local?:start&:end', {
			templateUrl: 'views/pages/top_local.html'
		}).
		//top local2remote
		when('/top_local2remote', {
			templateUrl: 'views/pages/top_local2remote.html'
		}).
		when('/top_local2remote?:lan_zone&:lan_ip', {
			templateUrl: 'views/pages/top_local2remote.html'
		}).
		when('/top_local2remote?:start&:end&:lan_zone&:lan_ip', {
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
		when('/top_remote2local?:remote_ip', {
			templateUrl: 'views/pages/top_remote2local.html'
		}).
		when('/top_remote2local?:start&:end&:remote_ip', {
			templateUrl: 'views/pages/top_remote2local.html'
		}).
		//ioc top remote2local
		when('/ioc_top_remote2local', {
			templateUrl: 'views/pages/ioc_top_remote2local.html'
		}).
		when('/ioc_top_remote2local?:remote_ip&:ioc', {
			templateUrl: 'views/pages/ioc_top_remote2local.html'
		}).
		when('/ioc_top_remote2local?:start&:end&:remote_ip&:ioc', {
			templateUrl: 'views/pages/ioc_top_remote2local.html'
		}).
		//archive
		when('/archive', {
			templateUrl: 'views/pages/archive.html'
		}).
		when('/archive?:start&:end', {
			templateUrl: 'views/pages/archive.html'
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