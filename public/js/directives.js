'use strict';

angular.module('mean.system').directive('pageHead', function() {
	return {
		restrict: 'A',
		scope : {
		title : '@'
	},
		templateUrl : '/views/pagehead.html',
		transclude : true
	};
});

// angular.module('mean.system').directive('loadingSpinner', function() {
// 	return {
// 		link: function(scope, element, attrs) {
// 			var opts = {
// 				lines: 13, // The number of lines to draw
// 				length: 21, // The length of each line
// 				width: 12, // The line thickness
// 				radius: 30, // The radius of the inner circle
// 				corners: 1, // Corner roundness (0..1)
// 				rotate: 90, // The rotation offset
// 				direction: 1, // 1: clockwise, -1: counterclockwise
// 				color: '#000', // #rgb or #rrggbb or array of colors
// 				speed: 1.2, // Rounds per second
// 				trail: 60, // Afterglow percentage
// 				shadow: false, // Whether to render a shadow
// 				hwaccel: false, // Whether to use hardware acceleration
// 				className: 'spinner', // The CSS class to assign to the spinner
// 				zIndex: 2e9, // The z-index (defaults to 2000000000)
// 				top: 'auto', // Top position relative to parent in px
// 				left: 'auto' // Left position relative to parent in px
// 			};
// 			var target = document.getElementById('foo');
// 			var spinner = new Spinner(opts).spin(element);
// 		}
// 	};
// });

angular.module('mean.system').directive('sidebar', function() {
	return {
		link: function ($scope, element, attrs) {
			var floating_logo = function() {
				var viewPort = $(window).height();
				var sidebarHeight = $('.page-sidebar').height() + 180;
				if (viewPort < sidebarHeight) {
					$('#footimg').css({ display: 'none' });
				}
				else {
					$('#footimg').css({ position: 'fixed', bottom: 30, display: '' });
				}
			};
			floating_logo();
			$(window).scroll(function() {
				$('.page-sidebar').css({ position: 'fixed' });
			});
			// BOTTOM LEFT LOGO VISIBILITY
			$('.page-sidebar li a').click(function() {
				setTimeout(function() {
					floating_logo();
				}, 150);
			});
			$(window).bind("resize", function() {
				floating_logo();
			});
			// sidebar memory
			if (!localStorage.getItem('sidebar')) {
				localStorage.setItem('sidebar', 0);
			}
			if (localStorage.getItem('sidebar') === '0') { // keep sidebar consistent between pages
				var body = $('body');
				var sidebar = $('.page-sidebar');
				$(".sidebar-search", sidebar).removeClass("open");
				if (body.hasClass("page-sidebar-closed")) {
					body.removeClass("page-sidebar-closed");
					if (body.hasClass('page-sidebar-fixed')) {
						sidebar.css('width', '');
					}
				}
				else {
					body.addClass("page-sidebar-closed");
				}
			}
			App.init();
		}
	};
});

angular.module('mean.system').directive('severityLevels', ['$timeout', function ($timeout) {
	return {
		link: function ($scope, element, attrs) {
			function updateSevCounts(sevcounts) {
				$("#severity").children().addClass("severity-deselect");
				for (var s in sevcounts) {
					if (sevcounts[s].value === 0) {
						$('#al'+sevcounts[s].key).html(' '+sevcounts[s].value+' ');
						$('.alert'+sevcounts[s].key).addClass("severity-deselect");
					} else {
						$('#al'+sevcounts[s].key).html(' '+sevcounts[s].value+' ');
						$('.alert'+sevcounts[s].key).removeClass("severity-deselect");
					}
				}
			}
			$scope.$on('severityLoad', function () {
				//$scope.$watch('sevcounts', updateSevCounts(), true);
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert1 alert"><i class="fa fa-flag"></i> GUARDED -<span id="al1" style="font-weight:bold"> 0 </span></button>');
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert2 alert"><i class="fa fa-bullhorn"></i> ELEVATED -<span id="al2" style="font-weight:bold"> 0 </span></button>');
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert3 alert"><i class="fa fa-bell"></i> HIGH -<span id="al3" style="font-weight:bold"> 0 </span></button>');
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert4 alert"><i class="fa fa-exclamation-circle"></i> SEVERE -<span id="al4" style="font-weight:bold"> 0 </span></button>');
				$scope.sevcounts = $scope.crossfilterData.dimension(function(d){return d.ioc_severity;}).group().reduceSum(function(d) {return d.count;}).top(Infinity);
				updateSevCounts($scope.sevcounts);
			})
			$scope.$on('severityUpdate', function () {
				updateSevCounts($scope.sevcounts);
			})
		}
	};
}]);

angular.module('mean.system').directive('datePicker', ['$timeout', '$location', '$rootScope', function ($timeout, $location, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$timeout(function () {
				$('#reportrange').daterangepicker(
					{
					ranges: {
						'Today': [moment().startOf('day'), moment()],
						'Yesterday': [moment().subtract('days', 1).startOf('day'), moment().subtract('days', 1).endOf('day')],
						'Last 7 Days': [moment().subtract('days', 6), moment()],
						'Last 30 Days': [moment().subtract('days', 29), moment()],
						'This Month': [moment().startOf('month'), moment().endOf('month')],
						'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
					},
						startDate: $scope.start,
						endDate: $scope.end
					},
					function(start, end) {
						// $rootScope.start = $scope.global.startTime;
						// console.log(start);
						// console.log($rootScope.start);
						$('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
					}
				);
				$('#reportrange').on('apply', function(ev, picker) {
					// some kind of clear option is needed here
					$scope.$apply($location.search({'start': moment(picker.startDate.format('YYYY-MM-DD')).unix(), 'end':moment(picker.endDate.format('YYYY-MM-DD')).unix()}));
				});
			}, 0, false);
		}
	};
}]);

angular.module('mean.system').directive('makeTable', ['$timeout', '$location', '$routeParams', '$rootScope', function ($timeout, $location, $routeParams, $rootScope) {
	return {
		link: function ($scope, element, attrs) {

			$scope.$on('tableLoad', function (event) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					$(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table" ></table>');
					$('#table').dataTable({
						"aaData": $scope.data.tables[0].aaData,
						"aoColumns": $scope.data.tables[0].params,
						"bDeferRender": true,
						//"bDestroy": true,
						//"bProcessing": true,
						//"bRebuild": true,
						//"aaSorting": true,
						//"bFilter": true,
						//"bPaginate": true,
						"sDom": '<"clear"C>T<"clear">lr<"table_overflow"t>ip',
						"iDisplayLength": 50,
						 "fnPreDrawCallback": function( oSettings ) {
						 	//console.log(oSettings.aoColumns);
							$scope.r = [], $scope.e = [];
							for (var a in oSettings.aoColumns) {
								// find the index of column rows so they can me modified below
								if (oSettings.aoColumns[a].bVisible === true) {
									$scope.r.push(oSettings.aoColumns[a].mData);
								}
								// push unique to link builder
								if (oSettings.aoColumns[a].link) {
									$scope.e.push(oSettings.aoColumns[a]);
								}
							}
						},
						"fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
							if (aData.remote_cc) {
								$('td:eq('+$scope.r.indexOf("remote_cc")+')', nRow).html('<div class="f32"><span class="flag '+aData.remote_cc.toLowerCase()+'"></span></div>');
							}
							if (aData.ioc_severity) {
								var rIndex = $scope.r.indexOf("ioc_severity");
								switch(aData.ioc_severity) {
									case 1:
										$('td:eq('+rIndex+')', nRow).html('<span class="aTable'+aData.ioc_severity+' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-flag fa-stack-1x fa-inverse"></i></span>');
										break;
									case 2:
										$('td:eq('+rIndex+')', nRow).html('<span class="aTable'+aData.ioc_severity+' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-bullhorn fa-stack-1x fa-inverse"></i></span>');
										break;
									case 3:
										$('td:eq('+rIndex+')', nRow).html('<span class="aTable'+aData.ioc_severity+' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-bell fa-stack-1x fa-inverse"></i></span>');
										break;
									case 4:
										$('td:eq('+rIndex+')', nRow).html('<span class="aTable'+aData.ioc_severity+' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-exclamation-circle fa-stack-1x fa-inverse"></i></span>');
										break;
								}
							}
							// url builder
							for (var c in $scope.e) {
								var links = function() {
									// var arr = [];
									var type = $scope.e[c].link.type;
									var obj = new Object();
									for (var l in $scope.e[c].link.val) {
										obj[$scope.e[c].link.val[l]] = aData[$scope.e[c].link.val[l]];
									}
									return JSON.stringify({
										type: $scope.e[c].link.type,
										objlink: obj
									});
								}
								$('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='btn btn-link' type='button' value='"+links()+"' href=''>"+aData[$scope.e[c].mData]+"</button>");
							}
						},
						"fnDrawCallback": function( oSettings ) {
							$('table button').click(function(){
								var link = JSON.parse(this.value);
								if ($routeParams.start && $routeParams.end) {
									link.objlink.start = $routeParams.start;
									link.objlink.end = $routeParams.end;
								}
								$scope.$apply($location.path(link.type).search(link.objlink));
							});
							$scope.country = [];
							$scope.ioc = [];
							$scope.severity = [];
							for (var d in oSettings.aiDisplay) {
								$scope.country.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.remote_country);
								$scope.ioc.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.ioc);
								$scope.severity.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.ioc_severity);
							}
							$scope.$broadcast('severityUpdate');
							// dc.redrawAll();
						}
					});

					var cfFilterDim = $scope.crossfilterData.dimension(function(d){ return d});
					$scope.$on('crossfilterToTable', function () {
						cfFilterDim.filterAll();
						var arr = [];
						$scope.data.tables[0].aaData.forEach(function(d){
							for (var i in cfFilterDim.top(Infinity)) {
								if (d.time === cfFilterDim.top(Infinity)[i].time) {
									arr.push(d);
								}
							}
						});
						$('#table').dataTable().fnClearTable();
						$('#table').dataTable().fnAddData(arr);
						$('#table').dataTable().fnDraw();
					});

					$rootScope.$watch('search', function(){
						$('#table').dataTable().fnFilter($rootScope.search);
					});
				}, 0, false);
			})
		}
	};
}]);

angular.module('mean.system').directive('makeSevChart', ['$timeout', '$window', '$rootScope', function ($timeout, $window, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('sevChart', function () {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					//var arr = $scope.data.tables[0].aaData;
					var dimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
					var group = dimension.group();
					$scope.sevChart = dc.barChart('#sevchart');
					var connVsTime = group.reduce(
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
					//var start = 1375070400;
					//var end = 1391230740;
					//var width = $("#"+divID).width();
					//var hHeight;
					//if(height !== undefined) {
					//	hHeight = height;
					//} else {
					//	hHeight = width/3.3; //4.6 as default
					//}
					//console.log($(element).width());
					var width = $('#sevchart').parent().width();
					var height = width/3.5;
					$scope.sevChart
						.width(width) // (optional) define chart width, :default = 200
						.height(height)
						.transitionDuration(500) // (optional) define chart transition duration, :default = 500
						.margins({top: 10, right: 30, bottom: 25, left: 43}) // (optional) define margins
						.dimension(dimension) // set dimension
						//.group(group[g]) // set group
						.group(connVsTime, "(1) Guarded")
						.valueAccessor(function(d) {
							return d.value.guarded;
						})
						.stack(connVsTime, "(2) Elevated", function(d){return d.value.elevated;})
						.stack(connVsTime, "(3) High", function(d){return d.value.high;})
						.stack(connVsTime, "(4) Severe", function(d){return d.value.severe;})
						//.stack(connVsTime, "0 - Other", function(d){return d.value.other;})
						.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"])
						.xAxisLabel('tejest') // (optional) render an axis label below the x axis
						.yAxisLabel('teest') // (optional) render a vertical axis lable left of the y axis
						.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
						.elasticX(true) // (optional) whether chart should rescale x axis to fit data, :default = false
						.x(d3.time.scale().domain([moment.unix($scope.global.startTime-100000), moment.unix($scope.global.endTime+100000)])) // define x scale
						.xUnits(d3.time.hours) // define x axis units
						.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
						.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
						.on("filtered", function(chart, filter){
							$scope.$broadcast('crossfilterToTable');
						})
						//.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
						.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
						.renderTitle(true); // (optional) whether chart should render titles, :default = fal
						$scope.sevChart.render();

						$scope.sevWidth = function() {
						return $('#sevchart').parent().width();
						}
						var waitForFinalEvent = (function () {
							var timers = {};
							return function (callback, ms, uniqueId) {
								if (!uniqueId) {
									uniqueId = "sevchartWait"; //Don't call this twice without a uniqueId
								}
								if (timers[uniqueId]) {
									clearTimeout (timers[uniqueId]);
								}
							timers[uniqueId] = setTimeout(callback, ms);
							};
						})();
						var setNewSize = function(width) {
							$scope.sevChart
								.width(width)
								.height(width/3.5)
								.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
							$(element).height(width/3.5);
							d3.select('#sevchart svg').attr('width', width).attr('height', width/3.5);
							$scope.sevChart.redraw();
						}
						$(window).resize(function () {
							waitForFinalEvent(function(){
								$scope.sevChart.render();
							}, 200, "sevchartresize");
						});
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.sevWidth())
							}, 150);
						});
						$rootScope.$watch('search', function(){
							$scope.sevChart.redraw();
						});
				}, 0, false);
			})
		}
	};
}]);

angular.module('mean.system').directive('makeRowChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('rowChart', function () {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					var dimension = $scope.crossfilterData.dimension(function(d) { return d.ioc });
					var group = dimension.group().reduceSum(function(d) { return d.count });
					var rowcount = dimension.group().reduceSum(function(d) {return d.count;}).top(Infinity);
					var hHeight, lOffset;
					var count = rowcount.length; ///CHANGE THIS to count return rows
					if (count < 7) {
						lOffset = 17+(count*0.2);
						hHeight = 25+(count*35);
					}
					else if (count >= 7) {
						lOffset = 12.7+(count*0.2);
						hHeight = 25+(count*28);
					}
					var fill;
					var width = $('#rowchart').width();
					$scope.rowChart = dc.rowChart('#rowchart');
					var sevCount = group.reduce(
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
					});
					var tops = sevCount.order(function (p) {return p.count;}).top(1);
					var numberFormat = d3.format(",f");
					function logFormat(d) {
						var x = Math.log(d) / Math.log(10) + 1e-6;
						return Math.abs(x - Math.floor(x)) < 0.3 ? numberFormat(d) : "";
					}
					$scope.rowChart
					.width(width)
						//.height(width/2 + barExpand)
						.height(hHeight)
						.margins({top: 5, left: 0, right: 0, bottom: 20})
						.group(sevCount)
						.dimension(dimension)
						.colors(["#377FC7","#F5D800","#F88B12","#DD122A"])
						.valueAccessor(function(d) {
							return d.value.count+0.1;
						})
						.colorAccessor(function (d){return d.value.severity;})
						.renderLabel(true)
						.on("filtered", function(chart, filter){
							$scope.$broadcast('crossfilterToTable');
						})
						.label(function(d) { return d.key+' ('+d.value.count+')'; })
						.labelOffsetY(lOffset) //lOffset
						.elasticX(false)
						.x(d3.scale.log().domain([1, tops[0].value.count+0.1]).range([0,500])) //500 ->width
						.xAxis()
						.scale($scope.rowChart.x())
						.tickFormat(logFormat);

						$scope.rowChart.render();

						var rowFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
						$rootScope.$watch('search', function(){
							if($rootScope.search === '') {
								rowFilterDimension.filterAll();
							} else {
								rowFilterDimension.filterAll();
								if ($scope.country.length > 0) {
									rowFilterDimension.filter(function(d) { return $scope.country.indexOf(d) >= 0; });
								}
							}
							$scope.rowChart.redraw();
						});

				}, 0, false);
			});
		}
	}
}]);

angular.module('mean.system').directive('makeGeoChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('geoChart', function (event) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					$scope.geoChart = dc.geoChoroplethChart('#geochart');
					var numberFormat = d3.format(".2f");
					//var dimension = crossfilterData.dimension(function(d){ return d.remote_country;});
					var dimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
					var group = dimension.group().reduceSum(function (d) {
						return d.count;
					});
					var top = group.orderNatural(function (p) {return p.count;}).top(1);
					var numberOfItems = top[0].value+1;
					var rainbow = new Rainbow();
					rainbow.setNumberRange(0, numberOfItems);
					rainbow.setSpectrum("#FF0000", "#CC0000", "#990000", "#660000", "#360000");
					var cc = [];
					for (var i = 1; i <= numberOfItems; i++) {
						var hexColour = rainbow.colourAt(i);
						cc.push('#' + hexColour);
					}
					//var minhits = function (d) { return d.value.min; };
					//var maxhits = function (d) { return d.value.max; };
					function MapCallbackFunction(context)
					{
						var cb = function(error, world) {
							var width = $('#geochart').parent().width();
							var height = width/1.4;
							$scope.geoChart
							.dimension(dimension)
							.group(group)
							.projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 2 / Math.PI).translate([width / 2, width / 2]))
							.width(width)
							.height(height)
							.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"])
							.colors(cc)
							.colorCalculator(function (d) { return d ? $scope.geoChart.colors()(d) : '#ccc'; })
							.overlayGeoJson(world.features, "country", function(d) {
								return d.properties.name;
							})
							.on("filtered", function(chart, filter){
								$scope.$broadcast('crossfilterToTable');
							});
							//.title(function (d) {
							//	return d.key+": "+(d.value ? d.value : 0);
							//});
							//dc.renderAll();
							$scope.geoChart.render();
						}
						return cb;
					}
					d3.json("../../../world.json", MapCallbackFunction(this));

					$scope.geoWidth = function() {
						return $('#geochart').parent().width();
					}

					var setNewSize = function(width) {
						$scope.geoChart
							.width(width)
							.height(width/3.3)
							.projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 2 / Math.PI).translate([width / 2, width / 2]));
							$(element).height(width/1.4);
							d3.select('#geochart svg').attr('width', width).attr('height', width/1.4);
							$scope.geoChart.redraw();
					}

					$(window).bind('resize', function() {
						setTimeout(function(){
							setNewSize($scope.geoWidth());
						}, 150);
					});

					var geoFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
					$rootScope.$watch('search', function(){
						if($rootScope.search === '') {
								geoFilterDimension.filterAll();
							} else {
								geoFilterDimension.filterAll();
								if ($scope.country.length > 0) {
									geoFilterDimension.filter(function(d) { return $scope.country.indexOf(d) >= 0; });
								}
							}
						$scope.geoChart.redraw();
					});

				}, 0, false);
			})
		}
	};
}]);

angular.module('mean.system').directive('makeBarChart', ['$timeout', function ($timeout) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('barChart', function (event, start, end) {
				var dimension = $scope.cf_data.dimension(function(d) { return d.hour });
				var group = dimension.group().reduceSum(function(d) { return d.count });
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					var barChart = dc.barChart('#barchart');
					barChart
						.width(500) // (optional) define chart width, :default = 200
						.height(200)
						.transitionDuration(500) // (optional) define chart transition duration, :default = 500
						.margins({top: 10, right: 50, bottom: 40, left: 60}) // (optional) define margins
						.dimension(dimension) // set dimension
						//.group(group) // set group
						.group(group)
						.colors(["#193459"])
						.xAxisLabel('test') // (optional) render an axis label below the x axis
						.yAxisLabel('test') // (optional) render a vertical axis lable left of the y axis
						.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
						.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
						.x(d3.time.scale().domain([moment.unix(start), moment.unix(end)])) // define x scale
						.xUnits(d3.time.hours) // define x axis units
						.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
						.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
						.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
						//.title(function (d) { return ""; })
						//.legend(dc.legend().x(250).y(10))
						.renderTitle(true); // (optional) whether chart should render titles, :default = false

						barChart.render();
					}, 0, false);
			})
		}
	};
}]);