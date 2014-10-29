'use strict';

angular.module('mean.pages').controller('endpointUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/endpoint_by_user?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } else {
        query = '/local_events/endpoint_by_user?';
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

            var countDimension = $scope.piechartData.dimension(function(d) { return d.count }).top(10).map(function(d){ return d.lan_user + " " + d.lan_zone + " " + d.lan_ip });
            $scope.appDimension = $scope.piechartData.dimension(function(d) { 
                if(countDimension.indexOf(d.lan_user + " " + d.lan_zone + " " + d.lan_ip) !== -1) {
                    return d.lan_user + " " + d.lan_zone + " " + d.lan_ip;
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

    $scope.uploadOpen = function (rowData) {
        $rootScope.modalRowData = rowData;

        $scope.modalInstance = $modal.open({
            templateUrl: 'uploadModal.html',
            controller: uploadInstanceCtrl,
            keyboard: true,
            modalRowData: rowData
        });
    };
    var uploadInstanceCtrl = function ($scope, $modalInstance, $upload) {

        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.onFileSelect = function($files) {

            $scope.selectedFiles = [];
            $scope.progress = [];
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i = 0; i < $scope.upload.length; i++) {
                    if ($scope.upload[i] != null) {
                        $scope.upload[i].abort();
                    }
                }
            }
            $scope.upload = [];
            $scope.uploadResult = [];
            $scope.selectedFiles = $files;
            $scope.dataUrls = [];
            for ( var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                if (window.FileReader && $file.type.indexOf('image') > -1) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($files[i]);
                    var loadFile = function(fileReader, index) {
                        fileReader.onload = function(e) {
                            $timeout(function() {
                                $scope.dataUrls[index] = e.target.result;
                            });
                        }
                    }(fileReader, i);
                }
                $scope.progress[i] = -1;
                $scope.start(i);
            }
        };
        $scope.start = function(index) {
            $scope.progress[index] = 0;
            $scope.errorMsg = null;

            $scope.upload[index] = $upload.upload({
                url : '/uploads',
                method: 'POST',
                data : {
                    myModel : $scope.myModel,
                    imageType: 'user',
                    lan_user: $rootScope.modalRowData.lan_user,
                    lan_zone: $rootScope.modalRowData.lan_zone,
                    lan_ip: $rootScope.modalRowData.lan_ip
                },
                file: $scope.selectedFiles[index],
            }).then(function(response) {
                $scope.uploadResult.push(response.data);
            }, function(response) {
                if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
            }, function(evt) {
                // Math.min is to fix IE which reports 200% sometimes
                $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            }).xhr(function(xhr){
                xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
            });
        };
    };
}]);