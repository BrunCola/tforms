'use strict';

angular.module('mean.pages').controller('headController', ['$scope', 'Global', '$rootScope', '$location', '$state', function ($scope, Global, $rootScope, $location, $state) {
    $scope.global = Global;
    
    $scope.title = $state.current.data.title;
    $scope.daterange = $state.current.data.daterange;

    $rootScope.start = moment.unix(scope.global.startTime);
    $rootScope.end = moment.unix(scope.global.endTime);

    if ($location.$$absUrl.search('/report#!/') === -1) {
        $scope.isReport = false;
        $scope.isNotReport = true;
    } else {
        console.log('is report')
        $scope.isReport = true;
        $scope.isNotReport = false;
    }
    $scope.subtitle = [];
    if ($state.current.data.subtitleElm !== undefined) {
        $scope.subtitleElm = $state.current.data.subtitleElm;
        for (var i in $scope.subtitleElm) {
            $scope.subtitle.push({
                title: i,
                value: $location.$$search[$scope.subtitleElm[i]]
            })
            // $scope.subtitle += '\n'+i+': '+$location.$$search[$scope.subtitleElm[i]];
        }
    }
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        $rootScope.search = "";
        // $('#table').dataTable().fnFilter("");
        // $('#table').dataTable().fnClearTable();     
    })
}]);

