'use strict';

angular.module('mean.pages').controller('ftpLocal2remoteController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'runPage', function ($scope, $stateParams, $location, Global, $rootScope, $http, runPage, Crossfilter) {
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
            get: '/api/general_network/ftp_local2remote/table',
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

    // if ($location.$$search.start && $location.$$search.end) {
    //     query = '/api/general_network/ftp_local2remote?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip;
    // } else {
    //     query = '/api/general_network/ftp_local2remote?lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip;
    // }
    // $http({method: 'GET', url: query}).
    // //success(function(data, status, headers, config) {
    // success(function(data) {
    //     if (data.tables[0] === null) {
    //         $scope.$broadcast('loadError');
    //     } else {
    //         $scope.data = data;
    //         $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
    //         $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
    //         $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);
    //         $scope.$broadcast('spinnerHide');
    //     }
    // });
}]);