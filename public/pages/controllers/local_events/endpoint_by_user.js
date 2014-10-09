'use strict';

angular.module('mean.pages').controller('endpointUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
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
            $scope.data = data;
            $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
            $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
            $scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
            $scope.$broadcast('spinnerHide');
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