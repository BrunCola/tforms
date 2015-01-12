'use strict';

angular.module('mean.pages').controller('httpByDomainLocalDrillControllerBlocked', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, runPage, Crossfilter) {
    $scope.global = Global;
    var query;

    
    // var query = '/ioc_notifications/ioc_events'; // string with no '?' at end - function should have a check for url construction
    var page = [
        /////////////////
        ///// TABLE /////
        /////////////////
        {
            type: 'table', // required either array or single object
            key: 'table', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            get: '/api/http/http_by_domain_local_drill_blocked/table',
            run: function(data) {
                // TODO - check if this is needed for all tables, if so - place this in the service
                var id = 0;
                data.aaData.forEach(function(d){
                    if (!d.id) {
                        d.id = id++;
                    }
                })
            }
        },
    ];
    $rootScope.search = $scope.search;
    runPage($scope, page);
}]);