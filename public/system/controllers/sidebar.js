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
	$scope.display = function (accessLevel) {
		if ((accessLevel === undefined) || (accessLevel.length === 0)) {
			return true;
		} else if (accessLevel.length > 0) {
			if (accessLevel.indexOf($scope.global.user.level) !== -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
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

	// $scope.adminItems = [];

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
			[
				{
					'title': 'By Event',
					'url': 'ioc_events',
					'icon': 'fa-warning',
					// 'accessLevel': [1], // if you'd like to limit access to a specific child instead
					'orphans': ['ioc_drill', 'ioc_events_drilldown']
				},
				{
					'title': 'By Local IP',
					'url': 'ioc_local',
					'icon': 'fa-warning',
					'orphans': ['ioc_local_drill']
				},
				{
					'title': 'By Remote IP',
					'url': 'ioc_remote',
					'icon': 'fa-warning',
					'orphans': ['ioc_remote2local']
				}
			]
		},
		{
			'title': 'Extracted Files',
			'url': '',
			'icon': 'fa-folder',
			'children':
			[
				{
					'title': 'By File Type',
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
				},
				{
					'title': 'By Domain',
					'url': 'by_domain',
					'icon': 'fa-folder-open',
					'orphans': ['by_domain_local', 'by_domain_local_mime', 'by_domain_local_mime_drill']
				}
			]
		},
		{
			'title': 'Applications',
			'url': '',
			'icon': 'fa-bars',
			'children':
			[
				{
					'title': 'By Application',
					'url': 'app_by_application',
					'icon': 'fa-bars',
					'orphans': ['application_drill', 'application_local', 'l7_shared']
				},
				{
					'title': 'By Local IP',
					'url': 'app_by_local_ip',
					'icon': 'fa-bars',
					'orphans': ['l7_local_app', 'l7_local_drill', 'l7_shared']
				},
				{
					'title': 'By Remote IP',
					'url': 'app_by_remote_ip',
					'icon': 'fa-bars',
					'orphans': ['l7_remote_app', 'l7_remote_drill', 'l7_shared']
				}
			]
		},
		{
			'title': 'Email',
			'url': '',
			'icon': 'fa-envelope',
			'children':
			[
				{
					'title': 'By Sender',
					'url': 'smtp_senders',
					'icon': 'fa-mail-forward',
					'orphans': ['smtp_sender2receiver','smtp_from_sender']
				},
				{
					'title': 'By Receiver',
					'url': 'smtp_receivers',
					'icon': 'fa-mail-reply',
					'orphans': ['smtp_receiver2sender','smtp_from_sender']
				},
				{
					'title': 'By Subject',
					'url': 'smtp_subjects',
					'icon': 'fa-envelope',
					'orphans': ['smtp_subject_sender_receiver_pairs', 'smtp_from_sender_by_subject']
				}
			]
		},
		{
			'title': 'HTTP',
			'url': '',
			'icon': 'fa-globe',
			'children':
			[
				{
					'title': 'HTTP by Domain',
					'url': 'http_by_domain',
					'icon': 'fa-arrows-h',
					'orphans': ['http_by_domain_local', 'http_by_domain_local_drill']
				},
				{
					'title': 'Local HTTP',
					'url': 'http_local',
					'icon': 'fa-long-arrow-left',
					'orphans': ['http_local_by_domain', 'http_by_domain_local_drill']
				},
				{
					'title': 'Remote HTTP',
					'url': 'http_remote',
					'icon': 'fa-long-arrow-right',
					'orphans': ['http_remote2local', 'http_remote2local_drill']
				}
			]
		},
		{
			'title': 'General Network',
			'url': '',
			'icon': 'fa-sitemap',
			'children':
			[
				{
					'title': 'Local Connections',
					'url': 'local',
					'icon': 'fa-cloud-download',
					'orphans': ['local2remote', 'shared']
				},
				{
					'title': 'Remote Connections',
					'url': 'remote',
					'icon': 'fa-cloud-upload',
					'orphans': ['remote2local', 'shared']
				},
				{
					'title': 'Local FTP',
					'url': 'ftp_local',
					'icon': 'fa-file',
					'orphans': ['ftp_local2remote', 'ftp_shared']
				},
				{
					'title': 'Remote FTP',
					'url': 'ftp_remote',
					'icon': 'fa-file',
					'orphans': ['ftp_remote2local', 'ftp_shared']
				},
				{
					'title': 'SSH Status',
					'url': 'ssh_status',
					'icon': 'fa-chevron-right',
					'orphans': ['ssh_status_local', 'ssh_status_local_drill']
				},
				{
					'title': 'Local SSH',
					'url': 'ssh_local',
					'icon': 'fa-chevron-right',
					'orphans': ['ssh_local2remote', 'ssh_shared']
				},
				{
					'title': 'Remote SSH',
					'url': 'ssh_remote',
					'icon': 'fa-chevron-right',
					'orphans': ['ssh_remote2local', 'ssh_shared']
				},
				{
					'title': 'Local IRC',
					'url': 'irc_local',
					'icon': 'fa-comment',
					'orphans': ['irclocal2remote', 'irc_shared']
				},
				{
					'title': 'Remote IRC',
					'url': 'irc_remote',
					'icon': 'fa-comment',
					'orphans': ['irc_remote2local', 'irc_shared']
				}
			]
		},
		{
			'title': 'Endpoint Events',
			'url': '',
			'icon': 'fa-desktop',
			'children':
			[
				{
					'title': 'By Type',
					'url': 'endpoint_events',
					'icon': 'fa-desktop',
					'orphans': ['endpoint_events_user','endpoint_events_user_drill']
				},
				{
					'title': 'By Local IP',
					'url': 'endpoint_events_local',
					'icon': 'fa-desktop',
					'orphans': ['endpoint_events_local_by_alert_info', 'endpoint_events_local_alert_info_drill']
				}
			]
		},
		{
			'title': 'First Seen',
			'url': '',
			'icon': 'fa-asterisk',
			'children':
			[
				{
					'title': 'New Remote IPs',
					'url': 'new_remote',
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
					'url': 'new_ssh_remote',
					'icon': 'fa-lock',
					'orphans': []
				},
				{
					'title': 'New FTP Remote IPs',
					'url': 'new_ftp_remote',
					'icon': 'fa-lock',
					'orphans': []
				}
			]
		},
		{
			'title': 'Stealth',
			'url': '',
			'icon': 'fa-shield',	
			'accessLevel': [3],		
			'children': [
			{
				'title': 'Stealth',
				'url': 'local_COI_remote',
				'icon': 'shield',
				'orphans': ['local_COI_remote_drill']
			},
			{
				'title': 'COI Map',
				'url': 'users_COI_groups',
				'icon': 'shield',
				'orphans': ['user_local']
			}]
		},
		{
			'title': 'Health',
			'url': '',
			'icon': 'fa-plus-square',		
			'accessLevel': [3],	
			'children':
			[
				{
					'title': 'RapidPHIRE Health',
					'url': 'overview',
					'icon': 'fa-plus-square',
					'orphans': ['health_drill']
				}
			]
		}
	];
}]);