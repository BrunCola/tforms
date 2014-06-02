angular.module('mean.system').controller('archiveController', ['$scope', 'Global', '$http', '$rootScope', 'socket', '$location', function ($scope, Global, $http, $rootScope, socket, $location) {
	$scope.global = Global;
	$scope.socket = socket;
	var query;
	if ($location.$$search.start && $location.$$search.end) {
		query = '/archive?start='+$location.$$search.start+'&end='+$location.$$search.end;
	} else {
		query = '/archive'
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
			$scope.emptyArchive = function() {
				var r = confirm("Are you sure?");
				if (r === true) {
					$scope.socket.emit('emptyArchive', {database: window.user.database});
					$scope.socket.on('emptyArchiveConfirm', function(){
						$route.reload();
					})
				}
			}
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
		}
	});
	$rootScope.rootpage = true;
}]);