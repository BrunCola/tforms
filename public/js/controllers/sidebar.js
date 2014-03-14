'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$routeParams', '$location', function ($scope, Global, $routeParams, $location) {
	$scope.global = Global;

	$scope.select = function(url){
		if ($routeParams.start && $routeParams.end) {
			$location.path(url).search({'start':$routeParams.start, 'end':$routeParams.end});
		} else {
			$location.path(url);
		}
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
	// {
	// 	'title': 'Test',
	// 	'url': 'local_drill',
	// 	'icon': 'fa-warning',
	// },
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
		'title': 'Top Local IP',
		'url': 'top_local',
		'icon': 'fa-cloud-download',
	},{
		'title': 'Top Remote IP',
		'url': 'top_remote',
		'icon': 'fa-cloud-upload',
	}];
}]);