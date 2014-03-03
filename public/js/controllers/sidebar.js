'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.sidebaritems = [{
		'title': 'IOC Notifications',
		'url': '/#!/iochits',
		'icon': 'fa-warning',
	},{
		'title': 'IOC Top Remote IP',
		'url': '/#!/ioc_top_remote',
		'icon': 'fa-warning',
	},{
		'title': 'New Remote IPs',
		'url': '/#!/new_remote_ip',
		'icon': 'fa-exchange',
	},{
		'title': 'New DNS Queries',
		'url': '/#!/new_dns_query',
		'icon': 'fa-info-circle',
	},{
		'title': 'New HTTP Domains',
		'url': '/#!/new_http_hosts',
		'icon': 'fa-globe',
	},{
		'title': 'New SSL Hosts',
		'url': '/#!/new_ssl_hosts',
		'icon': 'fa-lock',
	},{
		'title': 'Layer 7',
		'url': '/#!/l7',
		'icon': 'fa-bars',
	},{
		'title': 'Top Local IP',
		'url': '/#!/top_local',
		'icon': 'fa-cloud-download',
	},{
		'title': 'Top Remote IP',
		'url': '/',
		'icon': 'fa-cloud-upload',
	},{
		'title': 'IOC Archive',
		'url': '/',
		'icon': 'fa-trash',
	}];
}]);