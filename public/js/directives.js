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

angular.module('mean.system').directive('pageTitle', ['$rootScope', function ($rootScope) {
	return {
		link: function($scope, element, attrs) {
			$(element).html($rootScope.pageTitle);
		}
	};
}]);

angular.module('mean.system').directive('iocDesc', function() {
	return {
		link: function($scope, element, attrs) {
			$scope.$on('iocDesc', function (event, description) {
				$(element).html('... <a href="javascript:void(0);"><strong>Read More</strong></a>');
				$(element).on('click', function(){
					$.colorbox({html: '<span style="margin: 20px">'+description+'</span>', width:500});
				})
			});
		}
	};
});

angular.module('mean.system').directive('loadingError', function() {
	return {
		link: function($scope, element, attrs) {
			$scope.$on('loadError', function (event) {
				noty({
					layout: 'top',
					theme: 'defaultTheme',
					type: 'error',
					text: 'Sorry, no results were returned.',
					dismissQueue: false, // If you want to use queue feature set this true
					animation: {
						open: { height: 'toggle' },
						close: { height: 'toggle' },
						easing: 'swing',
						speed: 500 // opening & closing animation speed
					},
					timeout: 1000 // delay for closing event. Set false for sticky notifications
				});
			});
		}
	};
});

angular.module('mean.system').directive('newNotification', function() {
	return {
		link: function($scope, element, attrs) {
			$scope.$on('newNoty', function (event, ioc) {
				noty({
					layout: 'bottomLeft',
					theme: 'defaultTheme',
					type: 'information',
					text: 'Incoming flagged host: '+ioc,
					maxVisible: 1,
					dismissQueue: true, // If you want to use queue feature set this true
					animation: {
						open: { height: 'toggle' },
						close: { height: 'toggle' },
						easing: 'swing',
						speed: 500 // opening & closing animation speed
					},
					timeout: 5000 // delay for closing event. Set false for sticky notifications
				});
			});
		}
	};
});

angular.module('mean.system').directive('loadingSpinner', function() {
	return {
		link: function($scope, element, attrs) {
			$('.page-content').fadeTo(500, 0.7);
			var opts = {
				lines: 11, // The number of lines to draw
				length: 21, // The length of each line
				width: 8, // The line thickness
				radius: 14, // The radius of the inner circle
				corners: 1, // Corner roundness (0..1)
				rotate: 0, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				color: '#000', // #rgb or #rrggbb or array of colors
				speed: 1.2, // Rounds per second
				trail: 57, // Afterglow percentage
				shadow: false, // Whether to render a shadow
				hwaccel: false, // Whether to use hardware acceleration
				className: 'spinner', // The CSS class to assign to the spinner
				zIndex: 2e9, // The z-index (defaults to 2000000000)
				top: 'auto', // Top position relative to parent in px
				left: 'auto' // Left position relative to parent in px
			};
			var target = document.getElementById('loading-spinner');
			var spinner = new Spinner(opts).spin(target);
			$(target).data('spinner', spinner);
			$scope.$on('spinnerHide', function (event) {
				$('#loading-spinner').data('spinner').stop();
				$('html, body').animate({scrollTop:0}, 'slow');
				$(".page-content").fadeTo(500, 1);
			});
		}
	};
});

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
				localStorage.setItem('sidebar', 1);
			}
			if (localStorage.getItem('sidebar') == 0) { // keep sidebar consistent between pages
				var body = $('body');
				var sidebar = $('.page-sidebar');
				$('.sidebar-search', sidebar).removeClass('open');
				body.addClass('page-sidebar-closed');
			} else {
				var body = $('body');
				var sidebar = $('.page-sidebar');
				body.removeClass('page-sidebar-closed');
				sidebar.css('width', '');
			}
			App.init();
		}
	};
});

angular.module('mean.system').directive('severityLevels', ['$timeout', function ($timeout) {
	return {
		link: function ($scope, element, attrs) {
			$('.alert').on('click',function(){
				alert('test');
			});
			function updateSevCounts(sevcounts) {
				$('#severity').children().addClass('severity-deselect');
				for (var s in sevcounts) {
					if (sevcounts[s].value === 0) {
						$('#al'+sevcounts[s].key).html(' '+sevcounts[s].value+' ');
						$('.alert'+sevcounts[s].key).addClass('severity-deselect');
					} else {
						$('#al'+sevcounts[s].key).html(' '+sevcounts[s].value+' ');
						$('.alert'+sevcounts[s].key).removeClass('severity-deselect');
					}
				}
			}

			$scope.$on('severityLoad', function () {
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert1 alert"><i class="fa fa-flag"></i> GUARDED -<span id="al1" style="font-weight:bold"> 0 </span></button>');
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert2 alert"><i class="fa fa-bullhorn"></i> ELEVATED -<span id="al2" style="font-weight:bold"> 0 </span></button>');
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert3 alert"><i class="fa fa-bell"></i> HIGH -<span id="al3" style="font-weight:bold"> 0 </span></button>');
				$('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert4 alert"><i class="fa fa-exclamation-circle"></i> SEVERE -<span id="al4" style="font-weight:bold"> 0 </span></button>');
				$scope.severityDim = $scope.crossfilterData.dimension(function(d){return d.ioc_severity;});
				$scope.sevcounts = $scope.severityDim.group().reduceSum(function(d) {return d.count;}).top(Infinity);
				updateSevCounts($scope.sevcounts);
				$('.alert1').on('click',function(){
					$scope.severityDim.filterAll();
					var arr = [];
					if ($('.alert1').hasClass('selected')) {
						$('.alert1').removeClass('selected');
					} else {
						for(var i in $scope.severityDim.top(Infinity)) {
							if ($scope.severityDim.top(Infinity)[i].ioc_severity === 1) {
								arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
							}
						}
						$scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
						$('.alert1').addClass('selected');
					}
					$scope.$broadcast('crossfilterToTable');
					dc.redrawAll();
					updateSevCounts($scope.sevcounts);
				});
				$('.alert2').on('click',function(){
					$scope.severityDim.filterAll();
					var arr = [];
					if ($('.alert2').hasClass('selected')) {
						$('.alert2').removeClass('selected');
					} else {
						for(var i in $scope.severityDim.top(Infinity)) {
							if ($scope.severityDim.top(Infinity)[i].ioc_severity === 2) {
								arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
							}
						}
						$scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
						$('.alert2').addClass('selected');
					}
					$scope.$broadcast('crossfilterToTable');
					dc.redrawAll();
					updateSevCounts($scope.sevcounts);
				});
				$('.alert3').on('click',function(){
					$scope.severityDim.filterAll();
					var arr = [];
					if ($('.alert3').hasClass('selected')) {
						$('.alert3').removeClass('selected');
					} else {
						for(var i in $scope.severityDim.top(Infinity)) {
							if ($scope.severityDim.top(Infinity)[i].ioc_severity === 3) {
								arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
							}
						}
						$scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
						$('.alert3').addClass('selected');
					}
					$scope.$broadcast('crossfilterToTable');
					dc.redrawAll();
					updateSevCounts($scope.sevcounts);
				});
				$('.alert4').on('click',function(){
					$scope.severityDim.filterAll();
					var arr = [];
					if ($('.alert4').hasClass('selected')) {
						$('.alert4').removeClass('selected');
					} else {
						for(var i in $scope.severityDim.top(Infinity)) {
							if ($scope.severityDim.top(Infinity)[i].ioc_severity === 4) {
								arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
							}
						}
						$scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
						$('.alert4').addClass('selected');
					}
					$scope.$broadcast('crossfilterToTable');
					dc.redrawAll();
					updateSevCounts($scope.sevcounts);
				});
			});
			$scope.$on('severityUpdate', function () {
				updateSevCounts($scope.sevcounts);
			});
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
						format: 'MMMM D, YYYY h:mm A',
						timePicker: true,
						timePickerIncrement: 5,
						startDate: $scope.start,
						endDate: $scope.end
					},
					function(start, end) {
						$('#reportrange span').html(start.format('MMMM D, YYYY h:mm A') + ' - ' + end.format('MMMM D, YYYY h:mm A'));
					}
				);
				$('#reportrange').on('apply', function(ev, picker) {
					// some kind of clear option is needed here
					$scope.$apply($location.search({'start': moment(picker.startDate.format('MMMM D, YYYY h:mm A')).unix(), 'end':moment(picker.endDate.format('MMMM D, YYYY h:mm A')).unix()}));
				});
			}, 0, false);
		}
	};
}]);

angular.module('mean.system').directive('makeTable', ['$timeout', '$location', '$routeParams', '$rootScope', function ($timeout, $location, $routeParams, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('tableLoad', function (event, tableData, params, tableType) {
				for (var t in params) {
					if (params[t] != null) {
						$(element).prepend('<div class="row-fluid"> '+
						'<div class="span12"> '+
								'<div class="jdash-header">'+params[t].title+'</div> '+
								'<div  style="background-color:#FFF;" class="box"> '+
									'<div class="box-content"> '+
										'<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="'+params[t].div+'" ></table>'+
									'</div> '+
								'</div> '+
							'</div> '+
						'</div><br />');
					}
				}
				switch(tableType) {
					case 'drill':
						for (var t in params) {
							if (params[t] != null) {
							// $('#'+params[t].div).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table-'+params[t].div+'" ></table>');
								$('#'+params[t].div).dataTable({
									'aaData': params[t].aaData,
									'aoColumns': params[t].params,
									'bDeferRender': true,
									'bDestroy': true,
									//'bProcessing': true,
									//'bRebuild': true,
									'aaSorting': params[t].sort,
									//'bFilter': true,
									//'bPaginate': true,
									'sDom': '<"clear"><"clear">r<"table_overflow"t>ip',
									'iDisplayLength': 5,
									'fnPreDrawCallback': function( oSettings ) {
									},
									'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
									},
									'fnDrawCallback': function( oSettings ) {
									}
								});
							}
						}
						break;
					default:
						// $(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table" ></table>');
						for (var t in params) {
							$('#'+params[t].div).dataTable({
								'aaData': tableData.top(Infinity),
								'aoColumns': params[t].params,
								'bDeferRender': true,
								// 'bDestroy': true,
								//'bProcessing': true,
								// 'bRebuild': true,
								'aaSorting': params[t].sort,
								//'bFilter': true,
								//'bPaginate': true,
								'sDom': '<"clear"C>T<"clear">lr<"table_overflow"t>ip',
								'iDisplayLength': 50,
								 'fnPreDrawCallback': function( oSettings ) {
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
								'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
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
										var type = $scope.e[c].link.type;
										switch(type) {
											case 'Archive':
												$('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bArchive button-error pure-button' type='button' value='"+JSON.stringify(aData)+"' href=''>Archive</button>");
											break;
											default:
												var obj = new Object();
												//var all = new Object();
												if ($routeParams.start && $routeParams.end) {
													obj.start = $routeParams.start;
													obj.end = $routeParams.end;
												}
												for (var l in $scope.e[c].link.val) {
													obj[$scope.e[c].link.val[l]] = aData[$scope.e[c].link.val[l]];
												}
												var links = JSON.stringify({
													type: $scope.e[c].link.type,
													objlink: obj
												});
												if ($scope.e[c].mData === 'time') {
													$('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<div style='height:50px;max-width:120px'><button class='bPage button-secondary pure-button' value='"+links+"'>"+aData[$scope.e[c].mData]+"</button><br /><span style='font-size:9px; float:right;' data-livestamp='"+aData[$scope.e[c].mData]+"'></span></div>");
												} else {
													$('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bPage btn btn-link' type='button' value='"+links+"' href=''>"+aData[$scope.e[c].mData]+"</button>");
												}
											break;
										}
									}
								},
								'fnDrawCallback': function( oSettings ) {
									$('table .bPage').click(function(){
										var link = JSON.parse(this.value);
										$scope.$apply($location.path(link.type).search(link.objlink));
									});
									$('table .bArchive').on('click',function(){
										var rowData = JSON.parse(this.value);
										$scope.socket.emit('archiveIOC', {lan_ip: rowData.lan_ip, remote_ip: rowData.remote_ip, ioc: rowData.ioc, database: window.user.database});
										var fil = tableData.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
										$scope.tableCrossfitler.remove(fil);
										tableData.filterAll();
										$('#table').dataTable().fnClearTable();
										$('#table').dataTable().fnAddData(tableData.top(Infinity));
										$('#table').dataTable().fnDraw();
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
								}
							});
							$scope.$on('crossfilterToTable', function () {
								$('#table').dataTable().fnClearTable();
								$('#table').dataTable().fnAddData(tableData.top(Infinity));
								$('#table').dataTable().fnDraw();
							});
						}
					break;
				}
			})
		}
	};
}]);
angular.module('mean.system').directive('universalSearch', function() {
	return {
		link: function($scope, element, attrs) {
			$scope.$watch('search', function(){
				if (($scope.search !== null) || ($scope.search !== '')) {
					$('#table').dataTable().fnFilter($scope.search);
				}
			});
		}
	};
});

angular.module('mean.system').directive('makeBarChart', ['$timeout', '$window', '$rootScope', function ($timeout, $window, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('barChart', function (event, dimension, group, chartType, params) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					//var arr = $scope.data.tables[0].aaData;
					$scope.barChart = dc.barChart('#barchart');
					var waitForFinalEvent = (function () {
						var timers = {};
						return function (callback, ms, uniqueId) {
							if (!uniqueId) {
								uniqueId = "barchartWait"; //Don't call this twice without a uniqueId
							}
							if (timers[uniqueId]) {
								clearTimeout (timers[uniqueId]);
							}
						timers[uniqueId] = setTimeout(callback, ms);
						};
					})();
					var filter, height;
					var width = $('#barchart').parent().width();
					height = width/3.5;
					$scope.sevWidth = function() {
						return $('#barchart').parent().width();
					}
					switch (chartType){
						case 'severity':
							var setNewSize = function(width) {
								$scope.barChart
									.width(width)
									.height(width/3.5)
									.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
								// $('#barchart').parent().height(width/3.5);
								d3.select('#barchart svg').attr('width', width).attr('height', width/3.5);
								$scope.barChart.redraw();
							}
							$scope.barChart
								.group(group, "(1) Guarded")
								.valueAccessor(function(d) {
									return d.value.guarded;
								})
								.stack(group, "(2) Elevated", function(d){return d.value.elevated;})
								.stack(group, "(3) High", function(d){return d.value.high;})
								.stack(group, "(4) Severe", function(d){return d.value.severe;})
								.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"]);
							filter = true;
							break;
						case 'drill':
							var setNewSize = function(width) {
								$scope.barChart
									.width(width)
									.height(width/1.63)
									.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
								$('#barchart').parent().height(width/1.63);
								d3.select('#barchart svg').attr('width', width).attr('height', width/1.63);
								$scope.barChart.redraw();
							}
							$scope.barChart
								.group(group, "(1) DNS")
								.valueAccessor(function(d) {
									return d.value.dns;
								})
								.stack(group, "(2) HTTP", function(d){return d.value.http;})
								.stack(group, "(3) SSL", function(d){return d.value.ssl;})
								.stack(group, "(4) File", function(d){return d.value.file;})
								.stack(group, "(5) Endpoint", function(d){return d.value.ossec;})
								.stack(group, "(6) Total Connections", function(d){return d.value.connections;})
								.colors(["#cb2815","#e29e23","#a3c0ce","#5c5e7d","#e3cdc9","#524A4F"]);
							filter = false;
							height = width/1.63;
							break;
						case 'bar':
							var setNewSize = function(width) {
								$scope.barChart
									.width(width)
									.height(width/3.5)
									.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
								// $(element).height(width/3.5);
								d3.select('#barchart svg').attr('width', width).attr('height', width/3.5);
								$scope.barChart.redraw();
							}
							$scope.barChart
								.group(group)
								.colors(["#193459"]);
							filter = false;
							break;
					}
					if (filter == true) {
						$scope.barChart
							.on("filtered", function(chart, filter){
								waitForFinalEvent(function(){
									$scope.tableData.filterAll();
									var arr = [];
									for(var i in dimension.top(Infinity)) {
										arr.push(dimension.top(Infinity)[i].time);
									}
									console.log(dimension.group().top(Infinity))
									//console.log(dimension.group().top(Infinity));
									$scope.tableData.filter(function(d) { return arr.indexOf(d.time) >= 0; });
									$scope.$broadcast('crossfilterToTable');
									// console.log($scope.tableData.top(Infinity));
									// console.log(timeDimension.top(Infinity))
								}, 400, "filterWait");
							})
					}
					if (($scope.barChartxAxis == null) && ($scope.barChartyAxis == null)) {
						var margin = {top: 10, right: 20, bottom: 10, left: 20};
					} else {
						var margin = {top: 10, right: 30, bottom: 25, left: 43};
					}
					$scope.barChart
						.width(width) // (optional) define chart width, :default = 200
						.height(height)
						.transitionDuration(500) // (optional) define chart transition duration, :default = 500
						.margins(margin) // (optional) define margins
						.dimension(dimension) // set dimension
						//.group(group[g]) // set group
						//.stack(group, "0 - Other", function(d){return d.value.other;})
						.xAxisLabel($scope.barChartxAxis) // (optional) render an axis label below the x axis
						.yAxisLabel($scope.barChartyAxis) // (optional) render a vertical axis lable left of the y axis
						.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
						.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
						.x(d3.time.scale().domain([moment($scope.start), moment($scope.end)])) // define x scale
						.xUnits(d3.time.hours) // define x axis units
						.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
						.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
						//.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
						.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
						.renderTitle(true); // (optional) whether chart should render titles, :default = fal
						$scope.barChart.render();
						$scope.$broadcast('spinnerHide');
						$(window).resize(function () {
							waitForFinalEvent(function(){
								$scope.barChart.render();
							}, 200, "barchartresize");
						});
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.sevWidth());
							}, 150);
						});
						$('.sidebar-toggler').on("click", function() {
							setTimeout(function() {
								setNewSize($scope.sevWidth());
								$scope.barChart.render();
							},10);
						});
						$rootScope.$watch('search', function(){
							$scope.barChart.redraw();
						});
				}, 0, false);
			})
		}
	};
}]);

angular.module('mean.system').directive('makeRowChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('rowChart', function (event, dimension, group, chartType) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					var waitForFinalEvent = (function () {
						var timers = {};
						return function (callback, ms, uniqueId) {
							if (!uniqueId) {
								uniqueId = "rowchartWait"; //Don't call this twice without a uniqueId
							}
							if (timers[uniqueId]) {
								clearTimeout (timers[uniqueId]);
							}
						timers[uniqueId] = setTimeout(callback, ms);
						};
					})();
					var hHeight, lOffset;
					var count = group.top(Infinity).length; ///CHANGE THIS to count return rows
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
					$scope.rowWidth = function() {
						return $('#rowchart').parent().width();
					}
					var filter;
					switch (chartType) {
						case 'severity':
							var setNewSize = function(width) {
								if (width > 0) {
									$scope.rowChart
										.width(width)
										//.height(width/3.3)
										.x(d3.scale.log().domain([1, $scope.rowDomain]).range([0,width]));
										$(element).height(hHeight);
										d3.select('#rowchart svg').attr('width', width).attr('height', hHeight);
									$scope.rowChart.redraw();
								}
							};
							$scope.rowChart
								.colors(["#377FC7","#F5D800","#F88B12","#DD122A"])
								.colorAccessor(function (d){return d.value.severity;});
							filter = true;
							break;
						case 'drill':
							var setNewSize = function(width) {
								hHeight = width*0.613;
								if (width > 0) {
									lOffset = 12+(count*0.7);
									$scope.rowChart
										.width(width)
										.height(width*0.613)
										.x(d3.scale.log().domain([1, $scope.rowDomain]).range([0,width]));
										//$(element).height(hHeight);
										d3.select('#rowchart svg').attr('width', width).attr('height', hHeight);
									$scope.rowChart.redraw();
								}
							};
							$scope.rowChart
								.colors(["#cb2815","#e29e23","#a3c0ce","#5c5e7d","#e3cdc9","#524A4F"])
								.colorAccessor(function (d){return d.value.cColor;});
								hHeight = width*0.613;
								lOffset = 12+(count*0.7);
							filter = false;
							break;
					}
					if (filter == true) {
						$scope.rowChart
							.on("filtered", function(chart, filter){
								$scope.tableData.filterAll();
								var arr = [];
								for(var i in dimension.top(Infinity)) {
									arr.push(dimension.top(Infinity)[i].ioc);
								}
								$scope.tableData.filter(function(d) { return arr.indexOf(d.ioc) >= 0; });
								$scope.$broadcast('crossfilterToTable');
							});
					}
					if (count > 0) {
						var tops = group.order(function (p) {return p.count;}).top(1);
						$scope.rowDomain = tops[0].value.count+0.1;
					} else {
						$scope.rowDomain = 50;
					}
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
						.group(group)
						.dimension(dimension)
						.valueAccessor(function(d) {
							if (d.value.count === 1){
								return d.value.count+1;
							} else if (d.value.count === 0){
								return 1;
							} else {
								return d.value.count;
							}
						})
						.renderLabel(true)
						.label(function(d) { return d.key+' ('+d.value.count+')'; })
						.labelOffsetY(lOffset) //lOffset
						.elasticX(false)
						.x(d3.scale.log().domain([1, $scope.rowDomain]).range([0,width])) //500 ->width
						.xAxis()
						.scale($scope.rowChart.x())
						.tickFormat(logFormat);
						$scope.rowChart.render();
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.rowWidth());
							}, 150);
						});
						$(window).resize(function () {
							waitForFinalEvent(function(){
								$scope.rowChart.render();
							}, 200, "rowchartresize");
						});
						$('.sidebar-toggler').on("click", function() {
							setTimeout(function() {
								setNewSize($scope.rowWidth());
								$scope.rowChart.render();
							},10);
						});
						var rowFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
						$rootScope.$watch('search', function(){
							$scope.tableToRowChart = function () {
								if($rootScope.search === null) {
									rowFilterDimension.filterAll();
								} else {
									rowFilterDimension.filterAll();
									if ($scope.country) {
										rowFilterDimension.filter(function(d) { return $scope.country.indexOf(d) >= 0; });
									}
								}
							}
							$scope.tableToRowChart();
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
			$scope.$on('geoChart', function (event, dimension, group, chartType) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					$scope.geoChart = dc.geoChoroplethChart('#geochart');
					var filter;
					switch (chartType) {
						case 'drill':
							filter = false;
							break;
						default:
							filter = true;
							break;
					}
					if (filter == true) {
						$scope.geoChart
							.on("filtered", function(chart, filter){
								$scope.tableData.filterAll();
								var arr = [];
								for(var c in dimension.top(Infinity)) {
									arr.push(dimension.top(Infinity)[c].remote_country);
								}
								$scope.tableData.filter(function(d) { return arr.indexOf(d.remote_country) >= 0; });
								$scope.$broadcast('crossfilterToTable');
							});
					}
					var numberFormat = d3.format(".2f");
					//var dimension = crossfilterData.dimension(function(d){ return d.remote_country;});
					var count = group.top(Infinity).length;
					if (count > 0) {
						var top = group.orderNatural(function (p) {return p.count;}).top(1);
						var numberOfItems = top[0].value+1;
					} else {
						var numberOfItems = 1;
					};
					var rainbow = new Rainbow();
					rainbow.setNumberRange(0, numberOfItems);
					rainbow.setSpectrum("#FF0000", "#CC0000", "#990000", "#660000", "#360000");
					var cc = [];
					for (var i = 1; i <= numberOfItems; i++) {
						var hexColour = rainbow.colourAt(i);
						cc.push('#' + hexColour);
					}
					function MapCallbackFunction(context)
					{
						var cb = function(error, world) {
							var width = $('#geochart').parent().width();
							var height = width/1.628;
							var projection = d3.geo.mercator().precision(0.1).scale((width + 1) / 2 / Math.PI).translate([width / 2.1, width / 2.4]);
							$scope.geoChart
							.dimension(dimension)
							.group(group)
							.projection(projection)
							.width(width)
							.height(height)
							.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"])
							.colors(cc)
							.colorCalculator(function (d) { return d ? $scope.geoChart.colors()(d) : '#ccc'; })
							.overlayGeoJson(world.features, "country", function(d) {
								return d.properties.name;
							})
							$scope.geoChart.render();
						}
						return cb;
					}
					d3.json("../../../world.json", MapCallbackFunction(this));

					$scope.geoWidth = function() {
						return $('#geochart').parent().width();
					}
					var setNewSize = function(width) {
						if (width > 0) {
							$scope.geoChart
								.width(width)
								.height(width/3.3)
								.projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 2 / Math.PI).translate([width / 2.1, width / 2.4]))
								$(element).height(width/1.628);
								d3.select('#geochart svg').attr('width', width).attr('height', width/1.628);
							$scope.geoChart.redraw();
						}
					}
					$(window).bind('resize', function() {
						setTimeout(function(){
							setNewSize($scope.geoWidth());
						}, 150);
					});
					$('.sidebar-toggler').on("click", function() {
						setTimeout(function() {
							setNewSize($scope.geoWidth());
						},10);
					});
					var geoFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
					$rootScope.$watch('search', function(){
						if($rootScope.search === null) {
								geoFilterDimension.filterAll();
							} else {
								geoFilterDimension.filterAll();
								if ($scope.country) {
									geoFilterDimension.filter(function(d) { return $scope.country.indexOf(d) >= 0; });
								}
							}
						$scope.geoChart.redraw();
					});
					$scope.$broadcast('spinnerHide');
				}, 200, false);
			})
		}
	};
}]);

angular.module('mean.system').directive('makeForceChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('forceChart', function (event, data, params) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					var width = $("#forcechart").parent().width(),
						height = params["height"];
					var tCount = [];
					data.links.forEach(function(d) {
						tCount.push(d.value);
					});

					// var color = d3.scale.category20();
					var palette = {
						"lightgray": "#819090",
						"gray": "#708284",
						"mediumgray": "#536870",
						"darkgray": "#475B62",

						"darkblue": "#0A2933",
						"darkerblue": "#042029",

						"paleryellow": "#FCF4DC",
						"paleyellow": "#EAE3CB",
						"yellow": "#A57706",
						"orange": "#BD3613",
						"red": "#D11C24",
						"pink": "#C61C6F",
						"purple": "#595AB7",
						"blue": "#2176C7",
						"green": "#259286",
						"yellowgreen": "#738A05"
					}
					var count = function(size) {
						if (size === undefined) {
							size = 1;
						}
						return size;
					}
					var color = function(group) {
						if (group === 1) {
							return palette.pink
						} else if (group === 2) {
							return palette.pink
						} else if (group === 3) {
							return palette.orange
						} else {

						}
					}
					function logslider(x) {
						if (x === undefined) {
							return 18;
						}
						// position will be between 0 and 100
						// if(x > 50) {
						// 	x = 50;
						// }
						var minp = 1;
						var maxp = Math.max.apply(Math, tCount);
						// The result should be between 100 an 10000000
						var minv = Math.log(5);
						var maxv = Math.log(50);
						// calculate adjustment factor
						var scale = (maxv-minv) / (maxp-minp);
						return Math.exp(minv + scale*(x-minp));
					}

					var circleWidth = 5;
					var vis = d3.select("#forcechart")
						.append("svg:svg")
						.attr("class", "stage")
						.attr("width", width)
						.attr("height", height);
					var force = d3.layout.force()
						.nodes(data.nodes)
						.links(data.links)
						.gravity(0.1)
						.linkDistance(width/6)
						.charge(-500)
						.size([width-50, height]);

					var link = vis.selectAll(".link")
						.data(data.links)
						.enter().append("line")
						.attr("class", "link")
						.attr("stroke", "#CCC")
						.attr("fill", "#000");

					var node = vis.selectAll("circle.node")
						.data(data.nodes)
						.enter().append("g")
						.attr("class", "node")

					//MOUSEOVER
					.on("mouseover", function(d,i) {
						if (i>0) {
							//CIRCLE
							d3.select(this).selectAll("circle")
								.transition()
								.duration(250)
								.style("cursor", "none")
								.attr("r", function (d) {return logslider(d["width"])+4; })
								.attr("fill",function(d){ return color(d.group); });

							//TEXT
							d3.select(this).select("text")
								.transition()
								.style("cursor", "none")
								.duration(250)
								.style("cursor", "none")
								.attr("font-size","1.5em")
								.attr("x", 15 )
								.attr("y", 5 )
						} else {
						//CIRCLE
							d3.select(this).selectAll("circle")
								.style("cursor", "none")

							//TEXT
							d3.select(this).select("text")
								.style("cursor", "none")
						}
					})

					//MOUSEOUT
					.on("mouseout", function(d,i) {
						if (i>0) {
						//CIRCLE
						d3.select(this).selectAll("circle")
							.transition()
							.duration(250)
							.attr("r", function (d) {return logslider(d["width"]); })
							.attr("fill",function(d){ return color(d.group); } );

						//TEXT
						d3.select(this).select("text")
							.transition()
							.duration(250)
							.attr("font-size","1em")
							.attr("x", 8 )
							.attr("y", 4 )
						}
					})

					.call(force.drag);


					//CIRCLE
					node.append("svg:circle")
						.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; })
						.attr("r", function (d) {return logslider(d["width"]); })
						.attr("fill", function(d, i) { if (i>0) { return  color(d.group); } else { return palette.gray } } )
						.style("stroke-width", "1.5px")
						.style("stroke", "#fff")

					//TEXT
					node.append("text")
						.text(function(d, i) { return d.name+'('+count(d.width)+')'; })
						.attr("x",    function(d, i) { return circleWidth + 5; })
						.attr("y",            function(d, i) { if (i>0) { return circleWidth + 0 }    else { return 8 } })
						// .attr("font-family",  "Bree Serif")
						// .attr("fill",         function(d, i) {  return  palette.paleryellow;  })
						.attr("font-size",    function(d, i) {  return  "1em"; })
						.attr("text-anchor",  function(d, i) { if (i>0) { return  "beginning"; }      else { return "end" } })

					force.on("tick", function(e) {
						node.attr("transform", function(d, i) {
							return "translate(" + d.x + "," + d.y + ")";
						});

						link.attr("x1", function(d)   { return d.source.x; })
							.attr("y1", function(d)   { return d.source.y; })
							.attr("x2", function(d)   { return d.target.x; })
							.attr("y2", function(d)   { return d.target.y; })
					});

					force.start();
				}, 0, false);
			})
		}
	};
}]);

angular.module('mean.system').directive('makeTreeChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('treeChart', function (event, root, params) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					var width = $("#treechart").parent().width(),
						height = params["height"];

					var cluster = d3.layout.cluster()
						.size([height, width - 230]);

					var nodeColor = function(severity) {
						switch(severity) {
							case 1:
								return "#377FC7";
								break;
							case 2:
								return "#F5D800";
								break;
							case 3:
								return "#F88B12";
								break;
							case 4:
								return "#DD122A";
								break;
							default:
							return "#377FC7";
						}
					}

					var diagonal = d3.svg.diagonal()
						.projection(function(d) { return [d.y, d.x]; });

					var svg = d3.select("#treechart").append("svg")
						.attr("width", width)
						.attr("height", height)
						.append("g")
						.attr("transform", "translate(90,0)");

						var nodes = cluster.nodes(root),
						links = cluster.links(nodes);

						var link = svg.selectAll(".link")
							.data(links)
							.enter().append("path")
							.attr("d", diagonal)
							.data(nodes)
							.attr("stroke-width", function(d) { return d.idRoute ? "1px" : "0"; })
							.attr("class", "conn_link");

						var node = svg.selectAll(".conn")
							.data(nodes)
							.enter().append("g")
							.attr("class", "conn")
							.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

						node.append("circle")
							.attr("fill",function(d){ return nodeColor(d.severity); } )
							.attr("stroke", "#000")
							.attr("stroke-width", "0.7px")
							.attr("r", 4.5);

						node.append("text")
							.attr("dx", function(d) { return d.children ? -8 : 8; })
							.attr("dy", 3)
							.attr("font-weight", function(d) { return d.idRoute ? "bold" : 400; })
							// .attr("class", function(d){return aRoute(d.idRoute)})
							.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
							.text(function(d) { return d.name; });
					d3.select(self.frameElement).style("height", height + "px");

				}, 0, false);
			})
		}
	};
}]);
