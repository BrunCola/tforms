'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$location', function ($scope, Global, $location) {
	$scope.global = Global;

	$scope.select = function(url){
		if (url !== '') {
			if ($location.$$search.start && $location.$$search.end) {
				$location.path(url).search({'start':$location.$$search.start, 'end':$location.$$search.end});
			} else {
				$location.path(url);
			}
			$.noty.closeAll();
		}
	};
	$scope.parentClass = function (link) {
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
					});
				}
			});
		}
		return linkClass;
	};
	$scope.parentClassSelected = function (page) {
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
			});
		}
		return linkClass;
	};

	$scope.sidebaritems = [
	{
		'title': 'Live Connections',
		'url': 'live_connections',
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
			'url': 'ioc_events',
			'icon': 'fa-warning',
			'orphans': ['ioc_drill', 'ioc_events_drilldown']
		},
		{
			'title': 'IOC Top Local IPs',
			'url': 'ioc_top_local_ips',
			'icon': 'fa-warning',
			'orphans': ['ioc_top_local_ips_drill']
		},
		{
			'title': 'IOC Top Remote IPs',
			'url': 'ioc_top_remote_ips',
			'icon': 'fa-warning',
			'orphans': ['ioc_top_remote2local']
		}]
	},
	{
		'title': 'Extracted Files',
		'url': '',
		'icon': 'fa-folder',
		'children':
		[{
			'title': 'By MIME Type',
			'url': 'by_mime_type',
			'icon': 'fa-folder-open',
			'orphans': ['file_mime_local', 'file_local']
		},
		{
			'title': 'By Local IP',
			'url': 'by_local_ip',
			'icon': 'fa-folder-open',
			'orphans': ['by_file_name','file_local']
		},
		{
			'title': 'By Remote IP',
			'url': 'by_remote_ip',
			'icon': 'fa-folder-open',
			'orphans': ['by_file_name_remote','file_remote']
		}]
	},
	{
		'title': 'First Seen',
		'url': '',
		'icon': 'fa-asterisk',
		'children':
		[{
			'title': 'New Remote IPs',
			'url': 'new_remote_ips',
			'icon': 'fa-exchange',
			'orphans': []
		},
		{
			'title': 'New DNS Queries',
			'url': 'new_dns_queries',
			'icon': 'fa-info-circle',
			'orphans': []
		},
		{
			'title': 'New HTTP Domains',
			'url': 'new_http_domains',
			'icon': 'fa-globe',
			'orphans': []
		},
		{
			'title': 'New SSL Hosts',
			'url': 'new_ssl_hosts',
			'icon': 'fa-lock',
			'orphans': []
		},
		{
			'title': 'New SSH Remote IPs',
			'url': 'new_ssh_remote_ips',
			'icon': 'fa-lock',
			'orphans': []
		},
		{
			'title': 'New FTP Remote IPs',
			'url': 'new_ftp_remote_ips',
			'icon': 'fa-lock',
			'orphans': []
		}]
	},
	{
		'title': 'Applications',
		'url': '',
		'icon': 'fa-bars',
		'children':
		[{
			'title': 'By Application',
			'url': 'app_by_application',
			'icon': 'fa-bars',
			'orphans': ['application_drill', 'application_local', 'l7_top_shared']
		},
		{
			'title': 'By Local IP',
			'url': 'app_by_local_ip',
			'icon': 'fa-bars',
			'orphans': ['l7_toplocal_app', 'l7_toplocal_drill', 'l7_top_shared']
		},
		{
			'title': 'By Remote IP',
			'url': 'app_by_remote_ip',
			'icon': 'fa-bars',
			'orphans': ['l7_topremote_app', 'l7_topremote_drill', 'l7_top_shared']
		}]
	},
	{
		'title': 'General Network',
		'url': '',
		'icon': 'fa-sitemap',
		'children':
		[{
			'title': 'Endpoint Events',
			'url': 'top_endpoint_events',
			'icon': 'fa-desktop',
			'orphans': ['top_endpoint_events_user','top_endpoint_events_user_drill']
		},
		{
			'title': 'Local Connections',
			'url': 'top_local_ips',
			'icon': 'fa-cloud-download',
			'orphans': ['top_local2remote', 'top_ips_shared']
		},
		{
			'title': 'Remote Connections',
			'url': 'top_remote_ips',
			'icon': 'fa-cloud-upload',
			'orphans': ['top_remote2local', 'top_ips_shared']
		},
		{
			'title': 'Local SSH',
			'url': 'top_ssh',
			'icon': 'fa-chevron-right',
			'orphans': ['top_ssh_remote', 'top_ssh_remote_shared']
		},
		{
			'title': 'Remote SSH',
			'url': 'top_remote2local_ssh',
			'icon': 'fa-chevron-right',
			'orphans': ['top_remote2local_ssh_local', 'top_ssh_remote_shared']
		},
		{
			'title': 'Local IRC',
			'url': 'top_local_irc',
			'icon': 'fa-comment',
			'orphans': ['top_local2remote_irc', 'top_irc_shared']
		},
		{
			'title': 'Remote IRC',
			'url': 'top_remote_irc',
			'icon': 'fa-comment',
			'orphans': ['top_remote2local_irc', 'top_irc_shared']
		},
		{
			'title': 'SMTP Senders',
			'url': 'top_local_smtp',
			'icon': 'fa-envelope',
			'orphans': ['top_smtp_sender2receiver','top_smtp_from_sender']
		},
		{
			'title': 'SMTP Receivers',
			'url': 'top_smtp_receivers',
			'icon': 'fa-envelope',
			'orphans': ['top_smtp_receiver2sender','top_smtp_from_sender']
		},
		{
			'title': 'Local FTP',
			'url': 'top_local_ftp',
			'icon': 'fa-file',
			'orphans': ['top_local2remote_ftp', 'top_ftp_shared']
		},
		{
			'title': 'Remote FTP',
			'url': 'top_remote_ftp',
			'icon': 'fa-file',
			'orphans': ['top_remote2local_ftp', 'top_ftp_shared']
		}]
	}];
}]);