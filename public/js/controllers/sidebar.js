'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$routeParams', '$location', '$rootScope', function ($scope, Global, $routeParams, $location, $rootScope) {
	$scope.global = Global;

	$scope.select = function(url){
		if ($routeParams.start && $routeParams.end) {
			$location.path(url).search({'start':$routeParams.start, 'end':$routeParams.end});
		} else {
			$location.path(url);
		}
		$.noty.closeAll();
	};

	$scope.navClass = function (page) {
		var currentRoute = $location.path().substring(1) || 'home';
		return page === currentRoute ? 'start active' : '';
	};

	$scope.navClassSelected = function (page) {
		var currentRoute = $location.path().substring(1) || 'home';
		return page === currentRoute ? 'selected' : '';
		// if (page === currentRoute) {
		// 	return 'selected'
		// } else if ($rootscope.activeLink[0] === page) {
		// }
	};

	$scope.navClass = function (page) {
		var currentRoute = $location.path().substring(1) || 'home';
		return page === currentRoute ? 'start active' : '';
	};

	$scope.navClassSelected = function (page) {
		var currentRoute = $location.path().substring(1) || 'home';
		return page === currentRoute ? 'selected' : '';
		// if (page === currentRoute) {
		// 	return 'selected'
		// } else if ($rootscope.activeLink[0] === page) {
		// }
	};

	$scope.sidebaritems = [{
		'title': 'IOC Notifications',
		'url': 'iochits',
		'icon': 'fa-warning',
	},{
		'title': 'IOC Top Remote IP',
		'url': 'ioc_top_remote',
		'icon': 'fa-warning',
	},
	{
		'title': 'Extracted Files',
		'url': 'file_mime',
		'icon': 'fa-folder-open',
	},
	{
		'title': 'New Remote IPs',
		'url': 'new_remote_ip',
		'icon': 'fa-exchange',
	},{
		'title': 'New DNS Queries',
		'url': 'new_dns_query',
		'icon': 'fa-info-circle',
	},{
		'title': 'New HTTP Domains',
		'url': 'new_http_hosts',
		'icon': 'fa-globe',
	},{
		'title': 'New SSL Hosts',
		'url': 'new_ssl_hosts',
		'icon': 'fa-lock',
	},{
		'title': 'Layer 7',
		'url': 'l7',
		'icon': 'fa-bars',
	},{
		'title': 'Layer 7',
		'url': 'l7_toplocal',
		'icon': 'fa-bars',
	},{
		'title': 'Top Local IP',
		'url': 'top_local',
		'icon': 'fa-cloud-download',
	},{
		'title': 'Top Remote IP',
		'url': 'top_remote',
		'icon': 'fa-cloud-upload',
	}];
}]);