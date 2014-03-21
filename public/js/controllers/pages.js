// ARCHIVE
angular.module('mean.iochits').controller('archiveController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/archive?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/archive'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
			var geoGroup = geoDimension.group().reduceSum(function (d) {
				return d.count;
			});
			$scope.$broadcast('geoChart', geoDimension, geoGroup);
			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
			var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
			var barGroupPre = barDimension.group();
			var barGroup = barGroupPre.reduce(
				function(p, v) {
					if (v.ioc_severity === 1) {
						p.guarded += v.count;
					}
					if (v.ioc_severity === 2) {
						p.elevated += v.count;
					}
					if (v.ioc_severity === 3) {
						p.high += v.count;
					}
					if (v.ioc_severity === 4) {
						p.severe += v.count;
					}
					if (v.ioc_severity === null) {
						p.other += v.count;
					}
					return p;
				},
				function(p, v) {
					if (v.ioc_severity === 1) {
						p.guarded -= v.count;
					}
					if (v.ioc_severity === 2) {
						p.elevated -= v.count;
					}
					if (v.ioc_severity === 3) {
						p.high -= v.count;
					}
					if (v.ioc_severity === 4) {
						p.severe -= v.count;
					}
					if (v.ioc_severity === null) {
						p.other -= v.count;
					}
					return p;
				},
				function() {
					return {
						guarded:0,
						elevated:0,
						high:0,
						severe:0,
						other:0
					};
				}
			);
			$scope.$broadcast('barChart', barDimension, barGroup, 'severity');
			$scope.barChartxAxis = '';
			$scope.barChartyAxis = '# IOC / Hour';
			if (data.tables === null) {
				$scope.$broadcast('loadError');
			}
		});
		$rootScope.pageTitle = 'Archived IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);

// FILE LOCAL
angular.module('mean.iochits').controller('fileLocalController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/file_local?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_ip='+$routeParams.lan_ip+'&mime='+$routeParams.mime;
		} else {
			query = '/file_local?lan_ip='+$routeParams.lan_ip+'&mime='+$routeParams.mime;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
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
		$rootScope.pageTitle = 'Extracted Files';
	};
	$rootScope.rootpage = true;
}]);

// FILE MIME
angular.module('mean.iochits').controller('fileMimeController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/file_mime?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/file_mime'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
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
		$rootScope.pageTitle = 'Extracted Files';
	};
	$rootScope.rootpage = true;
}]);

// FILE NAME
angular.module('mean.iochits').controller('fileNameController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/file_name?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_ip='+$routeParams.lan_ip;
		} else {
			query = '/file_name?lan_ip='+$routeParams.lan_ip;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
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
		$rootScope.pageTitle = 'Extracted Files';
	};
	$rootScope.rootpage = true;
}]);

// IOC DRILL
angular.module('mean.iochits').controller('IocDrillController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/ioc_drill?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_ip='+$routeParams.lan_ip+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc+'&ioc_attrID='+$routeParams.ioc_attrID;
		} else {
			query = '/ioc_drill?lan_ip='+$routeParams.lan_ip+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc+'&ioc_attrID='+$routeParams.ioc_attrID;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.crossfilter.length === 0) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				var arr = [];
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;
				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup, 'drill');

				$scope.$broadcast('tableLoad', null, $scope.data.tables, 'drill');
				var sevDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var sevGroupPre = sevDimension.group();
				var sevGroup = sevGroupPre.reduce(
					function(p, v) {
						if (v.type === 'DNS') {
							p.dns += v.count;
						}
						if (v.type === 'HTTP') {
							p.http += v.count;
						}
						if (v.type === 'SSL') {
							p.ssl += v.count;
						}
						if (v.type === 'File') {
							p.file += v.count;
						}
						if (v.type === 'Endpoint') {
							p.ossec += v.count;
						}
						if (v.type === 'Total Connections') {
							p.connections += v.count;
						}
						return p;
					},
					function(p, v) {
						if (v.type === 'DNS') {
							p.dns -= v.count;
						}
						if (v.type === 'HTTP') {
							p.http -= v.count;
						}
						if (v.type === 'SSL') {
							p.ssl -= v.count;
						}
						if (v.type === 'File') {
							p.file -= v.count;
						}
						if (v.type === 'Endpoint') {
							p.ossec -= v.count;
						}
						if (v.type === 'Total Connections') {
							p.connections -= v.count;
						}
						return p;
					},
					function() {
						return {
							dns:0,
							http:0,
							ssl:0,
							file:0,
							ossec:0,
							connections:0
						};
					}
				);
				$scope.$broadcast('barChart', sevDimension, sevGroup, 'drill');
					$scope.barChartxAxis = null;
					$scope.barChartyAxis = null;
				if ($scope.data.tree.childCount >= 35) {
					var divHeight = $scope.data.tree.childCount*12;
				} else {
					var divHeight = 420;
				}
				$scope.$broadcast('forceChart', $scope.data.force, {height: divHeight});
				$scope.$broadcast('treeChart', $scope.data.tree, {height: divHeight});

				var rowDimension = $scope.crossfilterData.dimension(function(d) { return d.type; });
				var rowGroupPre = rowDimension.group().reduceSum(function(d) { return d.count });
				var rowGroup = rowGroupPre.reduce(
					function (d, v) {
						if (v.type == "DNS"){
							d.cColor = 0;
							d.count += v.count;
						}
						if (v.type == "HTTP"){
							d.cColor = 1;
							d.count += v.count;
						}
						if (v.type == "SSL"){
							d.cColor = 2;
							d.count += v.count;
						}
						if (v.type == "File"){
							d.cColor = 3;
							d.count += v.count;
						}
						if (v.type == "Endpoint"){
							d.cColor = 4;
							d.count += v.count;
						}
						if (v.type == "Total Connections"){
							d.cColor = 5;
							d.count += v.count;
						}
						return d;
					},
					/* callback for when data is removed from the current filter results */
					function (d, v) {
						if (v.type == "DNS"){
							d.cColor = 0;
							d.count -= v.count;
						}
						if (v.type == "HTTP"){
							d.cColor = 1;
							d.count -= v.count;
						}
						if (v.type == "SSL"){
							d.cColor = 2;
							d.count -= v.count;
						}
						if (v.type == "File"){
							d.cColor = 3;
							d.count -= v.count;
						}
						if (v.type == "Endpoint"){
							d.cColor = 4;
							d.count -= v.count;
						}
						if (v.type == "Total Connections"){
							d.cColor = 5;
							d.count -= v.count;
						}
						return d;
					},
					/* initialize d */
					function () {
						return {count: 0, cColor: 0};
					}
				);
				$scope.$broadcast('rowChart', rowDimension, rowGroup, 'drill', {height: 230});

				$scope.lan_zone = data.info.main[0].lan_zone;
				$scope.lan_ip = $routeParams.lan_ip;
				$scope.lan_port = data.info.main[0].lan_port;
				$scope.machine_name = data.info.main[0].machine;
				$scope.packets_recieved = data.info.main[0].out_packets;
				$scope.bytes_received = data.info.main[0].out_bytes;

				$scope.countryy = data.info.main[0].remote_country;
				if (data.info.main[0].remote_cc){
					$scope.flag = data.info.main[0].remote_cc.toLowerCase();
				}
				$scope.remote_ip = $routeParams.remote_ip;
				$scope.remote_port = data.info.main[0].remote_port;
				$scope.in_packets = data.info.main[0].in_packets;
				$scope.in_bytes = data.info.main[0].in_bytes;
				$scope.first = data.info.main[0].first;
				$scope.l7_proto = data.info.main[0].l7_proto;
				$scope.remote_asn = data.info.main[0].remote_asn;
				$scope.remote_asn_name = data.info.main[0].remote_asn_name;
				$scope.last = data.info.main[0].last;

				$scope.iocc = $routeParams.ioc;
				$scope.ioc_type = data.info.main[0].ioc_typeIndicator;

				if (data.info.desc[0].description) {
					var description = data.info.desc[0].description;
					var len = description.length;
					if (len > 300) {
						$scope.desc = description.substr(0,300);
						$scope.$broadcast('iocDesc', description);
					} else {
						$scope.desc = description;
					}
				}
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';
		//$rootScope.activeLink = 'iochits';
	};
	$rootScope.rootpage = true;
}]);

// IOC DRILL(OLD)
angular.module('mean.iochits').controller('IocDrillOLDController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/ioc_drill?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_ip='+$routeParams.lan_ip+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		} else {
			query = '/ioc_drill?lan_ip='+$routeParams.lan_ip+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroupPre = barDimension.group();
				var barGroup = barGroupPre.reduce(
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded += v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated += v.count;
						}
						if (v.ioc_severity === 3) {
							p.high += v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe += v.count;
						}
						if (v.ioc_severity === null) {
							p.other += v.count;
						}
						return p;
					},
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded -= v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated -= v.count;
						}
						if (v.ioc_severity === 3) {
							p.high -= v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe -= v.count;
						}
						if (v.ioc_severity === null) {
							p.other -= v.count;
						}
						return p;
					},
					function() {
						return {
							guarded:0,
							elevated:0,
							high:0,
							severe:0,
							other:0
						};
					}
				);
				$scope.$broadcast('barChart', barDimension, barGroup, 'severity');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# IOC / Hour';

				$scope.lan_zone = data.info.main[0].lan_zone;
				$scope.lan_ip = $routeParams.lan_ip;
				$scope.lan_port = data.info.main[0].lan_port;
				$scope.machine_name = data.info.main[0].machine;
				$scope.packets_recieved = data.info.main[0].out_packets;
				$scope.bytes_received = data.info.main[0].out_bytes;

				$scope.countryy = data.info.main[0].remote_country;
				if (data.info.main[0].remote_cc){
					$scope.flag = data.info.main[0].remote_cc.toLowerCase();
				}
				$scope.remote_ip = $routeParams.remote_ip;
				$scope.remote_port = data.info.main[0].remote_port;
				$scope.in_packets = data.info.main[0].in_packets;
				$scope.in_bytes = data.info.main[0].in_bytes;
				$scope.first = data.info.main[0].first;
				$scope.l7_proto = data.info.main[0].l7_proto;
				$scope.remote_asn = data.info.main[0].remote_asn;
				$scope.remote_asn_name = data.info.main[0].remote_asn_name;
				$scope.last = data.info.main[0].last;

				$scope.iocc = $routeParams.ioc;
				$scope.ioc_type = data.info.main[0].ioc_typeIndicator;

				if (data.info.desc[0].description) {
					var description = data.info.desc[0].description;
					var len = description.length;
					if (len > 400) {
						$scope.desc = description.substr(0,400);
						$scope.$broadcast('iocDesc', description);
					} else {
						$scope.desc = description;
					}
				}
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);

// IOC EVENT ** may be depreciated
angular.module('mean.iochits').controller('IocEventController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query = '/ioc_event?conn_uids='+$routeParams.conn_uids;
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			}
			$scope.data = data;

			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

			$scope.lan_zone = data.info.main[0].lan_zone;
			$scope.lan_ip = data.info.main[0].lan_ip;
			$scope.lan_port = data.info.main[0].lan_port;
			$scope.machine_name = data.info.main[0].machine;
			$scope.packets_recieved = data.info.main[0].out_packets;
			$scope.bytes_received = data.info.main[0].out_bytes;

			$scope.rCountry = data.info.main[0].remote_country;
			if (data.info.main[0].remote_cc){
				$scope.flag = data.info.main[0].remote_cc.toLowerCase();
			}
			$scope.remote_ip = data.info.main[0].remote_ip;
			$scope.remote_port = data.info.main[0].remote_port;
			$scope.in_packets = data.info.main[0].in_packets;
			$scope.in_bytes = data.info.main[0].in_bytes;
			$scope.time = data.info.main[0].time;
			$scope.l7_proto = data.info.main[0].l7_proto;
			$scope.remote_asn = data.info.main[0].remote_asn;
			$scope.remote_asn_name = data.info.main[0].remote_asn_name;

			$scope.ioc = data.info.main[0].ioc;
			$scope.ioc_type = data.info.main[0].ioc_typeIndicator;

			//run description query now
			var query = '/ioc_event?ioc='+data.info.main[0].ioc;
			$http({method: 'GET', url: query}).
			success(function(data) {
				if (data[0].description) {
					var description = data[0].description;
					var len = description.length;
					if (len > 200) {
						$scope.desc = description.substr(0,200);
						$scope.$broadcast('iocDesc', description);
					} else {
						$scope.desc = description;
					}
				}
			});
		});
	$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);

// IOC TOP REMOTE
angular.module('mean.iochits').controller('IocTopRemoteController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/ioc_top_remote?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/ioc_top_remote'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroupPre = barDimension.group();
				var barGroup = barGroupPre.reduce(
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded += v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated += v.count;
						}
						if (v.ioc_severity === 3) {
							p.high += v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe += v.count;
						}
						if (v.ioc_severity === null) {
							p.other += v.count;
						}
						return p;
					},
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded -= v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated -= v.count;
						}
						if (v.ioc_severity === 3) {
							p.high -= v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe -= v.count;
						}
						if (v.ioc_severity === null) {
							p.other -= v.count;
						}
						return p;
					},
					function() {
						return {
							guarded:0,
							elevated:0,
							high:0,
							severe:0,
							other:0
						};
					}
				);
				$scope.$broadcast('barChart', barDimension, barGroup, 'severity');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# IOC / Hour';
				$scope.$broadcast('severityLoad');
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);

// IOC TOP REMOTE 2 LOCAL
angular.module('mean.iochits').controller('IOCremote2LocalController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/ioc_top_remote2local?start='+$routeParams.start+'&end='+$routeParams.end+'&remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		} else {
			query = '/ioc_top_remote2local?remote_ip='+$routeParams.remote_ip+'&ioc='+$routeParams.ioc;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
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
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);

// IOC HITS
angular.module('mean.iochits').controller('IochitsController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', 'socket', function ($scope, Global, $http, $routeParams, $rootScope, socket) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/iochits?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/iochits?'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

				var rowDimension = $scope.crossfilterData.dimension(function(d) { return d.ioc });
				var rowGroupPre = rowDimension.group().reduceSum(function(d) { return d.count });
				var rowGroup = rowGroupPre.reduce(
					function (d, v) {
						//++d.count;
						d.severity = v.ioc_severity - 1;
						d.count += v.count;
						return d;
					},
					/* callback for when data is removed from the current filter results */
					function (d, v) {
						//--d.count;
						d.severity = v.ioc_severity - 1;
						d.count -= v.count;
						return d;
					},
					/* initialize d */
					function () {
						return {count: 0, severity: 0};
					}
				);
				$scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroupPre = barDimension.group();
				var barGroup = barGroupPre.reduce(
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded += v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated += v.count;
						}
						if (v.ioc_severity === 3) {
							p.high += v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe += v.count;
						}
						if (v.ioc_severity === null) {
							p.other += v.count;
						}
						return p;
					},
					function(p, v) {
						if (v.ioc_severity === 1) {
							p.guarded -= v.count;
						}
						if (v.ioc_severity === 2) {
							p.elevated -= v.count;
						}
						if (v.ioc_severity === 3) {
							p.high -= v.count;
						}
						if (v.ioc_severity === 4) {
							p.severe -= v.count;
						}
						if (v.ioc_severity === null) {
							p.other -= v.count;
						}
						return p;
					},
					function() {
						return {
							guarded:0,
							elevated:0,
							high:0,
							severe:0,
							other:0
						};
					}
				);
				$scope.$broadcast('barChart', barDimension, barGroup, 'severity');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# IOC / Hour';
				$scope.$broadcast('severityLoad');
			}
		});
		$rootScope.pageTitle = 'IOC Notifications';

		$http({method: 'GET', url: query+'&type=ioc_notifications'}).
		success(function(data) {
			$scope.ioc_notifications = data[0].count;
		});
		$http({method: 'GET', url: query+'&type=ioc_groups'}).
		success(function(data) {
			$scope.ioc_groups = data;
		});
		$http({method: 'GET', url: query+'&type=local_ips'}).
		success(function(data) {
			$scope.local_ips = data;
		});
		$http({method: 'GET', url: query+'&type=remote_ip'}).
		success(function(data) {
			$scope.remote_ip = data;
		});
		$http({method: 'GET', url: query+'&type=query'}).
		success(function(data) {
			$scope.query = data;
		});
		$http({method: 'GET', url: query+'&type=host'}).
		success(function(data) {
			$scope.hostt = data;
		});
		$http({method: 'GET', url: query+'&type=remote_ip_ssl'}).
		success(function(data) {
			$scope.remote_ip_ssl = data;
		});
		$http({method: 'GET', url: query+'&type=name'}).
		success(function(data) {
			$scope.file_name = data;
		});
		$http({method: 'GET', url: query+'&type=l7_proto'}).
		success(function(data) {
			$scope.l7_proto = data;
		});
		$http({method: 'GET', url: query+'&type=remote_country'}).
		success(function(data) {
			$scope.remote_country = data;
		});
		//////////////////////////////////
		//////////////////////////////////
		$http({method: 'GET', url: query+'&type=bandwidth_in'}).
		success(function(data) {
			$scope.bandwidth_in = data[0].bandwidth+' Kb/s';
		});
		$http({method: 'GET', url: query+'&type=bandwidth_out'}).
		success(function(data) {
			$scope.bandwidth_out = data[0].bandwidth+' Kb/s';
		});
		$http({method: 'GET', url: query+'&type=new_ip'}).
		success(function(data) {
			$scope.new_ip = data;
		});
		$http({method: 'GET', url: query+'&type=new_dns'}).
		success(function(data) {
			$scope.new_dns = data;
		});
		$http({method: 'GET', url: query+'&type=new_http'}).
		success(function(data) {
			$scope.new_http = data;
		});
		$http({method: 'GET', url: query+'&type=new_ssl'}).
		success(function(data) {
			$scope.new_ssl = data;
		});
		$http({method: 'GET', url: query+'&type=new_layer7'}).
		success(function(data) {
			$scope.new_layer7 = data;
		});
		$http({method: 'GET', url: query+'&type=conn_meta'}).
		success(function(data) {
			$scope.conn_meta = data;
		});
		$http({method: 'GET', url: query+'&type=remote_ip_conn_meta'}).
		success(function(data) {
			$scope.remote_ip_conn_meta = data;
		});
		$http({method: 'GET', url: query+'&type=remote_country_conn_meta'}).
		success(function(data) {
			$scope.remote_country_conn_meta = data;
		});
	};
	$rootScope.rootpage = true;
}]);

// IOC HITS REPORT
angular.module('mean.iochits').controller('IochitsREPORTController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/iochits?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/iochits'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
			var rowDimension = $scope.crossfilterData.dimension(function(d) { return d.ioc });
			var rowGroupPre = rowDimension.group().reduceSum(function(d) { return d.count });
			var rowGroup = rowGroupPre.reduce(
				function (d, v) {
					//++d.count;
					d.severity = v.ioc_severity - 1;
					d.count += v.count;
					return d;
				},
				/* callback for when data is removed from the current filter results */
				function (d, v) {
					//--d.count;
					d.severity = v.ioc_severity - 1;
					d.count -= v.count;
					return d;
				},
				/* initialize d */
				function () {
					return {count: 0, severity: 0};
				}
			);
			$scope.$broadcast('rowChart', rowDimension, rowGroup, 'severity');
			var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
			var geoGroup = geoDimension.group().reduceSum(function (d) {
				return d.count;
			});
			$scope.$broadcast('geoChart', geoDimension, geoGroup);
			var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
			var barGroupPre = barDimension.group();
			var barGroup = barGroupPre.reduce(
				function(p, v) {
					if (v.ioc_severity === 1) {
						p.guarded += v.count;
					}
					if (v.ioc_severity === 2) {
						p.elevated += v.count;
					}
					if (v.ioc_severity === 3) {
						p.high += v.count;
					}
					if (v.ioc_severity === 4) {
						p.severe += v.count;
					}
					if (v.ioc_severity === null) {
						p.other += v.count;
					}
					return p;
				},
				function(p, v) {
					if (v.ioc_severity === 1) {
						p.guarded -= v.count;
					}
					if (v.ioc_severity === 2) {
						p.elevated -= v.count;
					}
					if (v.ioc_severity === 3) {
						p.high -= v.count;
					}
					if (v.ioc_severity === 4) {
						p.severe -= v.count;
					}
					if (v.ioc_severity === null) {
						p.other -= v.count;
					}
					return p;
				},
				function() {
					return {
						guarded:0,
						elevated:0,
						high:0,
						severe:0,
						other:0
					};
				}
			);
			$scope.$broadcast('barChart', barDimension, barGroup, 'severity');
			$scope.barChartxAxis = '';
			$scope.barChartyAxis = '# IOC / Hour';
		});
		$rootScope.pageTitle = 'IOC Notifications';
	};
	$rootScope.rootpage = true;
}]);

// LAYER 7
angular.module('mean.iochits').controller('l7Controller', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/l7?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/l7'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');

				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Layer 7 Protocols'
	};
	$rootScope.rootpage = true;
}]);

// LAYER 7 DRILL
angular.module('mean.iochits').controller('l7DrillController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/l7_drill?start='+$routeParams.start+'&end='+$routeParams.end+'&l7_proto='+$routeParams.l7_proto;
		} else {
			query = '/l7_drill?l7_proto='+$routeParams.l7_proto;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');

				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Layer 7 Protocols'
	};
	$rootScope.rootpage = true;
}]);

// LAYER 7 LOCAL
angular.module('mean.iochits').controller('l7LocalController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/l7_local?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_ip='+$routeParams.lan_ip+'&l7_proto='+$routeParams.l7_proto;
		} else {
			query = '/l7_local?lan_ip='+$routeParams.lan_ip+'&l7_proto='+$routeParams.l7_proto;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');

				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Layer 7 Protocols'
	};
	$rootScope.rootpage = true;
}]);

// LOCAL DRILL
angular.module('mean.iochits').controller('localDrillController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', 'socket', function ($scope, Global, $http, $routeParams, $rootScope, socket) {
	$scope.global = Global;
	$scope.socket = socket;

	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/local_drill?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/local_drill'
		}
		$scope.socket.emit('test', {});
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			console.log(data);
			// var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			// data.crossfilter.forEach(function(d) {
			// 	d.dd = dateFormat.parse(d.time);
			// 	d.hour = d3.time.hour(d.dd);
			// 	d.count = +d.count;
			// });
			// $scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			$scope.$broadcast('swimChart', data.swimchart);

			// if (data.tables === null) {
			// 	$scope.$broadcast('loadError');
			// }
		});

		//Broadcast swimchart and have it setup the inital socket connection

		// $scope.$broadcast('swimChart');
		$rootScope.pageTitle = 'SET TITLE';
	};
	$rootScope.rootpage = true;
}]);

// NEW DNS QUERY
angular.module('mean.iochits').controller('NewDnsQueryController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/new_dns_query?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/new_dns_query'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');
					$scope.barChartxAxis = '';
					$scope.barChartyAxis = '# New DNS Queries / Hour';
			}
		});
		$rootScope.pageTitle = 'New DNS Queries Detected';
	};
	$rootScope.rootpage = true;
}]);

// NEW HTTP HOSTS
angular.module('mean.iochits').controller('NewHttpHostController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/new_http_hosts?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/new_http_hosts'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# New Domains / Hour';
			}
		});
		$rootScope.pageTitle = 'New HTTP Domains Detected';
	};
	$rootScope.rootpage = true;
}]);

// NEW REMOTE IP
angular.module('mean.iochits').controller('NewRemoteIpController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/new_remote_ip?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/new_remote_ip'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');
					$scope.barChartxAxis = '';
					$scope.barChartyAxis = '# New IP / Hour';
			}
		});
		$rootScope.pageTitle = 'New Remote IPs Detected';
	};
	$rootScope.rootpage = true;
}]);

// NEW SSL HOSTS
angular.module('mean.iochits').controller('NewSslHostController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/new_ssl_hosts?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/new_ssl_hosts'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# New IP / Hour';
			}
		});
		$rootScope.pageTitle = 'New Remote IP Detected Serving SSL Traffic'
	};
	$rootScope.rootpage = true;
}]);

// TOP LOCAL
angular.module('mean.iochits').controller('topLocalController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/top_local?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/top_local'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Local IP Addresses'
	};
	$rootScope.rootpage = true;
}]);

// TOP REMOTE
angular.module('mean.iochits').controller('topRemoteController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/top_remote?start='+$routeParams.start+'&end='+$routeParams.end;
		} else {
			query = '/top_remote'
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var geoDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
				var geoGroup = geoDimension.group().reduceSum(function (d) {
					return d.count;
				});
				$scope.$broadcast('geoChart', geoDimension, geoGroup);
				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage of Remote IP Addresses'
	};
	$rootScope.rootpage = true;
}]);

// TOP REMOTE 2 LOCAL
angular.module('mean.iochits').controller('remote2LocalController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/top_remote2local?start='+$routeParams.start+'&end='+$routeParams.end+'&remote_ip='+$routeParams.remote_ip;
		} else {
			query = '/top_remote2local?remote_ip='+$routeParams.remote_ip;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage Between Local and Remote IP Addresses'
	};
	$rootScope.rootpage = true;
}]);

// TOP LOCAL TO REMOTE
angular.module('mean.iochits').controller('local2remoteController', ['$scope', 'Global', '$http', '$routeParams', '$rootScope', function ($scope, Global, $http, $routeParams, $rootScope) {
	$scope.global = Global;
	$scope.onPageLoad = function() {
		var query;
		if ($routeParams.start && $routeParams.end) {
			query = '/top_local2remote?start='+$routeParams.start+'&end='+$routeParams.end+'&lan_zone='+$routeParams.lan_zone+'&lan_ip='+$routeParams.lan_ip;
		} else {
			query = '/top_local2remote?lan_zone='+$routeParams.lan_zone+'&lan_ip='+$routeParams.lan_ip;
		}
		$http({method: 'GET', url: query}).
		//success(function(data, status, headers, config) {
		success(function(data) {
			if (data.tables[0] === null) {
				$scope.$broadcast('loadError');
			} else {
				var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
				data.crossfilter.forEach(function(d) {
					d.dd = dateFormat.parse(d.time);
					d.hour = d3.time.hour(d.dd);
					d.count = +d.count;
				});
				$scope.crossfilterData = crossfilter(data.crossfilter);
				$scope.data = data;

				var barDimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var barGroup = barDimension.group().reduceSum(function(d) { return d.count });
				$scope.$broadcast('barChart', barDimension, barGroup, 'bar');

				$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
				$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
				$scope.$broadcast('tableLoad', $scope.tableData, $scope.data.tables, null);
				$scope.barChartxAxis = '';
				$scope.barChartyAxis = '# MB / Hour';
			}
		});
		$rootScope.pageTitle = 'Bandwidth Usage Between Local and Remote IP Addresses'
	};
	$rootScope.rootpage = true;
}]);

