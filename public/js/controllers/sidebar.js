'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$routeParams', '$location', '$rootScope', function ($scope, Global, $routeParams, $location, $rootScope) {
	$scope.global = Global;

	$scope.select = function(url){
		if (url !== '') {
			if ($routeParams.start && $routeParams.end) {
				$location.path(url).search({'start':$routeParams.start, 'end':$routeParams.end});
			} else {
				$location.path(url);
			}
			$.noty.closeAll();
		}
	};

	// $scope.navClass = function (page) {
	// 	var currentRoute = $location.path().substring(1) || 'home';
	// 	return page === currentRoute ? 'start active' : '';
	// };
	$scope.navClass = function (link) {
		var currentRoute = $location.path().substring(1) || 'home';
		// return page === currentRoute ? 'start active' : '';
		var linkClass = '';
		if (link.url === currentRoute) {
			linkClass = 'start active';
		}
		if (link.children.length >0) {
			link.children.forEach(function(d){
				if (d.url === currentRoute) {
					linkClass = 'start active open';
				}
				if (d.orphans.length > 0) {
					d.orphans.forEach(function(e){
						if (e === currentRoute) {
							linkClass = 'start active open';
						}
					})
				}
			})
		}
		return linkClass;
	};
	$scope.navClassSelected = function (page) {
		var currentRoute = $location.path().substring(1) || 'home';
		return page === currentRoute ? 'selected' : '';
	};

	$scope.childClass = function (link) {
		var currentRoute = $location.path().substring(1) || 'home';
		var linkClass = '';
		if (link.url === currentRoute){
			linkClass = 'active';
		}
		if (link.orphans.length >0) {
			link.orphans.forEach(function(d){
				if (d === currentRoute) {
					linkClass = 'active';
				}
			})
		}
		return linkClass;
	};

	// $scope.sidebaritems = [
	// {
	// 	'title': 'Live Connections',
	// 	'url': 'map',
	// 	'icon': 'fa-map-marker',
	// },{
	// 	'title': 'IOC Notifications',
	// 	'url': 'iochits',
	// 	'icon': 'fa-warning',
	// },{
	// 	'title': 'IOC Top Remote IP',
	// 	'url': 'ioc_top_remote',
	// 	'icon': 'fa-warning',
	// },
	// {
	// 	'title': 'Extracted Files',
	// 	'url': 'file_mime',
	// 	'icon': 'fa-folder-open',
	// },
	// {
	// 	'title': 'New Remote IPs',
	// 	'url': 'new_remote_ip',
	// 	'icon': 'fa-exchange',
	// },{
	// 	'title': 'New DNS Queries',
	// 	'url': 'new_dns_query',
	// 	'icon': 'fa-info-circle',
	// },{
	// 	'title': 'New HTTP Domains',
	// 	'url': 'new_http_hosts',
	// 	'icon': 'fa-globe',
	// },{
	// 	'title': 'New SSL Hosts',
	// 	'url': 'new_ssl_hosts',
	// 	'icon': 'fa-lock',
	// },{
	// 	'title': 'Applications',
	// 	'url': 'l7',
	// 	'icon': 'fa-bars',
	// },{
	// 	'title': 'Applications Top Local',
	// 	'url': 'l7_toplocal',
	// 	'icon': 'fa-bars',
	// },{
	// 	'title': 'Top Local IP',
	// 	'url': 'top_local',
	// 	'icon': 'fa-cloud-download',
	// },{
	// 	'title': 'Top Remote IP',
	// 	'url': 'top_remote',
	// 	'icon': 'fa-cloud-upload',
	// }];
// -Live Connections
// -IOC Notifications
// ----By Local IP ?
// ----By Remote IP
// -Extracted Files
// ----By Mime Type
// ----By Local IP ?
// -First Seen
// ----Remote IPs
// ----DNS Queries
// ----HTTP Domains
// ----SSL Remote IPs
// -Applications
// ----By Application
// ----By Local IP
// -General Network
// ----Top Local IP
// ----Top Remote IP

	$scope.sidebaritems = [
	{
		'title': 'Live Connections',
		'url': 'map',
		'icon': 'fa-map-marker',
		'children': []
	},
	{
		'title': 'IOC Notifications',
		'url': '',
		'icon': 'fa-warning',
		'children':
		[{
			'title': 'IOC Events',
			'url': 'iochits',
			'icon': 'fa-warning',
			'orphans': ['ioc_drill']
		},
		{
			'title': 'IOC Top Remote IP',
			'url': 'ioc_top_remote',
			'icon': 'fa-warning',
			'orphans': ['ioc_top_remote2local']
		}]
	},
	{
		'title': 'Extracted Files',
		'url': '',
		'icon': 'fa-folder-open',
		'children':
		[{
			'title': 'Extracted Files',
			'url': 'file_mime',
			'icon': 'fa-folder-open',
			'orphans': ['file_name','file_local']
		}]
	},
	{
		'title': 'First Seen',
		'url': '',
		'icon': 'fa-folder-open',
		'children':
		[{
			'title': 'New Remote IPs',
			'url': 'new_remote_ip',
			'icon': 'fa-exchange',
			'orphans': ['top_remote2local']
		},
		{
			'title': 'New DNS Queries',
			'url': 'new_dns_query',
			'icon': 'fa-info-circle',
			'orphans': []
		},
		{
			'title': 'New HTTP Domains',
			'url': 'new_http_hosts',
			'icon': 'fa-globe',
			'orphans': []
		},
		{
			'title': 'New SSL Hosts',
			'url': 'new_ssl_hosts',
			'icon': 'fa-lock',
			'orphans': []
		}]
	},
	{
		'title': 'Applications',
		'url': '',
		'icon': 'fa-folder-open',
		'children':
		[{
			'title': 'Applications',
			'url': 'l7',
			'icon': 'fa-bars',
			'orphans': ['l7_drill', 'l7_local']
		},
		{
			'title': 'Applications Top Local',
			'url': 'l7_toplocal',
			'icon': 'fa-bars',
			'orphans': ['l7_toplocal_app', 'l7_toplocal_drill']
		}]
	},
	{
		'title': 'General Network',
		'url': '',
		'icon': 'fa-folder-open',
		'children':
		[{
			'title': 'Top Local IP',
			'url': 'top_local',
			'icon': 'fa-cloud-download',
			'orphans': ['top_local2remote']
		},
		{
			'title': 'Top Remote IP',
			'url': 'top_remote',
			'icon': 'fa-cloud-upload',
			'orphans': ['top_remote2local']
		}]
	}];
}]);