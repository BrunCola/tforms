'use strict';

angular.module('mean.pages').controller('endpointUserController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', 'timeFormat', 'runPage', 'Crossfilter', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal, timeFormat, runPage, Crossfilter) {
    $scope.global = Global;
    var query;

    $scope.tableCrossfitler = new Crossfilter([], '$id', 'persistent');
    
    var page = [
        /////////////////
        // CROSSFILTER //
        /////////////////
        {
            type: 'crossfilter', // required
            crossfilterObj: new crossfilter(), // required (if crossfilter)
            // key: 'crossfilter', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            run: function(data) { // optional run function to run after data has been fetched (takes an array of data)
                data.forEach(function(d) {
                    d.dd = timeFormat(d.time, 'strdDateObj');
                    d.hour = d3.time.hour(d.dd);
                    d.count = +d.count;
                });
            },
            get: '/api/local_events/endpoint_by_user/crossfilter', // no get default to main url, strings will replace the default (otherwise /[from root])
            visuals: [
                {
                    type: 'barchart',
                    settings: { 
                        type: 'bar',
                        xAxis: '',
                        yAxis: 'Endpoint Events / Hour'
                    },
                    dimension: function(cfObj) { return cfObj.dimension(function(d) { return d.hour; })},
                    group: function(dimension){ // groups are optional and should default to a reduce if undefined
                        return dimension.group().reduceSum(function(d) { return d.count });
                    },
                    // outgoingFilter: ['hour'] // Optional and ingests an array of KEYS for other visuals not of this type to match
                }
            ]
        },
        /////////////////
        ///// TABLE /////
        /////////////////
        {
            type: 'table', // required either array or single object
            crossfilterObj: $scope.tableCrossfitler, // required (if crossfilter)
            key: 'table', // bound to the response, wrap entire source if undefined
            refresh: true,
            searchable: true, // optional search param.. no if undefined
            get: '/api/local_events/endpoint_by_user/table',
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
    //     query = '/api/local_events/endpoint_by_user?start='+$location.$$search.start+'&end='+$location.$$search.end;
    // } else {
    //     query = '/api/local_events/endpoint_by_user?';
    // }
    // $http({method: 'GET', url: query}).
    // success(function(data) {
    //     if (data.tables[0] === null) {
    //         $scope.$broadcast('loadError');
    //     } else {
    //         data.crossfilter.forEach(function(d) {
    //             d.dd = timeFormat(d.time, 'strdDateObj');
    //             d.hour = d3.time.hour(d.dd);
    //             d.count = +d.count;
    //         });
    //         $scope.crossfilterData = crossfilter(data.crossfilter);
    //         $scope.piechartData = crossfilter(data.piechart);
    //         $scope.data = data;

    //         $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
    //         $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
    //         $scope.$broadcast('table', $scope.data.tables[0], $scope.tableData);

    //         var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
    //         var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
    //         $scope.$broadcast('barChart', barDimension, barGroup, 'bar');
    //             $scope.barChartxAxis = '';
    //             $scope.barChartyAxis = 'Endpoint Events / Hour';

    //         var countDimension = $scope.piechartData.dimension(function(d) { return d.count }).top(10).map(function(d){ return d.lan_user + " " + d.lan_zone + " " + d.lan_ip });
    //         $scope.appDimension = $scope.piechartData.dimension(function(d) { 
    //             if(countDimension.indexOf(d.lan_user + " " + d.lan_zone + " " + d.lan_ip) !== -1) {
    //                 return d.lan_user + " " + d.lan_zone + " " + d.lan_ip;
    //             } else {
    //                 return "Other";
    //             }
    //         });                 
    //         $scope.pieGroup = $scope.appDimension.group().reduceSum(function (d) {
    //             return d.count;
    //         });
    //         // console.log(pieGroup.top(Infinity));
    //         $scope.$broadcast('pieChart', 'application');
    //     }
    // });

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