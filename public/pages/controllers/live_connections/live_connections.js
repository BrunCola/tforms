'use strict';

angular.module('mean.pages').controller('liveConnectionsController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'socket', function ($scope, $stateParams, $location, Global, $rootScope, $http, socket) {
	$scope.global = Global;
	$scope.socket = socket;
	socket.on('test',function(){
		console.log('boom')
	})
	var query = '/live_connections/live_connections';
	function getMap() {
		$http({method: 'GET', url: query}).
		success(function(data) {
			if (data.map.features.length === 0) {
				console.log('No data to display, waiting a minute.');
				setTimeout(function(){
					getMap();
				}, 60000)
			} else {
				$scope.$broadcast('map', data.map, data.start, data.end);
			}
		});
	}
	getMap();

	$scope.$on('canIhazMoreMap', function() {
		getMap();
	});

}]);