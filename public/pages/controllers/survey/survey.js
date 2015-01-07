'use strict';

angular.module('mean.pages').controller('surveyController', ['$scope', 'Global', '$rootScope', '$window', function ($scope, Global, $rootScope, $window) {
    $scope.global = Global;

    $scope.iFrameWidth = $window.innerWidth-40;
    $scope.iFrameHeight = $window.innerHeight-30;
}]);