'use strict';

angular.module('mean.pages').controller('stealthConnByUserAndRemoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, runPage) {
    $scope.global = Global;
    var query;

    var page = [
        /////////////////
        ///// TABLE /////
        /////////////////
        {
            type: 'table', // required either array or single object
            key: 'table', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            get: '/api/stealth/stealth_conn_by_userANDremote/table',
            run: function(data) {
                // TODO - check if this is needed for all tables, if so - place this in the service
                var id = 0;
                data.aaData.forEach(function(d){
                    if (!d.id) {
                        d.id = id++;
                    }
                })
            }
        }
    ];
    $rootScope.search = $scope.search;
    runPage($scope, page);
}]);