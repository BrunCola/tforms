'use strict';

angular.module('mean.pages').directive('head', function() {
	return {
		restrict: 'A',
		scope : {
			title : '@'
		},
		templateUrl : 'public/pages/views/head.html',
		transclude : true
	};
});

angular.module('mean.system').directive('iocDesc', function() {
	return {
		link: function($scope, element, attrs) {
			$scope.$on('iocDesc', function (event, description) {
				console.log(description)
				$(element).html('... <a href="javascript:void(0);"><strong ng-click="open">Read More</strong></a>');
				$(element).on('click', function(){
					$scope.description(description);
				})
			});
		}
	};
});

angular.module('mean.pages').directive('modalWindow', function() {
	return {
		// restrict: 'EA',
		link: function($scope, element) {
			if ($scope.data !== undefined) {
				var elm = $(element).find('div#mTable');
				elm.html('<div><table style="width:100%; height:100%; overflow:scroll !important;" cellpadding="0" cellspacing="0" border="0" class="display" id="tTable"></table></div>');
				elm.find('#tTable').dataTable({
					"aaData": $scope.data.data,
					"sDom": '<"clear"C>T<"clear">r<"table_overflow"t>ip',
					"bDestroy": true,
					"bFilter": true,
					"bRebuild": true,
					"aoColumns": $scope.data.columns,
					"iDisplayLength": 4,
				});
			}
		}
	}
});

angular.module('mean.pages').directive('loadingError', function() {
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
					timeout: 2300 // delay for closing event. Set false for sticky notifications
				});
				$scope.$broadcast('spinnerHide');
			});
		}
	};
});

angular.module('mean.pages').directive('newNotification', function() {
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
			$scope.$on('killNoty', function (event) {
				$.noty.closeAll();
				$(".flagged_drop").effect("highlight", {}, 5500);
			});
		}
	};
});

angular.module('mean.system').directive('loadingSpinner', ['$rootScope', function ($rootScope) {
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
				if ($rootScope.rootpage !== false) {
					$('#loading-spinner').data('spinner').stop();
				}
				$('html, body').animate({scrollTop:0}, 'slow');
				window.onscroll = function (event) {
					$('html, body').stop( true, true ).animate();
				}
				$(".page-content").fadeTo(500, 1);
			});
		}
	};
}]);

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

angular.module('mean.pages').directive('severityLevels', ['$timeout', function ($timeout) {
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

angular.module('mean.pages').directive('datePicker', ['$timeout', '$location', '$rootScope', '$state', function ($timeout, $location, $rootScope, $state) {
	return {
		link: function ($scope, element, attrs) {
			$timeout(function () {
				var searchObj;
				if ($scope.daterange !== false) {
					$(element).daterangepicker(
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
							searchObj = $location.$$search;
							searchObj.start = moment(start.format('MMMM D, YYYY h:mm A')).unix();
							searchObj.end = moment(end.format('MMMM D, YYYY h:mm A')).unix();
						}
					);
					$('#reportrange').on('apply', function(ev, picker) {
						// some kind of clear option is needed here
						$state.go($state.current, searchObj);
					});
				}
			}, 0, false);
		}
	};
}]);

angular.module('mean.pages').directive('makeTable', ['$timeout', '$location', '$rootScope', 'iocIcon', 'appIcon', 'mimeIcon', 'socket', '$http', function ($timeout, $location, $rootScope, iocIcon, appIcon, mimeIcon, socket, $http) {
	return {
		link: function ($scope, element, attrs) {
			$scope.socket = socket;
			$scope.$on('tableLoad', function (event, tableData, params, tableType) {
				function redrawTable() {
					$('#table').dataTable().fnClearTable();
					$('#table').dataTable().fnAddData(tableData.top(Infinity));
					$('#table').dataTable().fnDraw();
				}

				for (var t in params) {
					if (params[t] != null) {
						if ($location.$$absUrl.search('/report#!/') === -1) {
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
						} else {
							$(element).prepend('<div style="margin-bottom:17px;margin-left:0;"> '+
								'<div class="row-fluid"> '+
									'<div class="span12"> '+
										'<div class="jdash-header">'+params[t].title+'</div> '+
										'<div  style="background-color:#FFF;" class="box"> '+
											'<div class="box-content"> '+
												'<table class="table report-table" id="'+params[t].div+'" ></table>'+
											'</div> '+
										'</div> '+
									'</div> '+
								'</div> '+
							'</div><br />');
						}
					}
					if (params[t]) {
						if (params[t].pagebreakBefore === true) {
							$(element).prepend('<div style="page-break-before: always;"></div>');
						}
					}
				}
				var bFilter,iDisplayLength,bStateSave,bPaginate,sDom,bDeferRender,notReport,stateSave;
				switch(tableType) {
					case 'drill':
						if ($location.$$absUrl.search('/report#!/') === -1) {
							iDisplayLength = 5;
							bDeferRender: true
							notReport = true;
							sDom = '<"clear"><"clear">rC<"table_overflow"t>ip';
							stateSave: true;
						} else {
							iDisplayLength = 99999;
							bDeferRender = true;
							sDom = 'r<t>';
							notReport = false;
							stateSave: false;
						}
						for (var t in params) {
							if (params[t] != null) {
							// $('#'+params[t].div).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table-'+params[t].div+'" ></table>');
								$('#'+params[t].div).dataTable({
									'aaData': params[t].aaData,
									'aoColumns': params[t].params,
									'bDeferRender': bDeferRender,
									'bDestroy': true,
									'oColVis': {
										'iOverlayFade': 400
									},
									'stateSave': stateSave,
									//'bProcessing': true,
									//'bRebuild': true,
									'aaSorting': params[t].sort,
									//'bFilter': true,
									// 'bPaginate': bPaginate,
									'sDom': sDom,
									'iDisplayLength': iDisplayLength,
									'fnPreDrawCallback': function( oSettings ) {
										$scope.r = [];
										for (var a in oSettings.aoColumns) {
											// find the index of column rows so they can me modified below
											if (oSettings.aoColumns[a].bVisible === true) {
												$scope.r.push(oSettings.aoColumns[a].mData);
											}
										}
									},
									'fnRowCallback': function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
										if (aData.ioc_severity && $scope.r.indexOf('ioc_severity') !== -1) {
											var rIndex = $scope.r.indexOf("ioc_severity");
											$('td:eq('+rIndex+')', nRow).html('<span class="aTable'+aData.ioc_severity+' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa '+iocIcon(aData.ioc_severity)+' fa-stack-1x fa-inverse"></i></span>');
										}
										if (aData.remote_cc && $scope.r.indexOf('remote_cc') !== -1) {
											$('td:eq('+$scope.r.indexOf("remote_cc")+')', nRow).html('<div class="f32"><span class="flag '+aData.remote_cc.toLowerCase()+'"></span></div>');
										}
										if (aData.l7_proto && $scope.r.indexOf('l7_proto') !== -1) {
											$('td:eq('+$scope.r.indexOf("l7_proto")+')', nRow).html(appIcon(aData.l7_proto));
										}
										if (aData.mime && $scope.r.indexOf('mime') !== -1) {
											$('td:eq('+$scope.r.indexOf("mime")+')', nRow).html(mimeIcon(aData.mime));
										}
										if (aData.mailfrom && $scope.r.indexOf('mailfrom') !== -1) {
											var newVar = aData.mailfrom.replace(/[\<\>]/g,'');
											$('td:eq('+$scope.r.indexOf("mailfrom")+')', nRow).html(newVar);
										}
										if (aData.receiptto && $scope.r.indexOf('receiptto') !== -1) {
											var newVar = aData.receiptto.replace(/[\<\>]/g,'');
											$('td:eq('+$scope.r.indexOf("receiptto")+')', nRow).html(newVar);
										}
										if (!notReport) {
											if (aData.icon_in_bytes !== undefined){
												var bIndex = $scope.r.indexOf("icon_in_bytes");
												if ((aData.icon_in_bytes > 0) && (aData.icon_out_bytes > 0)) {
													$('td:eq('+bIndex+')', nRow).html('<span><i style="font-size:16px !important" class="fa fa-arrow-up"></i><i style="font-size:16px !important" class="fa fa-arrow-down"></i></span>');
												} else if ((aData.icon_in_bytes == 0) && (aData.icon_out_bytes > 0)) {
													$('td:eq('+bIndex+')', nRow).html('<span><i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-up"></i><i style="font-size:16px !important" class="fa fa-arrow-down"></i></span>');
												} else if ((aData.icon_in_bytes > 0) && (aData.icon_out_bytes == 0)) {
													$('td:eq('+bIndex+')', nRow).html('<span><i style="font-size:16px !important" class="fa fa-arrow-up"></i><i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-down"></i></span>');
												} else {
													$('td:eq('+bIndex+')', nRow).html('<span><i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-up"></i><i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-down"></i></span>');
												}
											}
										}
									},
									'fnDrawCallback': function( oSettings ) {
										// $('.paginate_button').on('click', function(){
										// 	console.log('poo')
										// 	$('html, body').animate({scrollTop:0}, 'slow');
										// })
									}
								});
							}
						}
						break;
					default:
						if ($location.$$absUrl.search('/report#!/') === -1) {
							iDisplayLength = 50;
							bDeferRender = true;
							sDom = '<"clear">T<"clear">lCr<"table_overflow"t>ip';
							notReport = true;
							stateSave = true;
						} else {
							iDisplayLength = 99999;
							bDeferRender = true;
							sDom = 'r<t>';
							notReport = false;
							stateSave = false;
						}
						// $(element).html('<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="table" ></table>');
						for (var t in params) {
							params[t].div = $('#'+params[t].div).dataTable({
								'aaData': tableData.top(Infinity),
								'aoColumns': params[t].params,
								'bDeferRender': bDeferRender,
								// 'bDestroy': true,
								//'bProcessing': true,
								// 'bRebuild': true,
								'aaSorting': params[t].sort,
								//'bFilter': true,
								//'bPaginate': true,
								'stateSave': stateSave,
								'sDom': sDom,
								'iDisplayLength': iDisplayLength,
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
									if (aData.ioc_severity && $scope.r.indexOf('ioc_severity') !== -1) {
										var rIndex = $scope.r.indexOf("ioc_severity");
										$('td:eq('+rIndex+')', nRow).html('<span class="aTable'+aData.ioc_severity+' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa '+iocIcon(aData.ioc_severity)+' fa-stack-1x fa-inverse"></i></span>');
									}
									if (aData.remote_cc && $scope.r.indexOf('remote_cc') !== -1) {
										$('td:eq('+$scope.r.indexOf("remote_cc")+')', nRow).html('<div class="f32"><span class="flag '+aData.remote_cc.toLowerCase()+'"></span></div>');
									}
									if (aData.l7_proto && $scope.r.indexOf('l7_proto') !== -1) {
										// var div = $('td:eq('+$scope.r.indexOf("l7_proto")+')', nRow);
										// appIcon(d3.select(div[0]), aData.l7_proto);

										$('td:eq('+$scope.r.indexOf("l7_proto")+')', nRow).html(appIcon(aData.l7_proto));
									}
									if (aData.mime && $scope.r.indexOf('mime') !== -1) {
										$('td:eq('+$scope.r.indexOf("mime")+')', nRow).html(mimeIcon(aData.mime));
									}
									if (aData.mailfrom && $scope.r.indexOf('mailfrom') !== -1) {
										var newVar = aData.mailfrom.replace(/[\<\>]/g,'');
										$('td:eq('+$scope.r.indexOf("mailfrom")+')', nRow).html(newVar);
									}
									if (aData.stealth && $scope.r.indexOf('stealth') !== -1) {
										if (aData.stealth > 0){
											$('td:eq('+$scope.r.indexOf("stealth")+')', nRow).html('<span style="color:#000" class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-shield fa-stack-1x fa-inverse"></i></span>');
										}
									} else {
										$('td:eq('+$scope.r.indexOf("stealth")+')', nRow).html(aData.stealth);
									}
									if (aData.receiptto && $scope.r.indexOf('receiptto') !== -1) {
										var newVar = aData.receiptto.replace(/[\<\>]/g,'');
										$('td:eq('+$scope.r.indexOf("receiptto")+')', nRow).html(newVar);
									}
									if (notReport) {
										// url builder
										for (var c in $scope.e) {
											var type = $scope.e[c].link.type;
											switch(type) {
												case 'Archive':
													$('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bArchive button-error pure-button' type='button' value='"+JSON.stringify(aData)+"' href=''>Archive</button>");
												break;
												case 'Restore':
													$('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bRestore button-success pure-button' type='button' value='"+JSON.stringify(aData)+"' href=''>Restore</button>");
												break;
												default:
													var obj = new Object();
													//var all = new Object();
													if ($location.$$search.start && $location.$$search.end) {
														obj.start = $location.$$search.start;
														obj.end = $location.$$search.end;
													}
													for (var l in $scope.e[c].link.val) {
														if (aData[$scope.e[c].link.val[l]] !== null) {
															var newVar = aData[$scope.e[c].link.val[l]].toString();
															obj[$scope.e[c].link.val[l]] = newVar.replace("'", "&#39;");
														}
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
									}
								},
								'fnDrawCallback': function( oSettings ) {
									if (notReport) {
										$('table .bPage').click(function(){
											var link = JSON.parse(this.value);
											$scope.$apply($location.path(link.type).search(link.objlink));
										});
										$('table .bArchive').on('click',function(){
											var rowData = JSON.parse(this.value);
											$http({method: 'POST', url: '/actions/archive', data: {lan_ip: rowData.lan_ip, remote_ip: rowData.remote_ip, ioc: rowData.ioc}}).
												success(function(data, status, headers, config) {
													var fil = tableData.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
													$scope.tableCrossfitler.remove(fil);
													tableData.filterAll();
													redrawTable();
												})
										});
										$('table .bRestore').on('click',function(){
											var rowData = JSON.parse(this.value);
											$http({method: 'POST', url: '/actions/restore', data: {lan_ip: rowData.lan_ip, remote_ip: rowData.remote_ip, ioc: rowData.ioc}}).
												success(function(data, status, headers, config) {
													var fil = tableData.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
													$scope.tableCrossfitler.remove(fil);
													tableData.filterAll();
													redrawTable();
												})
										});
										$scope.country = [];
										$scope.ioc = [];
										$scope.severity = [];
										$scope.l7_proto = [];
										for (var d in oSettings.aiDisplay) {
											$scope.l7_proto.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.l7_proto);
											$scope.country.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.remote_country);
											$scope.ioc.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.ioc);
											$scope.severity.push(oSettings.aoData[oSettings.aiDisplay[d]]._aData.ioc_severity);
										}
										$scope.$broadcast('severityUpdate');
									}
								}
							});
							$scope.$on('crossfilterToTable', function () {
								$('#table').dataTable().fnClearTable();
								$('#table').dataTable().fnAddData(tableData.top(Infinity));
								$('#table').dataTable().fnDraw();
							});
							// new $.fn.dataTable.FixedHeader( params[t].div );
							$.fn.dataTableExt.sErrMode = 'throw';
						}
					break;
				}
			})
		}
	};
}]);
angular.module('mean.pages').directive('universalSearch', function() {
	return {
		link: function($scope, element, attrs) {
			$scope.$watch('search', function(){
				if ($scope.search) {
					if (($scope.search !== null) || ($scope.search !== '')) {
						$('#table').dataTable().fnFilter($scope.search);
					}
				}
			});

		}
	};
});

angular.module('mean.pages').directive('makePieChart', ['$timeout', '$window', '$rootScope', function ($timeout, $window, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('pieChart', function (event, chartType, params) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					//var arr = $scope.data.tables[0].aaData;
					$scope.pieChart = dc.pieChart('#piechart');
					var waitForFinalEvent = (function () {
						var timers = {};
						return function (callback, ms, uniqueId) {
							if (!uniqueId) {
								uniqueId = "piechartWait"; //Don't call this twice without a uniqueId
							}
							if (timers[uniqueId]) {
								clearTimeout (timers[uniqueId]);
							}
							timers[uniqueId] = setTimeout(callback, ms);
						};
					})();
					var filter, height;
					var width = $('#piechart').parent().width();
					height = width/2.4;
					$scope.sevWidth = function() {
						return $('#piechart').parent().width();
					}
					filter = true;
					// switch (chartType){
					// 	case 'bandwidth':
					// 		var setNewSize = function(width) {
					// 			$scope.pieChart
					// 				.width(width)
					// 				.height(width/3.5)
					// 				.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
					// 			// $('#piechart').parent().height(width/3.5);
					// 			d3.select('#piechart svg').attr('width', width).attr('height', width/3.5);
					// 			$scope.pieChart.redraw();
					// 		}
					// 		$scope.pieChart
					// 			.group(group, "MB To Remote")
					// 			.valueAccessor(function(d) {
					// 				return d.value.in_bytes;
					// 			})
					// 			.stack(group, "MB From Remote", function(d){return d.value.out_bytes;})
					// 			.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
					// 			.colors(["#112F41","#068587"]);
					// 		filter = true;
					// 		break;
					// 	case 'severity':
					// 		var setNewSize = function(width) {
					// 			$scope.pieChart
					// 				.width(width)
					// 				.height(width/3.5)
					// 				.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
					// 			// $('#piechart').parent().height(width/3.5);
					// 			d3.select('#piechart svg').attr('width', width).attr('height', width/3.5);
					// 			$scope.pieChart.redraw();
					// 		}
					// 		$scope.pieChart
					// 			.group(group, "(1) Guarded")
					// 			.valueAccessor(function(d) {
					// 				return d.value.guarded;
					// 			})
					// 			.stack(group, "(2) Elevated", function(d){return d.value.elevated;})
					// 			.stack(group, "(3) High", function(d){return d.value.high;})
					// 			.stack(group, "(4) Severe", function(d){return d.value.severe;})
					// 			.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"]);
					// 		filter = true;
					// 		break;
					// 	case 'drill':
					// 		var setNewSize = function(width) {
					// 			$scope.pieChart
					// 				.width(width)
					// 				.height(width/1.63)
					// 				.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
					// 			$('#piechart').parent().height(width/1.63);
					// 			d3.select('#piechart svg').attr('width', width).attr('height', width/1.63);
					// 			$scope.pieChart.redraw();
					// 		}
					// 		$scope.pieChart
					// 			.group(group, "(1) DNS")
					// 			.valueAccessor(function(d) {
					// 				return d.value.dns;
					// 			})
					// 			.stack(group, "(2) HTTP", function(d){return d.value.http;})
					// 			.stack(group, "(3) SSL", function(d){return d.value.ssl;})
					// 			.stack(group, "(4) File", function(d){return d.value.file;})
					// 			.stack(group, "(5) Endpoint", function(d){return d.value.ossec;})
					// 			.stack(group, "(6) Total Connections", function(d){return d.value.connections;})
					// 			.colors(["#cb2815","#e29e23","#a3c0ce","#5c5e7d","#e3cdc9","#524A4F"]);
					// 		filter = false;
					// 		height = width/1.63;
					// 		break;
					// 	case 'bar':
					// 		var setNewSize = function(width) {
					// 			$scope.pieChart
					// 				.width(width)
					// 				.height(width/3.5)
					// 				.margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
					// 			// $(element).height(width/3.5);
					// 			d3.select('#pieChart svg').attr('width', width).attr('height', width/3.5);
					// 			$scope.pieChart.redraw();
					// 		}
					// 		$scope.pieChart
					// 			.group(group)
					// 			.colors(["#193459"]);
					// 		filter = false;
					// 		break;
					// }
					if (filter == true) {
						$scope.pieChart
							.on("filtered", function(chart, filter){
								waitForFinalEvent(function(){
									$scope.tableData.filterAll();
									var arr = [];
									for(var i in $scope.appDimension.top(Infinity)) {
										arr.push($scope.appDimension.top(Infinity)[i].l7_proto);
									}

									$scope.tableData.filter(function(d) { return arr.indexOf(d.l7_proto) >= 0; });
									$scope.$broadcast('crossfilterToTable');

								}, 400, "filterWait");
							})
					}
		
					$scope.pieChart
						.width(width) // (optional) define chart width, :default = 200
						.height(height)
						.transitionDuration(500) // (optional) define chart transition duration, :default = 500
						// .margins(margin) // (optional) define margins
						.dimension($scope.appDimension) // set dimension
						.group($scope.pieGroup) // set group
						.legend(dc.legend().x(width - 100).y(10).itemHeight(13).gap(5))
						.colors(d3.scale.category20());

					$scope.pieChart.render();
						$scope.$broadcast('spinnerHide');
						$(window).resize(function () {
							waitForFinalEvent(function(){
								$scope.pieChart.render();
							}, 200, "pieChartresize");
						});
						$(window).bind('resize', function() {
							setTimeout(function(){
								setNewSize($scope.sevWidth());
							}, 150);
						});
						$('.sidebar-toggler').on("click", function() {
							setTimeout(function() {
								setNewSize($scope.sevWidth());
								$scope.pieChart.render();
							},10);
						});
						$rootScope.$watch('search', function(){
							$scope.pieChart.redraw();
						});

					// var geoFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
					$rootScope.$watch('search', function(){

						if($rootScope.search === null) {
							$scope.appDimension.filterAll();
						} else {
							$scope.appDimension.filterAll();
							// console.log($scope.appDimension.top(Infinity));
							if ($scope.l7_proto) {
								$scope.appDimension.filter(function(d) { return $scope.l7_proto.indexOf(d) >= 0; });
								// $scope.pieGroup = $scope.appDimension.group().reduceSum(function (d) {
				    //                 return d.app_count;
				    //             });
							}
							// console.log($scope.appDimension.top(Infinity));

						}
						$scope.pieChart.dimension($scope.appDimension);
						$scope.pieChart.group($scope.pieGroup); // set group
						$scope.pieChart.redraw();
						// $scope.pieChart.render();
					});
				}, 0, false);
			})
		}
	};
}]);

angular.module('mean.pages').directive('makeBarChart', ['$timeout', '$window', '$rootScope', function ($timeout, $window, $rootScope) {
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
						case 'bandwidth':
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
								.group(group, "MB To Remote")
								.valueAccessor(function(d) {
									return d.value.in_bytes;
								})
								.stack(group, "MB From Remote", function(d){return d.value.out_bytes;})
								.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
								.colors(d3.scale.ordinal().domain(["in_bytes","out_bytes"]).range(["#112F41","#068587"]));
							filter = true;
							break;
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
								.colors(d3.scale.ordinal().domain(["guarded","elevated","high","severe"]).range(["#377FC7","#F5D800","#F88B12","#DD122A"]));
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
								.colors(d3.scale.ordinal().domain(["dns","http","ssl","file","ossec","connections"]).range(["#cb2815","#e29e23","#a3c0ce","#5c5e7d","#e3cdc9","#524A4F"]));
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
									// console.log(dimension.group().top(Infinity))
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

angular.module('mean.pages').directive('makeRowChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
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
								.colors(d3.scale.ordinal().domain("guarded","elevated","high","severe").range(["#377FC7","#DD122A","#F88B12", "#F5D800"]))
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

angular.module('mean.pages').directive('makeGeoChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('geoChart', function (event, dimension, group, chartType) {
				// console.log(chartType)
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
					var domain = [];
					for (var i = 1; i <= numberOfItems; i++) {
						domain.push(i);
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
							.colors(d3.scale.ordinal().domain(domain).range(cc))
							.colorCalculator(function (d) { return d ? $scope.geoChart.colors()(d) : '#ccc'; })
							.overlayGeoJson(world.features, "country", function(d) {
								return d.properties.name;
							})
							$scope.geoChart.render();
						}
						return cb;
					}
					d3.json("public/system/assets/world.json", MapCallbackFunction(this));

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

angular.module('mean.pages').directive('makeForceChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
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
					var maxNum = Math.max.apply(Math, tCount);

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
						var minp = 0;
						var maxp = maxNum;
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

//NETWORK CHART STARTS HERE
angular.module('mean.pages').directive('makeNetworkChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('networkChart', function (event, data, params) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render
					var width = $("#networkchart").parent().width(),
						height = params["height"];
					var tCount = [];
					console.log(data);
					console.log(data.links);
					data.links.forEach(function(d) {
						tCount.push(d.value);
					});
					var maxNum = Math.max.apply(Math, tCount);

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
					var color = function(type) {
						if (type === "zone") {
							return palette.blue
						} else if (type === "network") {
							return palette.pink
						} else if (type === "os") {
							return palette.orange
						} else if (type === "endpoint") {
							return palette.yellow
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
						var minp = 0;
						var maxp = maxNum;
						// The result should be between 100 an 10000000
						var minv = Math.log(5);
						var maxv = Math.log(50);
						// calculate adjustment factor
						var scale = (maxv-minv) / (maxp-minp);
						return Math.exp(minv + scale*(x-minp));
					}

					// var circleWidth = 15;

					var vis = d3.select("#networkchart")
						.append("svg:svg")
						.attr("class", "stage")
						.attr("width", width)
						.attr("height", height);

					var force = d3.layout.force()
						.nodes(data.nodes)
						.links(data.links)
						.gravity(0.18)
						.linkDistance(width/14)
						.charge(-500)
						.size([width-10, height]);

					var link = vis.selectAll(".link")
						.data(data.links)
						.enter().append("line")
						// .attr("class", "link")
						.attr("stroke", "#CCC");
						// .attr("fill", "#000");

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
									.attr("fill",function(d){ return color(d.type); });

								//TEXT
								d3.select(this).select("text")
									.transition()
									.style("cursor", "none")
									.duration(250)
									.style("cursor", "none")
									// .attr("font-size","5.5em")
									.attr("x", 10 )
									.attr("y", 10 )
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
								.attr("r", function(d){return logslider(d["width"]); })
								.attr("fill",function(d){return color(d.type);});

							//TEXT
							d3.select(this).select("text")
								.transition()
								.duration(250)
								// .attr("font-size","7em")
								.attr("x", 15 )
								.attr("y", 30 )
							}
						})

						.call(force.drag);

					link.each(function(d){
						
						if(d.type === "osToEndpoint"){
							d3.select(this)
							.attr("stroke", "#eaeaea");
						}
					});

					var appendText = function(elm) {
							elm.append("text")
							.text(function(d, i) { return d.name; })
							.attr("x", "15")
							.attr("y", "30")
							.style("font-size", "1.6em")
					}

					node.each(function(d){
						var elm = d3.select(this);
						if(d.type === "os" && d.name === "Linux") {							
							elm.append('path')
							.style('fill', '#000000')
							.attr('d', 'M26.3,0c2.2-0.1,5.4,1.9,5.7,4.2c0.3,1.4,0.1,3,0.1,4.4c0,1.6,0,3.3,0.2,4.9'+
							'c0.3,2.9,2.4,4.8,3.7,7.2c0.6,1.2,1.4,2.4,1.7,3.8c0.4,1.5,0.7,3.1,1,4.6c0.2,1.5,0.4,2.9,0.3,4.4c0,0.6,0.1,1.3-0.1,2'+
							'c-0.2,0.8-0.6,1.3-0.3,2.1c0.2,0.7,0.1,1.2,0.9,1.3c0.7,0.1,1.3-0.2,2-0.1c1.4,0.1,2.8,0.7,2.3,2.3c-1.6,2.3-3.3,4.8-5.6,6.5'+
							'c-0.9,0.7-1.8,1.9-3,2.1c-1.2,0.4-2.8,0.3-3.9-0.6c-0.4-0.3-0.7-0.7-0.9-1.1c-0.1-0.3-0.2-0.5-0.3-0.8c0-0.5,0-0.5-0.5-0.5'+
							'c-1.7,0.1-3.4,0.2-5,0c-1.5-0.2-3-0.4-4.5-0.9c-0.6-0.3-1.2-0.5-1.8-0.8c-0.5-0.2-1,1.1-1.2,1.5c-0.5,0.9-1.3,1.9-2.4,2'+
							'c-0.6,0-1.1,0.1-1.7-0.1c-0.8-0.3-1.4-0.7-2.2-1.1c-1.3-0.7-2.5-1.6-3.6-2.6c-1.2-1-2.8-1.9-3.1-3.5c0.4-1.1,0.9-1.6,2.1-1.7'+
							'c0.4,0,1.1-0.1,1.4-0.5c0.2-0.2,0.1-0.5,0.1-0.8c-0.1-0.5,0-0.8,0.2-1.3c0.5-1.2,2.3-0.3,3.1-0.2c0.4-0.3,0.6-0.9,0.9-1.3'+
							'c0.4-0.6,0.7-0.6,0.6-1.4c-0.6-6.4,3-11.9,5.9-17.3c0.4-0.8,0.9-1.6,1.4-2.4c0.4-0.6,0.3-1.6,0.3-2.3c0-2-0.1-4-0.1-6'+
							'c0-1.7,0.3-3,1.7-4.2C22.9,0.9,24.5,0,26.3,0z')
							.attr('transform', 'translate(-30,-25)');

							elm.append('path')
							.style('fill', '#FFF')
							.attr('d', 'M28.5,7.6c0.3,0.2,0.8,0.4,0.8,0.8c0,0.4,0,0.9-0.1,1.3'+
							'c-0.1,0.3-0.2,0.7-0.5,1c-0.4,0.5-0.9,0.3-1.4,0.1c1.1-0.4,1.7-1.9,0.6-2.7c-0.5-0.4-1.1-0.3-1.5,0.3c-0.4,0.7-0.3,1.4,0.1,2.1'+
							'c-0.2-0.2-0.6-0.2-0.7-0.5c-0.2-0.5-0.3-1.1-0.2-1.7c0.1-0.8,0.5-0.8,1.2-0.9C27.4,7.4,28,7.4,28.5,7.6z')
							.attr('transform', 'translate(-30,-25)');

							elm.append('path')
							.style('fill', '#FFF')
							.attr('d', 'M22.4,7.6c0.2,0.1,0.5,0.1,0.6,0.3c0.2,0.4,0.2,0.8,0.3,1.3'+
							'c0,0.3,0,0.6-0.1,1c-0.1,0-0.4,0.4-0.5,0.2c0.3-0.8,0-2.8-1.2-2.1c-1,0.6-0.6,2.3,0.3,2.7c-0.6,0.3-0.7,0.3-1-0.3'+
							'c-0.2-0.6-0.4-1.1-0.3-1.7c0-0.6,0-0.8,0.6-1.2C21.6,7.6,21.9,7.6,22.4,7.6z')
							.attr('transform', 'translate(-30,-25)');

							elm.append('path')
							.style('fill', '#FFF')
							.attr('d', 'M28.7,14.3c0.3,0.9,0.4,1.9,0.8,2.9c0.4,1,0.8,1.9,1.3,2.8'+
							'c0.9,1.9,1.9,3.9,2.7,5.9c0.7,1.9,1.4,3.8,0.9,5.9c-0.2,0.9-0.4,2-0.9,2.8c-0.1,0.2-0.4,0.3-0.5,0.5c-0.3,0.4-0.4,1-0.4,1.5'+
							'c-0.7-0.1-1.3-0.7-2.1-0.5c-0.8,0.2-0.8,1.6-0.9,2.2c-0.1,1.1-0.1,2.2-0.2,3.3c0,0.2,0,0.5,0,0.7c-0.3,0.2-0.6,0.3-0.9,0.5'+
							'c-0.5,0.2-1,0.4-1.4,0.5c-2,0.5-4.4,0.4-6.3-0.1c-0.4-0.1-0.9-0.2-1.3-0.4c-0.6-0.2-1-0.3-0.8-1c0.2-1-0.7-2.3-1.1-3.2'+
							'c-1-2.1-1.6-4.3-2.5-6.5c-0.2-0.5-0.4-0.9-0.5-1.4c-0.2-0.3,0.1-1,0.2-1.2c0.3-1.1,0.8-2.1,1.3-3.2c0.5-0.9,1.1-1.9,1.5-2.8'+
							'c0.4-1,0.5-2.1,1-3.1c0.4-0.9,0.9-1.8,1.4-2.7c0.5-0.9,0.8-2,1.3-2.9c1.2,1.1,2.2,1.1,3.8,1.1c0.7-0.1,1.3-0.3,1.9-0.5'+
							'C27.2,15,28.6,14.1,28.7,14.3z')
							.attr('transform', 'translate(-30,-25)');

							elm.append('path')
							.style('fill', '#f5c055')
							.attr('d', 'M24.7,9.6c0.9,0.3,1.5,0.9,2.4,1.3c0.9,0.4,2.1,0.2,2.5,1.2'+
							'c0.4,1.1-0.7,1.6-1.5,2.1c-1,0.6-2,1-3.1,1.2c-1.2,0.1-2.3,0.2-3.3-0.5c-0.7-0.5-1.5-1.1-1.5-2.1c0.1-1.2,1.1-1.3,2-1.8'+
							'C22.9,10.6,23.9,9.4,24.7,9.6z')
							.attr('transform', 'translate(-30,-25)');

							elm.append('path')
							.style('fill', '#f5c055')
							.attr('d', 'M13.7,34.6c0.6,0.2,0.9,1.1,1.2,1.7c0.4,1,0.8,2.1,1.1,3.1'+
							'c0.6,1.9,1,3.9,1,6c0,1.7-1.3,2.9-3,2.9c-1,0-1.8-0.5-2.6-0.9c-1-0.5-1.8-1.1-2.7-1.7c-1.5-1.1-3.7-2.4-4.3-4.1'+
							'C4,40.8,5,39.9,5.9,39.9c0.7-0.2,1.5,0,1.9-0.8c0.3-0.5-0.1-1.3,0.2-1.9c0.4-0.8,1.5-0.4,2.2-0.2c0.4,0.1,0.6,0.3,0.9-0.1'+
							'c0.4-0.4,0.6-0.9,0.9-1.4C12.2,35.3,13.6,34.1,13.7,34.6z')
							.attr('transform', 'translate(-30,-25)');

							elm.append('path')
							.style('fill', '#f5c055')
							.attr('d', 'M31.6,36.3c0.3,0,0.6,0.3,0.9,0.3c0.1,0.5-0.1,0.9,0.1,1.4'+
							'c0.2,0.9,1.2,1.5,2,1.7c2,0.7,2.6-1.1,3.4-2.6c0.5,0.2,0.4,1.1,0.6,1.6c0.3,0.7,1.1,0.7,1.8,0.5c1.5-0.2,3.9-0.1,3.2,2'+
							'c-1,1.4-2,2.7-3.1,4c-0.6,0.5-1,1.2-1.6,1.7c-0.6,0.5-1.2,0.9-1.8,1.4c-1.4,1.1-2.7,1.8-4.5,1.3c-2-0.5-2.3-2.6-2.6-4.3'+
							'c-0.4-1.9-0.4-3.9-0.3-5.9c0.1-0.9,0.2-1.7,0.3-2.6C30.1,36.2,31,35.8,31.6,36.3z')
							.attr('transform', 'translate(-30,-25)');

							appendText(elm);
						} 

						else if(d.type === "os" && d.name === "Windows") {
							elm.append('polygon')
								.style('fill', '#fff')
								.attr('points', '8.8,14.4 38,9.3 38,40.7 8.8,35.7 ')
								.attr('transform', 'translate(-40,-40) scale(1.7)');

							elm.append('polygon')
								.style('fill', '#00AEEF')
								.attr('points', '36.1,24.4 36.1,11.9 21.7,14 21.7,24.4 ')
								.attr('transform', 'translate(-40,-40) scale(1.7)');

							elm.append('polygon')
								.style('fill', '#00AEEF')
								.attr('points', '20.7,14.1 10.2,15.6 10.2,24.4 20.7,24.4 ')
								.attr('transform', 'translate(-40,-40) scale(1.7)');

							elm.append('polygon')
								.style('fill', '#00AEEF')
								.attr('points', '10.2,25.4 10.2,34.3 20.7,35.9 20.7,25.4 ')
								.attr('transform', 'translate(-40,-40) scale(1.7)');
								
							elm.append('polygon')
								.style('fill', '#00AEEF')
								.attr('points', '21.7,36 36.1,38.1 36.1,25.4 21.7,25.4 ')
								.attr('transform', 'translate(-40,-40) scale(1.7)');

							appendText(elm);
						} 

						else if(d.type === "os" && d.name === "MacOS") {
							elm.append('path')
							.style('fill', '#828487')
							.attr('d', 'M28.8,13.7c0.9-1.2,1.6-2.8,1.3-4.5c-1.5,0.1-3.2,1-4.2,2.3c-0.9,1.1-1.7,2.8-1.4,4.4'+
							'C26.2,15.9,27.9,15,28.8,13.7z M33.2,21.7c0.4-1.3,1.4-2.4,2.7-3.2c-1.4-1.8-3.4-2.8-5.3-2.8c-2.5,0-3.5,1.2-5.2,1.2'+
							'c-1.8,0-3.1-1.2-5.3-1.2c-2.1,0-4.3,1.3-5.8,3.5c-0.5,0.8-0.9,1.8-1.1,2.9c-0.5,3.1,0.3,7.2,2.7,10.9c1.2,1.8,2.7,3.8,4.7,3.8'+
							'c1.8,0,2.3-1.2,4.8-1.2c2.4,0,2.9,1.2,4.7,1.2c2,0,3.6-2.2,4.8-4c0.8-1.3,1.1-1.9,1.8-3.3C33.5,28.2,32.2,24.6,33.2,21.7z')
							.attr('transform', 'translate(-40,-40) scale(1.7)');

							appendText(elm);
						} 

						else if (d.type === "endpoint") {
							//CIRCLE
							elm.append("svg:circle")
								.attr("cx", function(d) { return d.x; })
								.attr("cy", function(d) { return d.y; })
								.attr("r", function(d) {return logslider(d["width"]); })
								.attr("fill", function(d) {return color(d.type);} )
								// .attr("fill", function(d, i) { if (i>0) { return  color(d.type); } else { return palette.gray } } )
								.style("stroke-width", "1.5px")
								.style("stroke", "#fff")

							// appendText(elm);
						}

						else if (d.type === "network") {
							//world map
                            elm.append('svg:path')
                                .attr('transform', 'translate(-36,-36) scale(2,2)')
                                .attr('d', 'M18,0C8.059,0,0,8.06,0,18.001C0,27.941,8.059,36,18,36c9.94,0,18-8.059,18-17.999C36,8.06,27.94,0,18,0z')
                                .attr('fill', '#67AAB5');
                            elm.append('svg:path')
                                .attr('transform', 'translate(-36,-36) scale(2,2)')
                            	.attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
                                    'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
                                    'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
                                    'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
                                    'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
                                    'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
                                    'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
                                    'l0.959-3.195l-2.882-1.775L24.715,19.976z')
                                .attr('fill', '#595A5C');
						}

						else {
							//CIRCLE
							elm.append("svg:circle")
								.attr("cx", function(d) { return d.x; })
								.attr("cy", function(d) { return d.y; })
								.attr("r", function(d) {return logslider(d["width"]); })
								.attr("fill", function(d) {return color(d.type);} )
								.style("stroke-width", "1.5px")
								.style("stroke", "#fff")

							appendText(elm);
						}
					})

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
//NETWORK CHART ENDS HERE

angular.module('mean.pages').directive('makeStealthForceChart', ['$timeout', '$rootScope', '$location', function ($timeout, $rootScope, $location) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('stealthForceChart', function (event, data, params) {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
                    var width = $('#stealthforcechart').width();
                    var height = width/1.5;
                    var tCount = [];
                    data.links.forEach(function(d) {
                        tCount.push(d.value);
                    });
                    var maxNum = Math.max.apply(Math, tCount);

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
                        "yellow": "#E9D805",
                        "orange": "#FFA500",
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
                    var color = function(group, type) {
                        if (group === 0) { //stealth role/group/coi node
                            if(type === "role") {
                                return palette.pink;
                            } else if(type === "group") {
                                return palette.purple;
                            } else if(type === "coi") {
                                return palette.green;
                            } 
                            
                        } else if (group === 1) { //IP node with 1 COI group
                            return palette.blue;
                        } else if (group === 2) { //IP node with 2 COI groups
                            return palette.gray;
                        } else if (group === 3) { //etc...
                            return palette.yellow;
                        } else if (group === 4) {
                            return palette.orange;
                        } else {
                            return palette.red;
                        }
                    }
                    function logslider(x) {
                        if (x === undefined) {
                            return 18;
                        }
                        // position will be between 0 and 100
                        // if(x > 50) {
                        //  x = 50;
                        // }
                        var minp = 0;
                        var maxp = maxNum;
                        // The result should be between 100 an 10000000
                        var minv = Math.log(5);
                        var maxv = Math.log(50);
                        // calculate adjustment factor
                        var scale = (maxv-minv) / (maxp-minp);
                        return Math.exp(minv + scale*(x-minp));
                    }

                    var circleWidth = 5;
                    var vis = d3.select("#stealthforcechart")
                        .append("svg:svg")
                        .attr("class", "stage")
                        .attr("width", width)
                        .attr("height", height);
                    var force = d3.layout.force()
                        .nodes(data.nodes)
                        .links(data.links)
                        .gravity(0.20)
                        .linkDistance(20)
                        .charge(-2000)
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
                    })

                    //MOUSEOUT
                    .on("mouseout", function(d,i) {
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
                    })

                    .call(force.drag);

                    // Add tooltip
                    $scope.tip = d3.tip()
                        .attr('class', 't-tip')
                        .offset([-50, 0])
                        .html(function(d) {

                            var title = "<strong>Rules: </strong> <br />";
                            var rules = "";
                            for(var i = 0; i < d.rules.length; i++) {
                            //     if(d.rules[i].order === 1) {
                            //         if(d.rules[i].rule !== "-"){
                            //             ret += d.cois[i] + ":<br />" +
                            //                 "&nbsp&nbsp&nbsp" + d.rules[i].order + " " + d.rules[i].rule + "<br />";
                            //         } else {
                            //             ret += d.cois[i] + "<br />";
                            //         }
                            //     } else {
                                if(d.rules[i].rule !== "-"){
                                    rules += "&nbsp&nbsp&nbsp" + d.rules[i].order + " " + d.rules[i].rule + "<br />";
                                }
                            //     }
                                
                            }
                            if(rules === "") {
                                return title + "None";
                            }
                            else {
                                return title + rules;
                            }
                            
                        });

                    vis.call($scope.tip);

                    //CIRCLE
                    node.each(function(d){
                        var elm = d3.select(this)
                        if (d.gateway === 1) {
                            elm.append('svg:path')
                                .attr('transform', 'translate(-18,-18)')
                                .attr('d', 'M18,0C8.059,0,0,8.06,0,18.001C0,27.941,8.059,36,18,36c9.94,0,18-8.059,18-17.999C36,8.06,27.94,0,18,0z')
                                .attr('fill', '#67AAB5');
                            elm.append('svg:path')
                                .attr('transform', 'translate(-18,-18)')
                                .attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
                                    'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
                                    'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
                                    'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
                                    'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
                                    'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
                                    'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
                                    'l0.959-3.195l-2.882-1.775L24.715,19.976z')
                                .attr('fill', '#595A5C');
                        } else if(d.type === "user") {
                            elm.append("rect")
                            .attr("width", 22)
                            .attr("height", 22)
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; })
                            .attr("fill", function(d, i) { return  color(d.group, d.type); })
                            .style("stroke-width", "1.5px")
                            .style("stroke", "#fff");
                        } else {
                            elm.append("svg:circle")
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; })
                            .attr("r", function (d) {return logslider(d["width"]); })
                            .attr("fill", function(d, i) { return  color(d.group, d.type); })
                            .style("stroke-width", "1.5px")
                            .style("stroke", "#fff")
                        }
                        
                        if(d.type === "user") {
                            elm.on('mouseover', function(d){
                                elm.style('cursor', 'pointer')
                            })
                            // .on("click", function (d){
                            //     var link = {user: d.name};
                            //     if ($location.$$search.start && $location.$$search.end) {
                            //         link.start = $location.$$search.start;
                            //         link.end = $location.$$search.end;
                            //     }
                            //     $scope.$apply($location.path('user_local').search(link));
                            // });
                        } else if(d.type === "coi") {
                            elm.on('mouseover', function(d){
                                elm.style('cursor', 'pointer')
                            }).on("click", function (d){
                                // Do nothing (no link from rule for now)
                            }).on('mouseover', $scope.tip.show)
                                .on('mouseout', $scope.tip.hide);
                        } else {
                            elm.on('mouseover', function(d){
                                elm.style('cursor', 'pointer')
                            })
                            .on('mouseout', "")
                            .on("click", function (d){
                                // Do nothing (no link from group/role for now)
                            });
                        }
                    })

                    //LEGEND

                    var legend_color = function(legend_item) {
                        if (legend_item === "Role") { 
                            return palette.pink;
                        } else if (legend_item === "Group") { 
                            return palette.purple;
                        } else if (legend_item === "COI") { 
                            return palette.green;
                        } else if (legend_item === "User with one role") { //IP node with 1 COI group
                            return palette.blue;
                        } else if (legend_item === "User with two roles") { //IP node with 2 COI groups
                            return palette.gray;
                        } else if (legend_item === "User with three roles") { //etc...
                            return palette.yellow;
                        } else if (legend_item === "User with four roles") {
                            return palette.orange;
                        } else {
                            return palette.red;
                        }
                    }

                    var circle_legend_data = ["Role", "Group", "COI"];
                    var circle_legend = vis.selectAll(".circle_legend")
                        .data(circle_legend_data)
                        .enter().append("g")
                        .attr("class", "circle_legend")
                        .attr("transform", function(d, i) { return "translate(11," + (i+5) * 23 + ")"; });

                    circle_legend.append("circle")
                        .attr("r", function (d) {return logslider(d["width"]) - 7; })
                        .style("fill", function(d) { return legend_color(d) });

                    circle_legend.append("text")
                        .attr("x",15)
                        .attr("y", -1)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

                    var legend_data = ["User with one role", "User with two roles", 
                        "User with three roles", "User with four roles", "User with five or more roles"];

                    var legend = vis.selectAll(".legend")
                        .data(legend_data)
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(2," + i * 20 + ")"; });

                    legend.append("rect")
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", function(d) { return legend_color(d) });

                    legend.append("text")
                        .attr("x", 23)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

                    var gateway_legend = vis.selectAll(".gateway_legend")
                        .data(["Internet Gateway"])
                        .enter().append("g")
                        .attr("class", "gateway_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                    gateway_legend.append('svg:path')
                        .attr('transform', 'translate(0,176)')
                        .attr('d', 'M18,0C8.059,0,0,8.06,0,18.001C0,27.941,8.059,36,18,36c9.94,0,18-8.059,18-17.999C36,8.06,27.94,0,18,0z')
                        .attr('fill', '#67AAB5');

                    gateway_legend.append('svg:path')
                        .attr('transform', 'translate(0,176)')
                        .attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
                            'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
                            'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
                            'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
                            'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
                            'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
                            'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
                            'l0.959-3.195l-2.882-1.775L24.715,19.976z')
                        .attr('fill', '#595A5C');

                    gateway_legend.append("text")
                        .attr("x", 40)
                        .attr("y", 194)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

                    //TEXT
                    node.append("text")
                        .text(function(d, i) { return d.name })
                        .attr("x",    function(d, i) { return circleWidth + 5; })
                        .attr("y",            function(d, i) { return circleWidth + 0 })
                        // .attr("font-family",  "Bree Serif")
                        // .attr("fill",         function(d, i) {  return  palette.paleryellow;  })
                        .attr("font-size",    function(d, i) {  return  "1em"; })
                        .attr("text-anchor",  function(d, i) { return  "beginning"; })  

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

angular.module('mean.pages').directive('makeTreeChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
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