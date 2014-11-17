'use strict';

angular.module('mean.pages').controller('floorPlanController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', 'searchFilter', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal, searchFilter) {
    $scope.global = Global;
    var query = '/local_events/endpoint_map?';
    if ($location.$$search.start && $location.$$search.end) {
        query = '/local_events/endpoint_map?start='+$location.$$search.start+'&end='+$location.$$search.end;
    } 
    $http({method: 'GET', url: query}).
    //success(function(data, status, headers, config) {
    success(function(data) {
        if (!data.users) {
            $scope.$broadcast('loadError');
        } else {
            $scope.data = data;
            $scope.standardWidth = 1000;
            var count = 0;       
            $scope.data.users.forEach(function(d){
                d.setFloor = false;
                d.id = count++;
                if (d.lan_os.toLowerCase().indexOf("win") !== -1 ){
                    d.machine_icon = "win";
                } else if ((d.lan_os.toLowerCase().indexOf("os") !== -1) ||  (d.lan_os.toLowerCase().indexOf("apple") !== -1)){
                    d.machine_icon = "os";
                } else if (d.lan_os.toLowerCase().indexOf("linux") !== -1 ){
                    d.machine_icon = "linux";
                } else {
                    d.machine_icon = "none";
                } 
            });

            $scope.crossfilterData = crossfilter(data.users);
            $scope.searchDimension = $scope.crossfilterData.dimension(function(d) { return d });
            $scope.userDimension = $scope.crossfilterData.dimension(function(d) { return d });

            $scope.$broadcast('spinnerHide');

            $rootScope.toggleView = false;
            $scope.floors = data.floor; 
            $scope.floors[0].active = true;

        }
        if ($location.$$search.lan_ip && $location.$$search.lan_zone && $location.$$search.type && $location.$$search.typeinfo){
            var query = '/local_events/endpoint_map?lan_ip='+$location.$$search.lan_ip+'&lan_zone='+$location.$$search.lan_zone+'&type=flooruser';
            $http({method: 'GET', url: query+'&typeinfo=userinfoload'}).
                success(function(data) {
                    if (data[0] !== undefined) {
                        $scope.floors.filter(function(d){ if ((data[0].map === d.asset_name)) { d.active = true; }});
                        $scope.requery(data[0]);
                        var selected = $scope.data.users.filter(function(d){ if ((data[0].lan_ip === d.lan_ip) && (data[0].lan_zone === d.lan_zone)){ return true }});
                        if (selected[0] !== undefined) { 
                            setTimeout(function () {
                                $scope.$broadcast('setSelected', selected[0]);
                                }, 0);
                            }
                    }                    
                });
        }
    });

    $scope.changePage = function (url, params) {
        if ($location.$$search.start && $location.$$search.end) {
            params.start = $location.$$search.start;
            params.end = $location.$$search.end;
        }
        if (url !== '') {
            $location.path(url).search(params);
        }
    }

    $scope.getConnections = function(d) {//-----------------------------------------------------Should be upgraded!!-------------------------------------------------------------------
        var query = '/local_events/endpoint_map?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=endpointconnection';
            $scope.startend = ""; 
            if ($location.$$search.start && $location.$$search.end) {
                query = '/local_events/endpoint_map?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=endpointconnection'; 
                $scope.startend = 'start='+$location.$$search.start+'&end='+$location.$$search.end+'&'; 
            } 
            $scope.selectedUser = "";
            $http({method: 'GET', url: query+'&typeinfo=getconn2'}).
                success(function(data) {
                    $scope.connectionIn = "";
                        var results = [];
                    if (data[0] != undefined) {
                        var users; 
                        var connections = data.map(function( da ) {
                            users = $scope.userDimension.filter(function(dt){ 
                                if ((da.remote_ip === dt.lan_ip)){
                                    results.push(dt);
                                }
                            });
                        });

                        $scope.connectionIn = results;
                    }
                });
             $http({method: 'GET', url: query+'&typeinfo=getconn4'}).
                success(function(data) {
                    $scope.connectionOut = "";
                    var results2 = [];
                    if (data[0] != undefined) {
                        var users; 
                        var connections = data.map(function( da ) {
                            users = $scope.userDimension.filter(function(dt){ 
                                if ((da.lan_ip === dt.lan_ip)){
                                    results2.push(dt);
                                }
                            });
                        });
                        $scope.connectionOut = results2;
                    }
                });
            $scope.selectedUser = d;
    }                                   //---------------^^^^^^^^^^^^^^^^-----------------------Should be upgraded!!--------------------------^^^^^^^^^^-------------------------

    $scope.userLink = function(d) {//-----------------------------------------------------Should be upgraded!!-------------------------------------------------------------------
        var query = '/local_events/endpoint_map?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=endpointconnection';
            $scope.startend = ""; 
            if ($location.$$search.start && $location.$$search.end) {
                query = '/local_events/endpoint_map?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=endpointconnection'; 
                $scope.startend = 'start='+$location.$$search.start+'&end='+$location.$$search.end+'&'; 
            } 
            $scope.selectedUser = "";
            $http({method: 'GET', url: query+'&typeinfo=getconn2'}).
                success(function(data) {
                    $scope.connectionIn = "";
                        var results = [];
                    if (data[0] != undefined) {
                        var users; 
                        var connections = data.map(function( da ) {
                            users = $scope.userDimension.filter(function(dt){  
                                if ((da.remote_ip === dt.lan_ip)){
                                    results.push(dt);
                                }
                            });
                        });

                        $scope.connectionIn = results;
                    }
                });
             $http({method: 'GET', url: query+'&typeinfo=getconn4'}).
                success(function(data) {
                    $scope.connectionOut = "";
                    var results2 = [];
                    if (data[0] != undefined) {
                        var users; 
                        var connections = data.map(function( da ) {
                            users = $scope.userDimension.filter(function(dt){ 
                                if ((da.lan_ip === dt.lan_ip)){
                                    results2.push(dt);
                                }
                            });
                        });
                        $scope.connectionOut = results2;
                    }
                });
            $scope.selectedUser = d;
        console.log(d)
    } 

    $scope.requery = function(d, type) {
         // get user image
         if (d === "clear") {
            $scope.userinfo = undefined;
            $scope.currentFloor = undefined;
            $scope.$apply();
         } else if(type === "listusers") {
            $scope.userinfo = undefined;
            var users = $scope.userDimension.filter(function(dt){ 
                    if ((d.asset_name === dt.map)){
                        return true;
                    }
                });
            $scope.currentFloor = users.top(Infinity);
         } else if ($scope.lan_ip !== '-') {
            $scope.currentFloor = undefined;
            var query = '/local_events/endpoint_map?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=flooruser';
            $scope.startend = ""; 
            if ($location.$$search.start && $location.$$search.end) {
                query = '/local_events/endpoint_map?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=flooruser'; 
                $scope.startend = 'start='+$location.$$search.start+'&end='+$location.$$search.end+'&'; 
            } 

            $http({method: 'GET', url: query+'&typeinfo=assets'}).
                success(function(data) {
                    if (data[0] !== undefined) {
                        $scope.userinfo.user_image = data[0].path;
                        //$rootScope.$broadcast('appendInfo', d, data[0].path, "assets");
                    } else {
                        $scope.userinfo.user_image = "public/system/assets/img/userplaceholder.jpg";
                    }
                });

            $scope.userinfo = d;                      

            $http({method: 'GET', url: query+'&typeinfo=localioc'}).
                success(function(data) {
                    $scope.userinfo.ioc_hits = data[0].localioc;
                });

            $http({method: 'GET', url: query+'&typeinfo=localapp'}).
                success(function(data) {
                    $scope.userinfo.app_hits = data[0].localapp;
                });

            $http({method: 'GET', url: query+'&typeinfo=localhttp'}).
                success(function(data) {
                    $scope.userinfo.http_hits = data[0].localhttp;
                });

            $http({method: 'GET', url: query+'&typeinfo=localfiles'}).
                success(function(data) {
                    $scope.userinfo.file_hits = data[0].localfiles;
                });

            $http({method: 'GET', url: query+'&typeinfo=endpoint'}).
                success(function(data) {
                    $scope.userinfo.endpoint_hits = data[0].endpoint;
                });

            $http({method: 'GET', url: query+'&typeinfo=bandwidth'}).
                success(function(data) {
                    $scope.userinfo.total_bw = data[0].totalbandwidth;
                });
        }
    }

    $scope.removeEndUser = function (user) {
        $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: 0, y_coord: 0, map_name: null, lan_ip: user.lan_ip, lan_zone: user.lan_zone}});
        $scope.redrawFloor();
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
            templateUrl: 'uploadUserModal.html',
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

        $scope.onFileSelect = function($files, floor_name) {
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
            $scope.selectedFiles[0].floor_name = floor_name;
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

        $scope.clearFiles = function(floor_name) {
            if (($scope.selectedFiles !== undefined) && ($scope.selectedFiles[0].floor_name !== floor_name)) {
                $scope.selectedFiles = undefined;
            }
        }

        $scope.editFloors = function(index, edited_floor) {
            if($scope.selectedFiles !== undefined){
                $scope.deleteFPImage(edited_floor.asset_name,edited_floor.path);
            }
            edited_floor.submitted = true;
            if ($scope.selectedFiles !== undefined) {
                $scope.progress[index] = 0;
                $scope.errorMsg = null;
                $scope.upload[index] = $upload.upload({
                    url : '/uploads',
                    method: 'POST',
                    data : {
                        myModel : $scope.myModel,
                        custom_name: edited_floor.custom_name, 
                        imageType: 'map',
                        updateFile: 'update',
                        width: $scope.imageWidth,
                        height: $scope.imageHeight,
                        order_index: edited_floor.order_index,
                        asset_name: edited_floor.asset_name,
                        scale: edited_floor.scale,
                        user_scale: edited_floor.user_scale
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
            } else { 
                $http({method: 'POST', url: '/local_events/endpoint_map?type=editFloorInfo', data: {edited_floor: edited_floor}});
            }
        };

        $scope.newBlankFloor = function(floor_name) {
            if (floor_name !== undefined) {
                $scope.cant_leave_blank = false;
                $http({method: 'POST', url: '/local_events/endpoint_map?type=newFloor', data: {custom_name: floor_name}});
                $scope.ok();
            } else {
                $scope.cant_leave_blank = true;
            }
        };

        $scope.deleteFPImage = function(floor_name, imagePath) {
            $http({method: 'POST', url: '/local_events/endpoint_map?type=deletefp', data: {asset_name: floor_name, path: imagePath}});
        };

        $scope.deleteFloorplan = function(floor_name, floors) {
            var imagePath = "";
            for (var f in floors) {
                if (floors[f].asset_name === floor_name.select) {
                    imagePath = floors[f].path;
                }
            }
            $http({method: 'POST', url: '/local_events/endpoint_map?type=deletefp&rem=removeFloorPlan', data: {asset_name: floor_name.select, path: imagePath}});
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
                    url : '/uploads',
                    method: 'POST',
                    data : {
                        myModel : $scope.myModel,
                        custom_name: custom_fn,
                        imageType: 'map',
                        width: $scope.imageWidth,
                        height: $scope.imageHeight,
                        scale: 1
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
