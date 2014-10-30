'use strict';

angular.module('mean.pages').controller('endpointTypeController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/endpoint_by_type?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/local_events/endpoint_by_type?';
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data.tables[0] === null) {
            $scope.$broadcast('loadError');
        } else {
            data.crossfilter.forEach(function(d) {
                d.dd = timeFormat(d.time, 'strdDateObj');
                d.hour = d3.time.hour(d.dd);
                d.count = +d.count;
            });
            $scope.crossfilterData = crossfilter(data.crossfilter);
            $scope.piechartData = crossfilter(data.piechart);
            $scope.data = data;

            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

            var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
            var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
            $scope.$broadcast('barChart', barDimension, barGroup, 'bar');
                $scope.barChartxAxis = '';
                $scope.barChartyAxis = 'Endpoint Events / Hour';

            var countDimension = $scope.piechartData.dimension(function(d) { return d.count }).top(10).map(function(d){ return d.pie_dimension });
            $scope.appDimension = $scope.piechartData.dimension(function(d) { 
                if(countDimension.indexOf(d.pie_dimension) !== -1) {
                    return d.pie_dimension;
                } else {
                    return "Other";
                }
            });                 
            $scope.pieGroup = $scope.appDimension.group().reduceSum(function (d) {
                return d.count;
            });
            // console.log(pieGroup.top(Infinity));
            $scope.$broadcast('pieChart', 'application');
        }
    });
}]);