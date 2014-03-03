'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$routeParams', function ($scope, Global, $routeParams) {
	$scope.global = Global;

	var urlTime = '';
	if ($routeParams.start && $routeParams.end) {
		var urlTime = '?start='+$routeParams.start+'&end='+$routeParams.end
	};
	$scope.sidebaritems = [{
		'title': 'IOC Notifications',
		'url': '/#!/iochits'+urlTime,
		'icon': 'fa-warning',
	},{
		'title': 'IOC Top Remote IP',
		'url': '/#!/ioc_top_remote'+urlTime,
		'icon': 'fa-warning',
	},{
		'title': 'New Remote IPs',
		'url': '/#!/new_remote_ip'+urlTime,
		'icon': 'fa-exchange',
	},{
		'title': 'New DNS Queries',
		'url': '/#!/new_dns_query'+urlTime,
		'icon': 'fa-info-circle',
	},{
		'title': 'New HTTP Domains',
		'url': '/#!/new_http_hosts'+urlTime,
		'icon': 'fa-globe',
	},{
		'title': 'New SSL Hosts',
		'url': '/#!/new_ssl_hosts'+urlTime,
		'icon': 'fa-lock',
	},{
		'title': 'Layer 7',
		'url': '/#!/l7'+urlTime,
		'icon': 'fa-bars',
	},{
		'title': 'Top Local IP',
		'url': '/#!/top_local'+urlTime,
		'icon': 'fa-cloud-download',
	},{
		'title': 'Top Remote IP',
		'url': '/#!/top_remote'+urlTime,
		'icon': 'fa-cloud-upload',
	}];
}]);