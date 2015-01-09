'use strict';

angular.module('mean.pages').controller('endpointEventsSharepointDrillController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'runPage', 'Crossfilter', function ($scope, $stateParams, $location, Global, $rootScope, $http, runPage, Crossfilter) {
    $scope.global = Global;
    var query;

    $scope.tableCrossfitler = new Crossfilter([], '$id', 'persistent');

    var page = [
        /////////////////
        ///// TABLE /////
        /////////////////
        {
            type: 'table', // required either array or single object
            crossfilterObj: $scope.tableCrossfitler, // required (if crossfilter)
            key: 'table', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            get: '/api/local_events/endpoint_events_sharepoint_drill/table',
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