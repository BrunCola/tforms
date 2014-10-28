'use strict';

angular.module('mean.pages').controller('floorPlanController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
    $scope.global = Global;
    var query = '/local_events/endpoint_map?';
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (!data.force) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            var count = 0;
            $scope.data.force.forEach(function(d){
                d.id = count++;
            })
            //$scope.$broadcast('floorPlan');
            $scope.global.floorScale = 1;
            $scope.$broadcast('spinnerHide');
            $scope.floors = data.floor;
        }
        if ($location.$$search.lan_ip && $location.$$search.lan_zone && $location.$$search.type && $location.$$search.typeinfo){
            var query = '/local_events/endpoint_map?lan_ip='+$location.$$search.lan_ip+'&lan_zone='+$location.$$search.lan_zone+'&type=flooruser';
            $http({method: 'GET', url: query+'&typeinfo=userinfoload'}).
                success(function(data) {
                    $scope.requery(data[0]);
                    var selected = $scope.data.force.filter(function(d){ if ((data[0].lan_ip === d.lan_ip) && (data[0].lan_zone === d.lan_zone)){ return true }});
                    if (selected[0] !== undefined) { $scope.$broadcast('setSelected', selected[0]); }
                });
        }
    }); 

    $scope.requery = function(d) {
         // get user image
        if ($scope.lan_ip !== '-') {
            $rootScope.$broadcast('appendInfo', "", "", "clear");

            var userInfo = [];
            var query = '/local_events/endpoint_map?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=flooruser'; 
            
            $http({method: 'GET', url: query+'&typeinfo=assets'}).
                success(function(data) {
                    if (data[0] !== undefined) {
                        $rootScope.$broadcast('appendInfo', d, data[0].path, "assets");
                    } else {
                        $rootScope.$broadcast('appendInfo', d, '', "assets");
                    }
                });

            $scope.$broadcast('appendInfo', d,"","userinfo");                       

            $http({method: 'GET', url: query+'&typeinfo=localioc'}).
                success(function(data) {
                    $scope.$broadcast('appendInfo', d,data[0],"localioc");
                });

            $http({method: 'GET', url: query+'&typeinfo=localapp'}).
                success(function(data) {
                    $scope.$broadcast('appendInfo', d,data[0],"localapp");
                });

            $http({method: 'GET', url: query+'&typeinfo=localhttp'}).
                success(function(data) {
                    $scope.$broadcast('appendInfo', d,data[0],"localhttp");
                });

            $http({method: 'GET', url: query+'&typeinfo=localfiles'}).
                success(function(data) {
                    $scope.$broadcast('appendInfo', d,data[0],"localfiles");
                });

            $http({method: 'GET', url: query+'&typeinfo=endpoint'}).
                success(function(data) {
                    $scope.$broadcast('appendInfo', d,data[0],"endpoint");
                });

            $http({method: 'GET', url: query+'&typeinfo=bandwidth'}).
                success(function(data) {
                    $scope.$broadcast('appendInfo', d,data[0],"bandwidth");
                });

            $rootScope.$broadcast('appendInfo', d, "", "delete");
          
            //$scope.$broadcast('appendInfo', userInfo);
        }
    }

    $scope.editFloorPlan = function (floors) {
        //console.log(floors);
        $rootScope.modalFloors = floors;
        $scope.modalInstance = $modal.open({
            templateUrl: 'editModal.html',
            controller: uploadInstanceCtrl,
            keyboard: true,
            modalFloors: floors
        });
    };

    $scope.modelDelete = function (floors) {
        //console.log(floors);
        $rootScope.modalFloors = floors;
        $scope.modalInstance = $modal.open({
            templateUrl: 'deleteModal.html',
            controller: uploadInstanceCtrl,
            keyboard: true,
            modalFloors: floors
        });
    };
    $scope.change_customuser = function(item,value) {
        $http({method: 'POST', url: '/actions/change_custom_user', data: {custom_user: value, lan_ip: item.lan_ip, lan_zone: item.lan_zone}});
    }

    $scope.uploadOpen = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'uploadModal.html',
            controller: uploadInstanceCtrl,
            keyboard: true
        });
    };

    $scope.uploadUser = function (rowData) {
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
            location.reload();
        };

        $scope.editFloors = function(edited_floors) {
            $http({method: 'POST', url: '/local_events/endpoint_map?type=editFloorInfo', data: {edited_floors: edited_floors}});
            $scope.ok();
        };

        $scope.onFileSelect = function($files, clientWidth) {
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
                            //$timeout(function() {
                            $scope.dataUrls[index] = e.target.result;
                            $('#tempImg').attr('src', e.target.result);
                            var imagex = e.target.result;
                            var newimage = new Image();
                            newimage.src = imagex;
                            $scope.imageWidth = newimage.width ;
                            $scope.imageHeight = newimage.height;
                            //});
                        }
                    }(fileReader, i);
                }
                $scope.progress[i] = -1;
                //$scope.start(i);
            }
        };

        $scope.deleteFloorplan = function(floor_name, floors) {
            var imagePath = "";
            for (var f in floors) {
                if (floors[f].asset_name === floor_name.select) {
                    imagePath = floors[f].path;
                }
            }
            //console.log(imagePath);
            $http({method: 'POST', url: '/local_events/endpoint_map?type=deletefp', data: {asset_name: floor_name.select, path: imagePath}});
            $scope.ok();
        };

        if ($rootScope.modalRowData) {
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
        } else {
            $scope.start = function(index, custom_fn) {
                $scope.progress[index] = 0;
                $scope.errorMsg = null;
                $scope.upload[index] = $upload.upload({
                    url : '/uploads?custom_name='+custom_fn,
                    method: 'POST',
                    data : {
                        myModel : $scope.myModel,
                        imageType: 'map',
                        width: $scope.imageWidth,
                        height: $scope.imageHeight
                    },
                    file: $scope.selectedFiles[index],
                }).then(function(response) {
                    $scope.uploadResult.push(response.data);
                    console.log(response.data);
                }, function(response) {
                    if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
                }, function(evt) {
                    // Math.min is to fix IE which reports 200% sometimes
                    $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }).xhr(function(xhr){
                    xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
                });
            };
        }
    };
}]);
