'use strict';

angular.module('mean.pages').controller('floorPlanController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal) {
    $scope.global = Global;
    var query = '/local_events/local_floor_plan?';
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
            $scope.$broadcast('floorPlan', $scope.data.force);
            $scope.$broadcast('spinnerHide');
        }
    });  

    $scope.requery = function(d) {
         // get user image
        if ($scope.lan_ip !== '-') {
            var userInfo = [];
            var query = '/local_events/local_floor_plan?lan_ip='+d.lan_ip+'&lan_zone='+d.lan_zone+'&type=flooruser'; 
            
            $http({method: 'GET', url: query+'&typeinfo=assets'}).
                success(function(data) {
                    if (data[0] !== undefined) {
                        $scope.appendInfo(d,'public/pages/assets/img/staff/'+data[0].file,"assets");
                    }else{
                        $scope.appendInfo(d,'',"assets");
                    }
                });

            $scope.appendInfo("","","clear");
            $scope.appendInfo(d,"","userinfo");
                       

            $http({method: 'GET', url: query+'&typeinfo=localioc'}).
                success(function(data) {
                    $scope.appendInfo(d,data[0],"localioc");
                });

            $http({method: 'GET', url: query+'&typeinfo=localapp'}).
                success(function(data) {
                    $scope.appendInfo(d,data[0],"localapp");
                });

            $http({method: 'GET', url: query+'&typeinfo=localhttp'}).
                success(function(data) {
                    $scope.appendInfo(d,data[0],"localhttp");
                });

            $http({method: 'GET', url: query+'&typeinfo=localfiles'}).
                success(function(data) {
                    $scope.appendInfo(d,data[0],"localfiles");
                });

            $http({method: 'GET', url: query+'&typeinfo=endpoint'}).
                success(function(data) {
                    $scope.appendInfo(d,data[0],"endpoint");
                });

          
            //$scope.appendInfo(userInfo);
        }
    }

    $scope.change_customuser = function(item,value) {
        $http({method: 'POST', url: '/actions/change_custom_user', data: {custom_user: value, lan_ip: item.lan_ip, lan_zone: item.lan_zone}});
    }

    // $scope.uploadFile = function(files) {
    //     var fd = new FormData();
    //     //Take the first selected file

    //     fd.append("file", files[0]);
    //     console.log(fd);
    //     var uploadUrl = '../../../uploads/'; //TODO Different folders per client? Diff folders for User photos and floor plans?
    //     $http.post(uploadUrl, fd, {
    //         withCredentials: true,
    //         headers: {'Content-Type': undefined },
    //         transformRequest: angular.identity
    //     });//.success( console.log("UPLOADED");).error( console.log("error!"); );
    // };  


    $scope.uploadOpen = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'uploadModal.html',
            controller: uploadInstanceCtrl,
            keyboard: true
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
                    myModel : $scope.myModel
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
