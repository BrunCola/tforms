'use strict';

angular.module('mean.pages').controller('iocEventsDrilldownController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/ioc_notifications/ioc_events_drilldown?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID+'&lan_user='+$location.$$search.lan_user;
    } else {
        query = '/ioc_notifications/ioc_events_drilldown?lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID+'&lan_user='+$location.$$search.lan_user;
    }
    $http({method: 'GET', url: query}).
    success(function(data) {
        $scope.crossfilterData = crossfilter();
        $scope.lanes = data.laneGraph.lanes;
        var id = 0;
        data.laneGraph.data.forEach(function(parent) {
            parent.forEach(function(child) {
                child.dd = timeFormat(child.time, 'strdDateObj');
                child.id = id;
                id++;
            })
            $scope.crossfilterData.add(parent);
        });
        $scope.$broadcast('laneGraph');
        $scope.description = function (d, e) {
            $scope.mData = d;
            $scope.mTitle = e;
            // $scope.$broadcast('moodal', d);
            $scope.modalInstance = $modal.open({
                templateUrl: 'descModal.html',
                controller: descInstanceCtrl,
                keyboard: true,
                resolve: {
                    data: function() {
                        var sentences = $scope.mData.split(". ");
                        var finalData = "";
                        //add a line break after every 3 sentences, for readability
                        for (var i = 0; i < sentences.length; i++) {
                            if(i >= sentences.length -1){
                                finalData += sentences[i];
                            } else if(i%3 === 1) {
                                finalData += sentences[i] + ". " + "\n\n";
                            } else {
                                finalData += sentences[i] + ". ";
                            }
                        }
                        return finalData;
                    },
                    ioc: function() {
                        if(e){
                            return $scope.mTitle
                        }else{
                            return $location.$$search.ioc;
                        }
                    }
                }
            });
        };

        $scope.getChildIOC = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'showAllModal.html',
                controller: descInstanceCtrl,
                keyboard: true,
                resolve: {
                    data: function() {
                        return $scope.child_ioc;
                    },
                    ioc: function() {
                        return "Child ID Information";
                    }
                }
            });
        };

        $scope.quarLoad = function () {            
            $scope.modalInstance = $modal.open({
                templateUrl: 'quarModal.html',
                controller: quarInstanceCtrl,
                keyboard: true,
                resolve: {
                    data: function() {
                        if ($scope.user_quar) {
                            return "'"+$scope.user_quar.lan_user+ "' is already Quarantined, would you like '"+$scope.user_quar.lan_user+"' to be removed from quarantine";
                        } else {
                            return "Would you like to Quarantine '"+$scope.infoData.lan_user+"'";
                        }
                    },
                    arquar: function() {
                        if ($scope.user_quar) {
                            return "rQuarantine";
                        } else {
                            return "Quarantine";
                        }
                    }
                }
            });
        };

        $scope.firewallLoad = function () {            
            $scope.modalInstance = $modal.open({
                templateUrl: 'firewallModal.html',
                controller: quarInstanceCtrl,
                keyboard: true,
                resolve: {
                    data: function() {                        
                        return "There is currently "+$scope.firewall_count+" firewall rules.";
                    },
                    arquar: function() {
                        return "";
                    }
                }
            });
        };

        var descInstanceCtrl = function ($scope, $modalInstance, data, ioc) {
            $scope.ok = function () {
                $modalInstance.close();
            };
            $scope.data = data;
            $scope.iocc = ioc;
        };

        var quarInstanceCtrl = function ($scope, $modalInstance, data, arquar) {
            $scope.ok = function () {
                $modalInstance.close();
            };
            $scope.quarantineLink = function() {
                $scope.currentdate = Math.round(new Date().getTime()/1000.0);
                var query = '/ioc_notifications/ioc_events_drilldown?';
                $http({method: 'POST', url: query+"trigger_type="+arquar+"&flag="+$location.$$search.lan_user+"&currenttime="+$scope.currentdate+"&email="+Global.user.email});
                //$http({method: 'POST', url: query+"trigger_type=stealthquarantine&currenttime="+$scope.currentdate+"&email="+Global.user.email+"&lan_zone="+$location.$$search.lan_zone+"&lan_user="+$location.$$search.lan_user});
                $modalInstance.close();
            }
            $scope.firewallLink = function(info) {
                $scope.currentdate = Math.round(new Date().getTime()/1000.0);
                var query = '/ioc_notifications/ioc_events_drilldown?';
                $http({method: 'POST', url: query+"trigger_type=firewall&currenttime="+$scope.currentdate+"&email="+Global.user.email+"&rule="+info.text+"&type="+info.select});
                $modalInstance.close();
            }
            $scope.data = data;
            //$scope.arquar = arquar;
        };

        if (data.tree.childCount >= 35) {
            var divHeight = data.tree.childCount*12;
        } else {
            var divHeight = 420;
        }

        $scope.$broadcast('forceChart', data.force, {height: divHeight});
        $scope.$broadcast('treeChart', data.tree, {height: divHeight});

        $scope.infoData = data.info.main[0];

        $scope.lan_ip = $location.$$search.lan_ip;
        $scope.remote_ip = $location.$$search.remote_ip;
        $scope.ioc_childID = $location.$$search.ioc_childID;

        $scope.first = timeFormat(data.info.main[0].first, 'iochits');
        $scope.last = timeFormat(data.info.main[0].last, 'iochits');

        $scope.iocc = $location.$$search.ioc;

        if (data.info.desc[0] !== undefined) {
            $scope.$broadcast('iocDesc', data.info.desc[0].description)
        }

        $http({method: 'POST', url: '/actions/local_cc', data: {zone: $scope.infoData.lan_zone}}).
        success(function(data) {
            $scope.zone_cc = data.zone_cc.toLowerCase();
            $scope.zone_country = data.zone_country;
        })

        $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?trigger_type=Quarantine&user_quarantine='+$scope.infoData.lan_user}).
        success(function(data) {
            if (data[0] !== undefined) {
                $scope.user_quar = data[0];
            }
        });

        $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?trigger_type=firewall'}).
        success(function(data) {
            if (data[0] !== undefined) {
                $scope.firewall_count = data[0].firewall_count;
            }
        });

        // get user image
        if ($scope.lan_ip !== '-') {
            $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?lan_zone='+$scope.infoData.lan_zone+'&lan_ip='+$scope.lan_ip+'&type=custom_user'}).
            success(function(data) {
                if (data[0] !== undefined) {
                    $scope.custom_user = data[0].custom_user;
                }
            });
        }

        if ($scope.lan_ip !== '-') {
            $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?lan_zone='+$scope.infoData.lan_zone+'&lan_ip='+$scope.lan_ip+'&type=assets'}).
            success(function(data) {
                if (data[0] !== undefined) {
                    //$scope.userImage = 'public/pages/assets/img/staff/'+data[0].file;
                    $scope.userImage = 'public/uploads/phirelight/'+data[0].file;
                }
            });
        }

        $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?type=child_id&ioc_childID='+$scope.ioc_childID}).
        success(function(data) {
            if (data[0] !== undefined) {
                $scope.child_ioc = data;

                //iterate and check against user stuff here? in order to highlight?
                data.forEach(function(d){
                    if(d.typeIndicator == "IP Indicator") {
                        console.log("IP indicator");

                        $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?type=ioc_ip_match&ioc_ip='+d.ioc + '&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&lan_user='+$location.$$search.lan_user}).
                        success(function(result) {
                            console.log(result);
                            var elements = document.getElementsByTagName('a');
                            
                            for (var i = 0; i < elements.length; i++) {
                                // if (elements.className.split(/\s+/).indexOf('red') !== -1) {
                                    elements[i].style.color = 'red';
                                // }
                            }
                        });
                    }
                });
            }
        });

    });

    $scope.requery = function(min, max, callback) {
        var minUnix = moment(min).unix();
        var maxUnix = moment(max).unix();
        if (($scope.inTooDeep.min === minUnix) && ($scope.inTooDeep.max === maxUnix)) {
            $scope.inTooDeep.areWe = true;
            // $scope.inTooDeep.min = minUnix;
            // $scope.inTooDeep.max = maxUnix;
        }
        if (($scope.inTooDeep.areWe === true) && (minUnix >= $scope.inTooDeep.min) && (maxUnix <= $scope.inTooDeep.max)) {
            var deepItems = $scope.deepItems.filter(function(d) { if((d.dd < max) && (d.dd > min)) {return true};});
            callback(deepItems);
            $scope.alert.style('display', 'block');
        } else {
            //  set $scope.inTooDeep
            $scope.inTooDeep = {
                areWe: true,
                min: minUnix,
                max: maxUnix
            };
            //  grab more from api
            var query = '/ioc_notifications/ioc_events_drilldown?start='+minUnix+'&end='+maxUnix+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID+'&type=drill'+'&lan_user='+$location.$$search.lan_user;
            $http({method: 'GET', url: query}).
                success(function(data) {
                    $scope.crossfilterDeep = crossfilter();
                    var id = 0;
                    data.laneGraph.data.forEach(function(parent) {
                        parent.forEach(function(child) {
                            child.dd = timeFormat(child.time, 'strdDateObj');
                            child.id = id;
                            id++;
                        })
                        $scope.crossfilterDeep.add(parent);
                    });
                    var itemsDimension = $scope.crossfilterDeep.dimension(function(d){ return d.time });
                    $scope.deepItems = itemsDimension.top(Infinity);
                    callback($scope.deepItems);
                    $scope.alert.style('display', 'block');
                });
        }
    }
    $scope.patternPane = false;
    $scope.$on('patternPane', function() {
        $scope.$apply(function () {
            if ($scope.patternPane) {
                $scope.patternPane = false;
            } else {
                $scope.patternPane = true;
            }
        })
    })
}]);