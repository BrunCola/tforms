'use strict';

angular.module('mean.pages').controller('iocEventsDrilldownController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal, timeFormat) {
    $scope.global = Global;
    var query;
    if ($location.$$search.start && $location.$$search.end) {
        query = '/ioc_notifications/ioc_events_drilldown?start='+$location.$$search.start+'&end='+$location.$$search.end+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID;
    } else {
        query = '/ioc_notifications/ioc_events_drilldown?lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID;
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

        $scope.quarLoad = function (user, num) {            
            $scope.modalInstance = $modal.open({
                templateUrl: 'quarModal.html',
                controller: quarInstanceCtrl,
                keyboard: true,
                resolve: {
                    numUser: function() {
                        return "User '"+user+"' has "+num+ " quarantines";
                    },
                    quar_user: function() {
                        return user;
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

        var quarInstanceCtrl = function ($scope, $modalInstance, numUser, quar_user) {
            $scope.ok = function () {
                $modalInstance.close();
            };
            $scope.numUser = numUser;
            $scope.quar_user = quar_user;
        };

        if (data.tree.childCount >= 35) {
            var divHeight = data.tree.childCount*12;
        } else {
            var divHeight = 420;
        }

        $scope.$broadcast('forceChart', data.force, {height: divHeight});
        $scope.$broadcast('treeChart', data.tree, {height: divHeight});

        $scope.lan_zone = data.info.main[0].lan_zone;
        $scope.lan_ip = $location.$$search.lan_ip;

        $scope.lan_port = data.info.main[0].lan_port;
        $scope.lan_user = data.info.main[0].lan_user;
        $scope.machine_name = data.info.main[0].machine;
        $scope.packets_recieved = data.info.main[0].out_packets;
        $scope.bytes_received = data.info.main[0].out_bytes;

        $scope.countryy = data.info.main[0].remote_country;
        if (data.info.main[0].remote_cc){
            $scope.flag = data.info.main[0].remote_cc.toLowerCase();
        }
        $scope.remote_ip = $location.$$search.remote_ip;
        $scope.remote_port = data.info.main[0].remote_port;
        $scope.in_packets = data.info.main[0].in_packets;
        $scope.in_bytes = data.info.main[0].in_bytes;
        $scope.l7_proto = data.info.main[0].l7_proto;
        $scope.remote_asn = data.info.main[0].remote_asn;
        $scope.remote_asn_name = data.info.main[0].remote_asn_name;

        $scope.first = timeFormat(data.info.main[0].first, 'iochits');
        $scope.last = timeFormat(data.info.main[0].last, 'iochits');

        $scope.iocc = $location.$$search.ioc;
        $scope.ioc_type = data.info.main[0].ioc_typeIndicator;
        $scope.ioc_rule = data.info.main[0].ioc_rule;

        if (data.info.desc[0] !== undefined) {
            $scope.$broadcast('iocDesc', data.info.desc[0].description)
        }

        $http({method: 'POST', url: '/actions/local_cc', data: {zone: $scope.lan_zone}}).
        success(function(data) {
            $scope.zone_cc = data.zone_cc.toLowerCase();
            $scope.zone_country = data.zone_country;
        })

        $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?trigger_type=quarantine&trigger_user='+$scope.lan_user}).
        success(function(data) {
            if (data[0] !== undefined) {
                $scope.num_user_quar = data[0].user_trigger;
                console.log($scope.num_user_quar);
            }else{
                $scope.num_user_quar = 0;
                console.log("test2");
                }
        });


        // get user image
        if ($scope.lan_ip !== '-') {
            $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?lan_zone='+$scope.lan_zone+'&lan_ip='+$scope.lan_ip+'&type=custom_user'}).
            success(function(data) {
                if (data[0] !== undefined) {
                    $scope.custom_user = data[0].custom_user;
                }
            });
        }

        if ($scope.lan_ip !== '-') {
            $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?lan_zone='+$scope.lan_zone+'&lan_ip='+$scope.lan_ip+'&type=assets'}).
            success(function(data) {
                if (data[0] !== undefined) {
                    //$scope.userImage = 'public/pages/assets/img/staff/'+data[0].file;
                    $scope.userImage = 'public/uploads/phirelight/'+data[0].file;
                }
            });
        }



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
            var query = '/ioc_notifications/ioc_events_drilldown?start='+minUnix+'&end='+maxUnix+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID+'&type=drill';
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

    $rootScope.quarantineLink = function(userFlag) {
        console.log("testetwrtdf");
        var query = '/ioc_notifications/ioc_events_drilldown?';
        $http({method: 'POST', url: query+"trigger_type=quarantine&flag="+userFlag});
        var url = 'stealth_quarantine';
        if ($location.$$search.start && $location.$$search.end) {
            $location.path(url).search({'start':$location.$$search.start, 'end':$location.$$search.end});
        } else {
            $location.path(url);
        }

    }



    $scope.firewallLink = function() {
        var url = 'firewall';
        if ($location.$$search.start && $location.$$search.end) {
            $location.path(url).search({'start':$location.$$search.start, 'end':$location.$$search.end});
        } else {
            $location.path(url);
        }
    }

}]);