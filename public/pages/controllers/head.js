'use strict';

angular.module('mean.pages').controller('headController', ['$scope', 'Global', '$rootScope', '$location', '$state', function ($scope, Global, $rootScope, $location, $state) {
	$scope.global = Global;

	$scope.title = $state.current.data.title;
}]);

