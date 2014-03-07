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
				localStorage.setItem('sidebar', 0);
			}
			if (localStorage.getItem('sidebar') === '0') { // keep sidebar consistent between pages
				var body = $('body');
				var sidebar = $('.page-sidebar');
				$('.sidebar-search', sidebar).removeClass('open');
				if (body.hasClass('page-sidebar-closed')) {
					body.removeClass('page-sidebar-closed');
					if (body.hasClass('page-sidebar-fixed')) {
						sidebar.css('width', '');
					}
				}
				else {
					body.addClass('page-sidebar-closed');
				}
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
			$scope.$on('tableLoad', function (event) {
				if ($scope.data.tables[0] !== null) {
					$scope.tableCrossfitler = crossfilter($scope.data.tables[0].aaData);
					$scope.tableData = $scope.tableCrossfitler.dimension(function(d){return d;});
					$timeout(function () { // You might need this timeout to be sure its run after DOM render
						$(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table" ></table>');
						$('#table').dataTable({
							'aaData': $scope.tableData.top(Infinity),
							'aoColumns': $scope.data.tables[0].params,
							'bDeferRender': true,
							'bDestroy': true,
							//'bProcessing': true,
							'bRebuild': true,
							'aaSorting': $scope.data.tables[0].sort,
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
									var fil = $scope.tableData.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
									$scope.tableCrossfitler.remove(fil);
									$scope.tableData.filterAll();
									$('#table').dataTable().fnClearTable();
									$('#table').dataTable().fnAddData($scope.tableData.top(Infinity));
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
							$('#table').dataTable().fnAddData($scope.tableData.top(Infinity));
							$('#table').dataTable().fnDraw();
						});
						$rootScope.$watch('search', function(){
							if ($rootScope.search !== null) {
								$('#table').dataTable().fnFilter($rootScope.search);
							}
						});
					}, 500, false);
				}
			})
		}
	};
}]);


/// MULTI TABLE WORK-AROUND.. have to throw these into a div at some point
angular.module('mean.system').directive('multiTable1', ['$timeout', '$location', '$routeParams', '$rootScope', function ($timeout, $location, $routeParams, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('tableLoad', function (event) {
				if ($scope.data.tables[0] !== null) {
					$timeout(function () { // You might need this timeout to be sure its run after DOM render
						$(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table1" ></table>');
						$('#table1').dataTable({
							'aaData': $scope.data.tables[0].aaData,
							'aoColumns': $scope.data.tables[0].params,
							'bDeferRender': true,
							'bDestroy': true,
							//'bProcessing': true,
							//'bRebuild': true,
							'aaSorting': $scope.data.tables[0].sort,
							//'bFilter': true,
							//'bPaginate': true,
							'sDom': '<"clear"><"clear">r<"table_overflow"t>',
							'iDisplayLength': 50,
							'fnPreDrawCallback': function( oSettings ) {
							},
							'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
							},
							'fnDrawCallback': function( oSettings ) {
							}
						});
					}, 200, false);
				} else {
					$(element).parent().parent().parent().remove();
				}
			})
		}
	};
}]);
angular.module('mean.system').directive('multiTable2', ['$timeout', '$location', '$routeParams', '$rootScope', function ($timeout, $location, $routeParams, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('tableLoad', function (event) {
				if ($scope.data.tables[1] !== null) {
					$timeout(function () { // You might need this timeout to be sure its run after DOM render
						$(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table2" ></table>');
						$('#table2').dataTable({
							'aaData': $scope.data.tables[1].aaData,
							'aoColumns': $scope.data.tables[1].params,
							'bDeferRender': true,
							'bDestroy': true,
							//'bProcessing': true,
							//'bRebuild': true,
							'aaSorting': $scope.data.tables[1].sort,
							//'bFilter': true,
							//'bPaginate': true,
							'sDom': '<"clear"><"clear">r<"table_overflow"t>',
							'iDisplayLength': 50,
							'fnPreDrawCallback': function( oSettings ) {
							},
							'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
							},
							'fnDrawCallback': function( oSettings ) {
							}
						});
					}, 200, false);
				} else {
					$(element).parent().parent().parent().remove();
				}
			})
		}
	};
}]);
angular.module('mean.system').directive('multiTable3', ['$timeout', '$location', '$routeParams', '$rootScope', function ($timeout, $location, $routeParams, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('tableLoad', function (event) {
				if ($scope.data.tables[2] !== null) {
					$timeout(function () { // You might need this timeout to be sure its run after DOM render
						$(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table3" ></table>');
						$('#table3').dataTable({
							'aaData': $scope.data.tables[2].aaData,
							'aoColumns': $scope.data.tables[2].params,
							'bDeferRender': true,
							'bDestroy': true,
							//'bProcessing': true,
							//'bRebuild': true,
							'aaSorting': $scope.data.tables[2].sort,
							//'bFilter': true,
							//'bPaginate': true,
							'sDom': '<"clear"><"clear">r<"table_overflow"t>',
							'iDisplayLength': 50,
							'fnPreDrawCallback': function( oSettings ) {
							},
							'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
							},
							'fnDrawCallback': function( oSettings ) {
							}
						});
					}, 200, false);
				} else {
					$(element).parent().parent().parent().remove();
				}
			})
		}
	};
}]);
angular.module('mean.system').directive('multiTable4', ['$timeout', '$location', '$routeParams', '$rootScope', function ($timeout, $location, $routeParams, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('tableLoad', function (event) {
				if ($scope.data.tables[3] !== null) {
					$timeout(function () { // You might need this timeout to be sure its run after DOM render
						$(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table4" ></table>');
						$('#table4').dataTable({
							'aaData': $scope.data.tables[3].aaData,
							'aoColumns': $scope.data.tables[3].params,
							'bDeferRender': true,
							'bDestroy': true,
							//'bProcessing': true,
							//'bRebuild': true,
							'aaSorting': $scope.data.tables[3].sort,
							//'bFilter': true,
							//'bPaginate': true,
							'sDom': '<"clear"><"clear">r<"table_overflow"t>',
							'iDisplayLength': 50,
							'fnPreDrawCallback': function( oSettings ) {
							},
							'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
							},
							'fnDrawCallback': function( oSettings ) {
							}
						});
					}, 200, false);
				} else {
					$(element).parent().parent().parent().remove();
				}
			})
		}
	};
}]);
// ! WORKAROUND

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
						.xAxisLabel($scope.sevChartxAxis) // (optional) render an axis label below the x axis
						.yAxisLabel($scope.sevChartyAxis) // (optional) render a vertical axis lable left of the y axis
						.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
						.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
						.x(d3.time.scale().domain([moment($scope.start), moment($scope.end)])) // define x scale
						.xUnits(d3.time.hours) // define x axis units
						.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
						.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
						// .on("filtered", function(chart, filter){
						// 	waitForFinalEvent(function(){
						// 		$scope.tableData.filterAll();
						// 		var arr = [];
						// 		for(var i in dimension.top(Infinity)) {
						// 			arr.push(dimension.top(Infinity)[i].time);
						// 		}
						// 		console.log(dimension.group().top(Infinity))
						// 		//console.log(dimension.group().top(Infinity));
						// 		$scope.tableData.filter(function(d) { return arr.indexOf(d.time) >= 0; });
						// 		$scope.$broadcast('crossfilterToTable');
						// 		// console.log($scope.tableData.top(Infinity));
						// 		// console.log(timeDimension.top(Infinity))
						// 	}, 400, "filterWait");
						// })
						//.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
						.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
						.renderTitle(true); // (optional) whether chart should render titles, :default = fal
						$scope.sevChart.render();
						$scope.$broadcast('spinnerHide');
						$scope.sevWidth = function() {
							return $('#sevchart').parent().width();
						}
						var setNewSize = function(width) {
							if (width > 0) {
								$scope.sevChart
									.width(width)
									.height(width/3.5)
									.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
								$(element).height(width/3.5);
								d3.select('#sevchart svg').attr('width', width).attr('height', width/3.5);
								$scope.sevChart.redraw();
							}
						}
						$(window).resize(function () {
							waitForFinalEvent(function(){
								$scope.sevChart.render();
							}, 200, "sevchartresize");
						});
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.sevWidth());
							}, 150);
						});
						$('.sidebar-toggler').on("click", function() {
							setTimeout(function() {
								setNewSize($scope.sevWidth());
								$scope.sevChart.render();
							},10);
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
					if (count > 0) {
						var tops = sevCount.order(function (p) {return p.count;}).top(1);
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
						.group(sevCount)
						.dimension(dimension)
						.colors(["#377FC7","#F5D800","#F88B12","#DD122A"])
						.valueAccessor(function(d) {
							return d.value.count+0.1;
						})
						.colorAccessor(function (d){return d.value.severity;})
						.renderLabel(true)
						.on("filtered", function(chart, filter){
							$scope.tableData.filterAll();
							var arr = [];
							for(var i in dimension.top(Infinity)) {
								arr.push(dimension.top(Infinity)[i].ioc);
							}
							$scope.tableData.filter(function(d) { return arr.indexOf(d.ioc) >= 0; });
							$scope.$broadcast('crossfilterToTable');
						})
						.label(function(d) { return d.key+' ('+d.value.count+')'; })
						.labelOffsetY(lOffset) //lOffset
						.elasticX(false)
						.x(d3.scale.log().domain([1, $scope.rowDomain]).range([0,width])) //500 ->width
						.xAxis()
						.scale($scope.rowChart.x())
						.tickFormat(logFormat);

						$scope.rowChart.render();

						$scope.rowWidth = function() {
							return $('#rowchart').parent().width();
						}
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
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.rowWidth());
							}, 150);
						});
						$('.sidebar-toggler').on("click", function() {
							setTimeout(function() {
								setNewSize($scope.rowWidth());
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
				}, 50, false);
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
							$scope.geoChart
							.dimension(dimension)
							.group(group)
							.projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 2 / Math.PI).translate([width / 2.1, width / 2.4]))
							.width(width)
							.height(height)
							.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"])
							.colors(cc)
							.colorCalculator(function (d) { return d ? $scope.geoChart.colors()(d) : '#ccc'; })
							.overlayGeoJson(world.features, "country", function(d) {
								return d.properties.name;
							})
							.on("filtered", function(chart, filter){
								$scope.tableData.filterAll();
								var arr = [];
								for(var c in dimension.top(Infinity)) {
									arr.push(dimension.top(Infinity)[c].remote_country);
								}
								$scope.tableData.filter(function(d) { return arr.indexOf(d.remote_country) >= 0; });
								$scope.$broadcast('crossfilterToTable');
							});
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

angular.module('mean.system').directive('makeBarChart', ['$timeout','$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('barChart', function (event) {
				var dimension = $scope.crossfilterData.dimension(function(d) { return d.hour });
				var group = dimension.group().reduceSum(function(d) { return d.count });
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
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
					var width = $('#barchart').parent().width();
					var height = width/3.5;
					$scope.barChart
						.width(width) // (optional) define chart width, :default = 200
						.height(height)
						.transitionDuration(500) // (optional) define chart transition duration, :default = 500
						.margins({top: 10, right: 30, bottom: 25, left: 43}) // (optional) define margins
						.dimension(dimension) // set dimension
						//.group(group) // set group
						.group(group)
						.colors(["#193459"])
						.xAxisLabel($scope.barChartxAxis) // (optional) render an axis label below the x axis
						.yAxisLabel($scope.barChartyAxis) // (optional) render a vertical axis lable left of the y axis
						.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
						.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
						.on("filtered", function(chart, filter){
							waitForFinalEvent(function(){
								$scope.tableData.filterAll();
								var arr = [];
								for(var i in dimension.top(Infinity)) {
									arr.push(dimension.top(Infinity)[i].time);
								}
								$scope.tableData.filter(function(d) { return arr.indexOf(d.time) >= 0; });
								$scope.$broadcast('crossfilterToTable');
								// console.log($scope.tableData.top(Infinity));
								// console.log(timeDimension.top(Infinity))
							}, 400, "barfilterWait");
						})
						.x(d3.time.scale().domain([moment($scope.start), moment($scope.end)])) // define x scale
						// .x(d3.time.scale().domain([moment.unix(moment($scope.start).unix()), moment.unix(moment($scope.end).unix())])) // define x scale
						.xUnits(d3.time.hours) // define x axis units
						.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
						.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
						.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
						//.title(function (d) { return ""; })
						//.legend(dc.legend().x(250).y(10))
						.renderTitle(true); // (optional) whether chart should render titles, :default = false

						$scope.barChart.render();

						$scope.barWidth = function() {
							if($('#barchart').parent()) {
								return $('#barchart').parent().width();
							}
						}
						var setNewSize = function(width) {
							if (width > 0) {
								$scope.barChart
									.width(width)
									.height(width/3.5)
									.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
								//$(element).height(width/3.5);
								d3.select('#barchart svg').attr('width', width).attr('height', width/3.5);
								$scope.barChart.redraw();
							}
						}
						$(window).resize(function () {
							waitForFinalEvent(function(){
								$scope.barChart.render();
							}, 200, "barchartresize");
						});
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.barWidth());
							}, 150);
						});
						$('.sidebar-toggler').on("click", function() {
							setTimeout(function() {
								setNewSize($scope.barWidth());
								$scope.barChart.render();
							},10);
						});
						$rootScope.$watch('search', function(){
							$scope.barChart.redraw();
						});
						$scope.$broadcast('spinnerHide');
					}, 0, false);
			})
		}
	};
}]);