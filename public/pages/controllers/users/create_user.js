'use strict';

angular.module('mean.pages').controller('createUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
    $scope.global = Global;
    var timer;
    var query = '/api/users/create_user';
    function getMap() {
        $http({method: 'GET', url: query}).
        success(function(data) {
            if (data === 0) { // change

            } else {
                //do something
            }
        });
    }
}]);