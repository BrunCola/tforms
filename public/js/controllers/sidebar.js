'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.sidebaritems = [{
		'title': 'IOC Notifications',
		'url': '/#!/iochits',
		'icon': 'fa-warning',
	},{
		'title': 'IOC Top Remote IP',
		'url': '/',
		'icon': 'fa-warning',
	},{
		'title': 'New Remote IPs',
		'url': '/',
		'icon': 'fa-exchange',
	},{
		'title': 'New DNS Queries',
		'url': '/',
		'icon': 'fa-info-circle',
	},{
		'title': 'New HTTP Domains',
		'url': '/',
		'icon': 'fa-globe',
	},{
		'title': 'New SSL Hosts',
		'url': '/',
		'icon': 'fa-lock',
	},{
		'title': 'Layer 7',
		'url': '/',
		'icon': 'fa-bars',
	},{
		'title': 'Top Local IP',
		'url': '/',
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