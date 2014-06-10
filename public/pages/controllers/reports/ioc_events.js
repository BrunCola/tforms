'use strict';

angular.module('mean.pages').controller('iocEventsReportController', ['$scope', '$stateParams', '$location', 'Global', '$rootScope', '$http', function ($scope, $stateParams, $location, Global, $rootScope, $http) {
	$scope.global = Global;
	var query;
	if ($location.$$search.database){
		query = '/reports/ioc_events?start='+$location.$$search.start+'&end='+$location.$$search.end+'&database='+$location.$$search.database;
	} else if ($location.$$search.start && $location.$$search.end) {
		query = '/reports/ioc_events?start='+$location.$$search.start+'&end='+$location.$$search.end;
	} else {
		query = '/reports/ioc_events?';
	}
	$http({method: 'GET', url: query}).
	//success(function(data, status, headers, config) {
	success(function(data) {
		if (data.tables[2] === null) {
			$scope.nodata = true;
			$scope.data = data;
			$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			$scope.tempArr = [];
			$scope.data.tables[0].pagebreakBefore = false;
			$scope.tempArr.push($scope.data.tables[0]);
			$scope.$broadcast('tableLoad', $scope.tableData, $scope.tempArr, null);
			// $scope.$broadcast('tableLoad', $scope.data.tables[0], $scope.data.tables[0], null);
		} else {
			$scope.somedata = true;
			var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
			data.crossfilter.forEach(function(d) {
				d.dd = dateFormat.parse(d.time);
				d.hour = d3.time.hour(d.dd);
				d.count = +d.count;
			});
			$scope.crossfilterData = crossfilter(data.crossfilter);
			$scope.data = data;

			// $scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
			// $scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
			// $scope.$broadcast('tableLoad', $scope.data.tables, $scope.data.tables, null);
			$scope.$broadcast('tableLoad', null, $scope.data.tables, 'drill');
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
			// console.log(rowGroup.top(Infinity))
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
			$scope.severityDim = $scope.crossfilterData.dimension(function(d){return d.ioc_severity;});
			$scope.sevcounts = $scope.severityDim.group().reduceSum(function(d) {return d.count;}).top(Infinity);
			for (var n in $scope.sevcounts) {
				if ($scope.sevcounts[n].key === 1) {
					$scope.sev1 = $scope.sevcounts[n].value;
				}
				if ($scope.sevcounts[n].key === 2) {
					$scope.sev2 = $scope.sevcounts[n].value;
				}
				if ($scope.sevcounts[n].key === 3) {
					$scope.sev3 = $scope.sevcounts[n].value;
				}
				if ($scope.sevcounts[n].key === 4) {
					$scope.sev4 = $scope.sevcounts[n].value;
				}
			}
			// var glossary = [];
			// var glossArr = rowGroup.top(Infinity);
			// for (var n in glossArr) {
			// 	// $scope.test = glossArr[n].key;
			// 	$http({method: 'GET', url: query+'&type=glossary&iocType='+glossArr[n].key}).
			// 	success(function(data) {
			// 		if (data.desc[0] !== undefined) {
			// 			glossary.push({
			// 				title: data.title,
			// 				description: data.desc[0].description
			// 			});
			// 			$scope.glossary = glossary;
			// 		}
			// 	});
			// }
		}
	});

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
}]);