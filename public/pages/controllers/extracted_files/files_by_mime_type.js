'use strict';

angular.module('mean.pages').controller('byMimeTypeController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/api/extracted_files/files_by_mime_type?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/api/extracted_files/files_by_mime_type?';
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
            $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);

            var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
            var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
            $scope.$broadcast('barChart', barDimension, barGroup, 'bar');
                $scope.barChartxAxis = '';
                $scope.barChartyAxis = 'Extracted Files / Hour';

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
            $scope.$broadcast('pieChart', 'application');
        }
    });
}]);