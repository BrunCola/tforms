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
            $scope.$broadcast('floorPlan');
            $scope.$broadcast('spinnerHide');
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
          
            //$scope.$broadcast('appendInfo', userInfo);
        }
    }

    $scope.ioc_users_requery = function() {
        $rootScope.$broadcast('appendInfo', "", "", "clear");//needed?

        var query = '/local_events/local_floor_plan?type=floorquery'; 

        $http({method: 'GET', url: query+'&typeinfo=iocusers'}).
            success(function(data) {
                console.log(data);
                $scope.$broadcast('appendInfo', data[0],"iocusers");//THIS WILL LIKELY NEED TO CHANGE...
            });
    }

    $scope.active_users_requery = function() {
        $rootScope.$broadcast('appendInfo', "", "", "clear");//needed?

        var query = '/local_events/local_floor_plan?type=floorquery'; 

        $http({method: 'GET', url: query+'&typeinfo=activeusers'}).
            success(function(data) {
                console.log(data);
                $scope.$broadcast('appendInfo', data[0],"activeusers");//THIS WILL LIKELY NEED TO CHANGE...
            });
    }

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



        if ($rootScope.modalRowData.lan_ip) {
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
            $scope.start = function(index) {
                $scope.progress[index] = 0;
                $scope.errorMsg = null;
                $scope.upload[index] = $upload.upload({
                    url : '/uploads',
                    method: 'POST',
                    data : {
                        myModel : $scope.myModel,
                        imageType: 'map'
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
        }
    };

}]);
