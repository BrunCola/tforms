'use strict';

angular.module('mean.pages').controller('iocEventsDrilldownController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', '$modal', 'timeFormat', function ($scope, $stateParams, $location, Global, $rootScope, $http, $modal, timeFormat) {
    $scope.global = Global;


    $scope.points = [
          {
             "result":[
                {
                   "lan_user":"-",
                   "lan_ip":"10.0.0.129"
                }
             ],
             "point":{
                "type":"File",
                "time":1414601572.184742,
                "mime":"image/png",
                "name":"Share-Arrow-Up(1x).png",
                "size":347,
                "md5":"2e5d854358a17055b40c19285b9d5ad0",
                "sha1":"e4ae91c2f2daa60b6ff069b639361940215afc28",
                "ioc":"-",
                "ioc_typeIndicator":"-",
                "ioc_typeInfection":"-",
                "ioc_rule":"-",
                "ioc_severity":0,
                "ioc_count":0,
                "lane":9,
                "checked": true,
                "info":"File Seen - Share-Arrow-Up(1x).png",
                "expand":[
                   {
                      "name":"Time",
                      "value":1414601572.184742,
                      "select":"time"
                   },
                   {
                      "name":"File Type",
                      "value":"image/png",
                      "select":"mime"
                   },
                   {
                      "name":"Name",
                      "value":"Share-Arrow-Up(1x).png",
                      "select":"name",
                      "pattern":true
                   },
                   {
                      "name":"Size",
                      "value":347,
                      "select":"size"
                   },
                   {
                      "name":"MD5",
                      "value":"2e5d854358a17055b40c19285b9d5ad0",
                      "select":"md5"
                   },
                   {
                      "name":"SHA1",
                      "value":"e4ae91c2f2daa60b6ff069b639361940215afc28",
                      "select":"sha1"
                   },
                   {
                      "name":"IOC",
                      "value":"-",
                      "select":"ioc"
                   },
                   {
                      "name":"IOC Severity",
                      "value":0,
                      "select":"ioc_severity"
                   },
                   {
                      "name":"IOC Type",
                      "value":"-",
                      "select":"ioc_typeIndicator"
                   },
                   {
                      "name":"IOC Stage",
                      "value":"-",
                      "select":"ioc_typeInfection"
                   },
                   {
                      "name":"IOC Rule",
                      "value":"-",
                      "select":"ioc_rule"
                   }
                ],
                "dd":"2014-10-29T16:52:52.184Z",
                "id":51
             },
             "selected":{
                "length":1,
                "Name":{
                   "name":"Name",
                   "value":"Share-Arrow-Up(1x).png",
                   "select":"name",
                   "pattern":true
                }
             }
          },
          {
             "result":[
                {
                   "lan_user":"-",
                   "lan_ip":"10.0.0.129"
                }
             ],
             "point":{
                "type":"File",
                "time":1414601572.184742,
                "mime":"image/png",
                "name":"Share-Arrow-Up(1x).png",
                "size":347,
                "md5":"2e5d854358a17055b40c19285b9d5ad0",
                "sha1":"e4ae91c2f2daa60b6ff069b639361940215afc28",
                "ioc":"-",
                "ioc_typeIndicator":"-",
                "ioc_typeInfection":"-",
                "ioc_rule":"-",
                "ioc_severity":0,
                "ioc_count":0,
                "checked": true,
                "lane":9,
                "info":"File Seen - Share-Arrow-Up(1x).png",
                "expand":[
                   {
                      "name":"Time",
                      "value":1414601572.184742,
                      "select":"time"
                   },
                   {
                      "name":"File Type",
                      "value":"image/png",
                      "select":"mime"
                   },
                   {
                      "name":"Name",
                      "value":"Share-Arrow-Up(1x).png",
                      "select":"name",
                      "pattern":true
                   },
                   {
                      "name":"Size",
                      "value":347,
                      "select":"size"
                   },
                   {
                      "name":"MD5",
                      "value":"2e5d854358a17055b40c19285b9d5ad0",
                      "select":"md5"
                   },
                   {
                      "name":"SHA1",
                      "value":"e4ae91c2f2daa60b6ff069b639361940215afc28",
                      "select":"sha1"
                   },
                   {
                      "name":"IOC",
                      "value":"-",
                      "select":"ioc"
                   },
                   {
                      "name":"IOC Severity",
                      "value":0,
                      "select":"ioc_severity"
                   },
                   {
                      "name":"IOC Type",
                      "value":"-",
                      "select":"ioc_typeIndicator"
                   },
                   {
                      "name":"IOC Stage",
                      "value":"-",
                      "select":"ioc_typeInfection"
                   },
                   {
                      "name":"IOC Rule",
                      "value":"-",
                      "select":"ioc_rule"
                   }
                ],
                "dd":"2014-10-29T16:52:52.184Z",
                "id":51
             },
             "selected":{
                "length":1,
                "Name":{
                   "name":"Name",
                   "value":"Share-Arrow-Up(1x).png",
                   "select":"name",
                   "pattern":true
                }
             }
          },
          {
             "result":[
                {
                   "lan_user":"-",
                   "lan_ip":"10.0.0.129"
                }
             ],
             "point":{
                "type":"File",
                "time":1414601572.184742,
                "mime":"image/png",
                "name":"Share-Arrow-Up(1x).png",
                "size":347,
                "md5":"2e5d854358a17055b40c19285b9d5ad0",
                "sha1":"e4ae91c2f2daa60b6ff069b639361940215afc28",
                "ioc":"-",
                "ioc_typeIndicator":"-",
                "ioc_typeInfection":"-",
                "ioc_rule":"-",
                "ioc_severity":0,
                "checked": true,
                "ioc_count":0,
                "lane":9,
                "info":"File Seen - Share-Arrow-Up(1x).png",
                "expand":[
                   {
                      "name":"Time",
                      "value":1414601572.184742,
                      "select":"time"
                   },
                   {
                      "name":"File Type",
                      "value":"image/png",
                      "select":"mime"
                   },
                   {
                      "name":"Name",
                      "value":"Share-Arrow-Up(1x).png",
                      "select":"name",
                      "pattern":true
                   },
                   {
                      "name":"Size",
                      "value":347,
                      "select":"size"
                   },
                   {
                      "name":"MD5",
                      "value":"2e5d854358a17055b40c19285b9d5ad0",
                      "select":"md5"
                   },
                   {
                      "name":"SHA1",
                      "value":"e4ae91c2f2daa60b6ff069b639361940215afc28",
                      "select":"sha1"
                   },
                   {
                      "name":"IOC",
                      "value":"-",
                      "select":"ioc"
                   },
                   {
                      "name":"IOC Severity",
                      "value":0,
                      "select":"ioc_severity"
                   },
                   {
                      "name":"IOC Type",
                      "value":"-",
                      "select":"ioc_typeIndicator"
                   },
                   {
                      "name":"IOC Stage",
                      "value":"-",
                      "select":"ioc_typeInfection"
                   },
                   {
                      "name":"IOC Rule",
                      "value":"-",
                      "select":"ioc_rule"
                   }
                ],
                "dd":"2014-10-29T16:52:52.184Z",
                "id":51
             },
             "selected":{
                "length":1,
                "Name":{
                   "name":"Name",
                   "value":"Share-Arrow-Up(1x).png",
                   "select":"name",
                   "pattern":true
                }
             }
          }
       ];
       $scope.matched = [
          {
             "lan_user":"-",
             "lan_ip":"10.0.0.129"
          }
       ]


    function compare(data) {
        var totalPoints = data.length;
        if (totalPoints < 2) { return false } // return if there aren't enough points to compare
        function equals(object, object2) {
            //For the first loop, we only check for types
            for (var propName in object) {
                if (propName !== '$$hashKey') { // ignore angular's inserted id key
                    // checks if they share the same keys/properties
                    if (object.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                        return false;
                    }
                    //Check instance type
                    else if (typeof object[propName] != typeof object2[propName]) {
                        return false;
                    }
                }
            }
            //Now a deeper check using other objects property names
            for (var propName in object2) {
                if (propName !== '$$hashKey') { // ignore angular's inserted id key
                    //We must check instances anyway, there may be a property that only exists in object2
                        //I wonder, if remembering the checked values from the first loop would be faster or not 
                    if (object.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                        return false;
                    }
                    else if (typeof object[propName] != typeof object2[propName]) {
                        return false;
                    }
                    //If the property is inherited, do not check any more (it must be equal if both objects inherit it)
                    if (!object.hasOwnProperty(propName)) continue;
                    //Now the detail check and recursion
                    //object returns the script back to the array comparing
                    if (object[propName] instanceof Array && object2[propName] instanceof Array) {
                        // recurse into the nested arrays
                        if (!object[propName].equals(object2[propName])) return false;
                    }
                    else if (object[propName] instanceof Object && object2[propName] instanceof Object) {
                        // recurse into another objects
                        if (!object[propName].equals(object2[propName])) return false;
                    }
                    //Normal value comparison for strings and numbers
                    else if (object[propName] != object2[propName]) {
                        return false;
                    }
                }
            }
            // return true if everything passed
            return true;
        }
        function checkMatch(checkOne, checkTwo) {
            var matched = [];
            for (var r in checkOne) {
                var thisMatched = checkTwo.filter(function(d){ if (equals(checkOne[r], d)) { return true; } });
                // push every item of each array returned to a single larger array of matched items
                for (var m in thisMatched) {
                    matched.push(thisMatched[m]);
                }
            }
            if (matched.length > 0) { return matched } else { return false }
        }   
        for (var i = 0; i < totalPoints; i++) { // each one of these is a seperate query / point with its own array of objects
            var matched = [];
            if (i === 0) { // run if first array
                var thisPoint = data[i].result;
                var nextPoint = data[i+1].result;
                var check = checkMatch(thisPoint, nextPoint);
                if (check) {
                    // set our matched results
                    matched = check;
                } else {
                    // return if the first check didn't return results
                    return false;
                }
            } else if ((matched.length > 0) && (i !== 1)) { // continue if the first loop matched, but skip the second 'i' since the we already tested it
                var thisPoint = data[i].result;
                var check = checkMatch(matched, thisPoint);
                if (check) {
                    matched = check;
                } else {
                    return false;
                }
            }
            if (matched.length > 0) { return matched } else { return false }
        }
    }

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

        $http({method: 'GET', url: '/ioc_notifications/ioc_events_drilldown?type=child_id&ioc_childID='+$scope.ioc_childID+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&lan_user='+$location.$$search.lan_user}).
        success(function(result) {
            if (result.data[0] !== undefined) {
                $scope.child_ioc = result.data;

                if(result.highlight){
                    var elements = document.getElementsByTagName('a');

                    for (var i = 0; i < elements.length; i++) {
                         if (elements[i].id == 'ioc_attr_link') {
                            elements[i].style.color = 'red';
                        }
                    }
                }
            }
        });
    });

    $scope.changePage = function (url, params) {
        if ($location.$$search.start && $location.$$search.end) {
            params.start = $location.$$search.start;
            params.end = $location.$$search.end;
        }
        if (url !== '') {
          console.log(url);
          console.log(params);
            $location.path(url).search(params);
        }
    }

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
    $scope.patternPane = true;
    $scope.$on('patternPane', function (event, data) {
        if ($scope.patternPane) { $scope.patternPane = false; return }
        // loop through and add a checked flag for each point (for use in finding commonalities)
        data.forEach(function(d){
            d.point.checked = true;
        })
        $scope.$broadcast('appendRowIcon');
        $scope.patternPane = true;
        $scope.points = data;
        if (data.length === 1) {
            $scope.matched = data[0].result;
        } else {
            $scope.matched = compare(data);
        }
    })
    $scope.checkboxChange = function() {
        // whenever a checkbox is checked, re-compare our existing points
        var points = $scope.points.filter(function(d){ return d.point.checked });
        if (points.length === 1) {
            // if there is only one return, just display its results without comparing
            $scope.matched = points[0].result;
        } else {
            // otherwise just attempt to compare .. it will still return null if points.length is 0
            $scope.matched = compare(points);
        }
    }
    $scope.closePatternBox = function() {
        $scope.patternPane = false;
    }
}]);
