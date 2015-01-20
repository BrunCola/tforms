'use strict';

angular.module('mean.pages').directive('head', function() {
    // This appends the page head (title and calendar) to all pages, so they can have their own controller
    return {
        restrict: 'A',
        scope : {
            title : '@'
        },
        templateUrl : 'public/pages/views/head.html',
        transclude : true
    };
});

angular.module('mean.pages').directive('iocDesc', function() {
    return {
        link: function($scope, element, attrs) {
            $scope.$on('iocDesc', function (event, description) {
                if (!description) { return }
                    var maxLength = 160;
                // if the string is less then our max length..
                if (description.length < maxLength) {
                    $(element).html(description);
                // otherwise, trim and add link to modal
                // NOTE: MODAL SETTINGS ARE CUSTOM IN EACH CONTROLLER
                } else {
                    var subString = description.substring(0, maxLength);
                    $(element).html(subString+'... <a href="javascript:void(0);"><strong>Read More</strong></a>');
                    $(element).on('click', function(){
                        $scope.description(description);
                    });
                }                                
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
                    "aaData": $scope.data,
                    "sDom": '<"clear"C>T<"clear">r<"table_overflow"t>ip',
                    "bDestroy": true,
                    "bFilter": true,
                    "bRebuild": true,
                    "aoColumns": $scope.columns,
                    "iDisplayLength": 10,
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

angular.module('mean.pages').directive('loadingSpinner', ['$rootScope', function ($rootScope) {
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
                // /$('html, body').animate({scrollTop:0}, 'slow');
                window.onscroll = function (event) {
                    $('html, body').stop( true, true ).animate();
                }
                $(".page-content").fadeTo(500, 1);
            });
            $rootScope.$on('spinnerShow', function (event) {
                $('.page-content').fadeTo(500, 0.7);
                var target = document.getElementById('loading-spinner');
                var spinner = new Spinner(opts).spin(target);
                $(target).data('spinner', spinner);
                // // /$('html, body').animate({scrollTop:0}, 'slow');
                // window.onscroll = function (event) {
                //     $('html, body').start( true, true ).animate();
                // }
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

// angular.module('mean.pages').directive('severityLevels', ['$timeout', function ($timeout) {
//     return {
//         link: function ($scope, element, attrs) {
//             $('.alert').on('click',function(){
//                 alert('test');
//             });
//             function updateSevCounts(sevcounts) {
//                 $('#severity').children().addClass('severity-deselect');
//                 for (var s in sevcounts) {
//                     if (sevcounts[s].value === 0) {
//                         $('#al'+sevcounts[s].key).html(' '+sevcounts[s].value+' ');
//                         $('.alert'+sevcounts[s].key).addClass('severity-deselect');
//                     } else {
//                         $('#al'+sevcounts[s].key).html(' '+sevcounts[s].value+' ');
//                         $('.alert'+sevcounts[s].key).removeClass('severity-deselect');
//                     }
//                 }
//             }

//             $scope.$on('severityLoad', function () {
//                 $('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert1 alert"><i class="fa fa-flag"></i> GUARDED -<span id="al1" style="font-weight:bold"> 0 </span></button>');
//                 $('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert2 alert"><i class="fa fa-bullhorn"></i> ELEVATED -<span id="al2" style="font-weight:bold"> 0 </span></button>');
//                 $('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert3 alert"><i class="fa fa-bell"></i> HIGH -<span id="al3" style="font-weight:bold"> 0 </span></button>');
//                 $('#severity').append('<button style="min-width:120px" class="severity-btn btn mini alert4 alert"><i class="fa fa-exclamation-circle"></i> SEVERE -<span id="al4" style="font-weight:bold"> 0 </span></button>');
//                 $scope.severityDim = $scope.crossfilterData.dimension(function(d){return d.ioc_severity;});
//                 $scope.sevcounts = $scope.severityDim.group().reduceSum(function(d) {return d.count;}).top(Infinity);
//                 updateSevCounts($scope.sevcounts);
//                 $('.alert1').on('click',function(){
//                     $scope.severityDim.filterAll();
//                     var arr = [];
//                     if ($('.alert1').hasClass('selected')) {
//                         $('.alert1').removeClass('selected');
//                     } else {
//                         for(var i in $scope.severityDim.top(Infinity)) {
//                             if ($scope.severityDim.top(Infinity)[i].ioc_severity === 1) {
//                                 arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
//                             }
//                         }
//                         $scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
//                         $('.alert1').addClass('selected');
//                     }
//                     $scope.$broadcast('crossfilterToTable');
//                     dc.redrawAll();
//                     updateSevCounts($scope.sevcounts);
//                 });
//                 $('.alert2').on('click',function(){
//                     $scope.severityDim.filterAll();
//                     var arr = [];
//                     if ($('.alert2').hasClass('selected')) {
//                         $('.alert2').removeClass('selected');
//                     } else {
//                         for(var i in $scope.severityDim.top(Infinity)) {
//                             if ($scope.severityDim.top(Infinity)[i].ioc_severity === 2) {
//                                 arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
//                             }
//                         }
//                         $scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
//                         $('.alert2').addClass('selected');
//                     }
//                     $scope.$broadcast('crossfilterToTable');
//                     dc.redrawAll();
//                     updateSevCounts($scope.sevcounts);
//                 });
//                 $('.alert3').on('click',function(){
//                     $scope.severityDim.filterAll();
//                     var arr = [];
//                     if ($('.alert3').hasClass('selected')) {
//                         $('.alert3').removeClass('selected');
//                     } else {
//                         for(var i in $scope.severityDim.top(Infinity)) {
//                             if ($scope.severityDim.top(Infinity)[i].ioc_severity === 3) {
//                                 arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
//                             }
//                         }
//                         $scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
//                         $('.alert3').addClass('selected');
//                     }
//                     $scope.$broadcast('crossfilterToTable');
//                     dc.redrawAll();
//                     updateSevCounts($scope.sevcounts);
//                 });
//                 $('.alert4').on('click',function(){
//                     $scope.severityDim.filterAll();
//                     var arr = [];
//                     if ($('.alert4').hasClass('selected')) {
//                         $('.alert4').removeClass('selected');
//                     } else {
//                         for(var i in $scope.severityDim.top(Infinity)) {
//                             if ($scope.severityDim.top(Infinity)[i].ioc_severity === 4) {
//                                 arr.push($scope.severityDim.top(Infinity)[i].ioc_severity);
//                             }
//                         }
//                         $scope.severityDim.filter(function(d) { return arr.indexOf(d) >= 0; });
//                         $('.alert4').addClass('selected');
//                     }
//                     $scope.$broadcast('crossfilterToTable');
//                     dc.redrawAll();
//                     updateSevCounts($scope.sevcounts);
//                 });
//             });
//             $scope.$on('severityUpdate', function () {
//                 updateSevCounts($scope.sevcounts);
//             });
//         }
//     };
// }]);

angular.module('mean.pages').directive('severityLevels', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        scope : {
            title : '@'
        },
        template : '<button ng-click="clicked(\'guarded\')" style="min-width:120px" ng-class="(levels.guarded.active) ? \'severity-btn btn mini alert1 alert\' : \'severity-btn btn mini alert1 alert severity-deselect\'"><i class="fa fa-flag"></i> GUARDED -<span id="al1" style="font-weight:bold"> {{levels.guarded.value}} </span></button>'+
            '<button ng-click="clicked(\'elevated\')" style="min-width:120px" ng-class="(levels.elevated.active) ? \'severity-btn btn mini alert2 alert\' : \'severity-btn btn mini alert2 alert severity-deselect\'"><i class="fa fa-bullhorn"></i> ELEVATED -<span id="al2" style="font-weight:bold"> {{levels.elevated.value}} </span></button>'+
            '<button ng-click="clicked(\'high\')" style="min-width:120px" ng-class="(levels.high.active) ? \'severity-btn btn mini alert3 alert\' : \'severity-btn btn mini alert3 alert severity-deselect\'"><i class="fa fa-bell"></i> HIGH -<span id="al3" style="font-weight:bold"> {{levels.high.value}} </span></button>'+
            '<button ng-click="clicked(\'severe\')" style="min-width:120px" ng-class="(levels.severe.active) ? \'severity-btn btn mini alert4 alert\' : \'severity-btn btn mini alert4 alert severity-deselect\'"><i class="fa fa-exclamation-circle"></i> SEVERE -<span id="al4" style="font-weight:bold"> {{levels.severe.value}} </span></button>',
        transclude : true,
        link: function($scope, element, attrs) {
            // create an empty object called active filter
            var activeFilters = {};
            // on load set all buttons to active
            $scope.levels = {
                guarded: {
                    value: 0,
                    active: false
                },
                elevated: {
                    value: 0,
                    active: false
                },
                high: {
                    value: 0,
                    active: false
                },
                severe: {
                    value: 0,
                    active: false
                }
            }
            // $scope.$broadcast('outFilter', params.outgoingFilter, 'severityTYPE')
            $scope.$on('severityLevels', function (event, dimension, group, params) {
                $scope.clicked = function(type) {
                    // add/remove it to/from activeFitlers
                    if (type in activeFilters) {
                        delete activeFilters[type];
                    } else {
                        activeFilters[type] = true;
                    }                    
                    // set everything other than the one selected or in our current active filters to false
                    for (var i in $scope.levels) {
                        if (!(i in activeFilters)) {
                            $scope.levels[i].active = false;
                        } else {
                            if ($scope.levels[i].value !== 0) { // only activate if the value > 0
                                $scope.levels[i].active = true;
                            }
                        }
                    }
                    // if the fitler array is empty, reactivate all the buttons
                    if (jQuery.isEmptyObject(activeFilters)) {
                        for (var a in $scope.levels){
                            if ($scope.levels[a].value !== 0) { // only activate if the value > 0
                                $scope.levels[a].active = true;
                            }
                        }
                    }                   
                }
                function update() {
                    group.top(Infinity).map(function(d){
                        switch(d.key) {
                            case 1:
                                $scope.levels.guarded.value = d.value;
                                $scope.levels.guarded.active = true;
                                break;
                            case 2:
                                $scope.levels.elevated.value = d.value;
                                $scope.levels.elevated.active = true;
                                break;
                            case 3:
                                $scope.levels.high.value = d.value;
                                $scope.levels.high.active = true;
                                break;
                            case 4:
                                $scope.levels.severe.value = d.value;
                                $scope.levels.severe.active = true;
                                break;
                        }
                    })
                }
                update();
                $scope.$on('crossfilter-render', function () {
                    update();
                });
                $scope.$on('crossfilter-redraw', function () {
                    update();
                });
                $scope.$on('outFilter', function () {
                    $timeout(function(){
                        update();
                    }, 0, true);
                });
            })
        }
    };
}]);

angular.module('mean.pages').directive('datePicker', ['$window', '$timeout', '$location', '$rootScope', '$state', '$stateParams', 'Global', 'dateRange', 'realTimeCheck', function ($window, $timeout, $location, $rootScope, $state, $stateParams, Global, dateRange, realTimeCheck) {
    return {
        link: function ($scope, element, attrs) {
            $timeout(function () {
                // check to see if realtime should be active on load
                realTimeCheck(function(status, elm){
                    $scope.$apply(function(){
                        $scope.realtime = status;
                        // enable and disable button where appropriate
                        $scope.realtimeElement = elm;
                    })
                    // add watch here to activate/disable reloads based on realtimecheck status
                    $scope.$watch('realtime', function(value){
                        $rootScope.realtimeTimer = value;
                        // store whatever change happens in session
                        if ($scope.realtime !== status) {
                            // place it in rootscope so we can use it for our interval function later
                            $window.sessionStorage.realtime = angular.toJson($scope.realtime);
                        }
                    })
                    $rootScope.$on('updateTime', function (event, time){
                        $scope.end = moment.unix(time.query.end).format('MMMM D, YYYY h:mm A');
                        $scope.start = moment.unix(time.remove).format('MMMM D, YYYY h:mm A');
                        // TEMPORARY for the lanegraph!!!!!!!!
                        $rootScope.end = moment.unix(time.query.end);
                        $rootScope.start = moment.unix(time.remove);
                    })
                });
                dateRange($scope, function(time){
                    // recieve time from service and set it in local scope
                    $scope.start = moment.unix(time.start).format('MMMM D, YYYY h:mm A');
                    $scope.end = moment.unix(time.end).format('MMMM D, YYYY h:mm A');
                    if ($scope.daterange) {
                        $('#daterange').daterangepicker(
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
                                $scope.$apply(function(){
                                    $scope.start = moment(start).format('MMMM D, YYYY h:mm A');
                                    $scope.end = moment(end).format('MMMM D, YYYY h:mm A');
                                    // TEMPORARY for the lanegraph!!!!!!!!
                                    $rootScope.start = moment(start);
                                    $rootScope.end = moment(end);
                                })
                            }
                        );
                        $('#daterange').on('apply', function(ev, picker) {
                            $rootScope.$broadcast('spinnerShow');
                            // disable realtime checkbox
                            $scope.realtimeElement = true;
                            // update url
                            var search = $location.$$search;
                            search.start = moment($scope.start).unix();
                            search.end = moment($scope.end).unix();
                            $location.search(search);
                            // broadcast to update functions
                            $rootScope.$broadcast('datePickerUpdated', {start: search.start, end: search.end}); // start and end are sent as unix
                        });
                    }
                })
            }, 0, false);
        }
    };
}]);

angular.module('mean.pages').directive('makeTable', ['$timeout', '$location', '$rootScope', 'iocIcon', 'appIcon', 'mimeIcon', '$http', 'timeFormat', function ($timeout, $location, $rootScope, iocIcon, appIcon, mimeIcon, $http, timeFormat) {
    return {
        link: function ($scope, element, attrs) {
            //2d array sort for sorting data for csv print
            function sortFunction(a, b) {
                var tableSort = $("#table").dataTable().fnSettings().aaSorting;
                var sortIndex = tableSort[0][0];
                var sortDirection = tableSort[0][1];
                if (a[sortIndex] === b[sortIndex]) {
                    return 0;
                } else {
                    if(sortDirection == "asc") {
                        return (a[sortIndex] < b[sortIndex]) ? -1 : 1
                    } else {
                        return (a[sortIndex] > b[sortIndex]) ? -1 : 1
                    }
                }
            }
            //function for export to csv
            var csv = "data:text/csv;&charset=utf-8,";
            function makeCsv(array, heading){
                csv += heading;
                // new line 
                csv += '\n';
                if (array.length > 0) {
                    // get object 0 length
                    var objlength = 0, tpos = 0;
                    for (var i in array[0]) {
                        objlength++;
                    }
                    csv += '\n\n';
                }
            }
            function redrawTable(dimension) {
                $('#table').dataTable().fnClearTable();
                $('#table').dataTable().fnAddData(dimension.top(Infinity));
                $('#table').dataTable().fnDraw();
            }
            // $scope.$on('tableLoad', function (event, tableData, params, tableType) {
            $scope.$on('table', function (event, data, dimension, params) {
                if ($location.$$absUrl.search('/report#!/') === -1) {
                    $(element).prepend('<div class="row-fluid"> '+
                    '<div class="span12"> '+
                            '<div class="jdash-header">'+data.title+'</div> '+
                            '<div class="box">'+
                                '<div class="box-content"> <button class="ColVis_Button bCsv ColVis_MasterButton printCSVButton" type="button" href="">Print to CSV</button>'+//<button type="button" class="rndCrnBtn pure-button right" ng-click="insert()">Print to .csv</button>'+
                                    '<table cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-hover display" id="'+data.div+'" ></table>'+
                                '</div> '+
                            '</div> '+
                        '</div> '+
                    '</div><br />');
                } else {
                    $(element).prepend('<div style="margin-bottom:17px;margin-left:0;"> '+
                        '<div class="row-fluid"> '+
                            '<div class="span12"> '+
                                '<div class="jdash-header">'+data.title+'</div> '+
                                '<div  class="box"> '+
                                    '<div class="box-content"> '+
                                        '<table class="table report-table" id="'+data.div+'" ></table>'+
                                    '</div> '+
                                '</div> '+
                            '</div> '+
                        '</div> '+
                    '</div><br />');
                }
                // prepend a page break if it's defined
                if (data.pagebreakBefore === true) {
                    $(element).prepend('<div style="page-break-before: always;"></div>');
                }
                var bFilter,iDisplayLength,bStateSave,bPaginate,sDom,bDeferRender,notReport,stateSave;
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
                var table = $('#'+data.div).dataTable({
                    'aaData': dimension.top(Infinity),
                    'aoColumns': data.params,
                    'bDeferRender': bDeferRender,
                    'bDestroy': true,
                    //'bProcessing': true,
                    //'bRebuild': true,
                    'aaSorting': data.sort,
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
                        if ((aData.lan_stealth !== undefined) && ($scope.r.indexOf('lan_stealth') !== -1)) {      
                            if (aData.lan_stealth > 0){
                                $('td:eq('+$scope.r.indexOf("lan_stealth")+')', nRow).html('<span style="color:#000" class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-shield fa-stack-1x fa-inverse"></i></span>');
                            }else {
                              $('td:eq('+$scope.r.indexOf("lan_stealth")+')', nRow).html('');
                            }
                        }
                        if (aData.proxy_blocked !== undefined && $scope.r.indexOf('proxy_blocked') !== -1) {
                            if (aData.proxy_blocked == 0){
                                $('td:eq('+$scope.r.indexOf("proxy_blocked")+')', nRow).html('<span style="color:#000" class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-check fa-stack-1x fa-inverse"></i></span>');
                            } else if (aData.proxy_blocked > 0) {
                                $('td:eq('+$scope.r.indexOf("proxy_blocked")+')', nRow).html('<span style="color:#E71010 " class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-times fa-stack-1x fa-inverse"></i></span>');
                            }
                        }
                        if (aData.receiptto && $scope.r.indexOf('receiptto') !== -1) {
                            var newVar = aData.receiptto.replace(/[\<\>]/g,'');
                            $('td:eq('+$scope.r.indexOf("receiptto")+')', nRow).html(newVar);
                        }
                        if (aData.time && $scope.r.indexOf('time') !== -1) {
                            $('td:eq('+$scope.r.indexOf("time")+')', nRow).html('<div style="min-width:100px">'+timeFormat(aData.time, 'tables')+'</div>');
                        }
                        if (aData.lan_ip && $scope.r.indexOf('lan_ip') !== -1) {
                            $('td:eq('+$scope.r.indexOf("lan_ip")+')', nRow).html(aData.lan_ip);
                        }
                        if (aData.file !== undefined) {                                        
                            if (aData.file && $scope.r.indexOf('file') !== -1) {
                                if (aData.file > 0){                                                
                                    $('td:eq('+$scope.r.indexOf("file")+')', nRow).html(aData.file);    
                                }
                            } else {
                                $('td:eq('+$scope.r.indexOf("file")+')', nRow).html("0"); 
                            }
                        }
                        if (notReport) {
                            // url builder
                            for (var c in $scope.e) {
                                var type = $scope.e[c].link.type;
                                if ($scope.e[c].bVisible !== undefined) {
                                    if ($scope.e[c].bVisible) {
                                        switch(type) {
                                            case 'Archive':
                                                $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bArchive button-error pure-button' type='button' value='"+JSON.stringify(aData)+"' href=''>Archive</button>");
                                            break;
                                            case 'Restore':
                                                $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bRestore button-success pure-button' type='button' value='"+JSON.stringify(aData)+"' href=''>Restore</button>");
                                            break;
                                            case 'Upload Image':
                                                $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bUpload button-success pure-button' type='button' value='"+JSON.stringify(aData)+"' href=''>Upload Image</button>");
                                            break;
                                            default:
                                                var obj = new Object();
                                                if ($location.$$search.start && $location.$$search.end) {
                                                    obj.start = $location.$$search.start;
                                                    obj.end = $location.$$search.end;
                                                }
                                                for (var l in $scope.e[c].link.val) {
                                                    if ((aData[$scope.e[c].link.val[l]] !== null) && (aData[$scope.e[c].link.val[l]] !== undefined)) {
                                                        var newVar = aData[$scope.e[c].link.val[l]].toString();
                                                        obj[$scope.e[c].link.val[l]] = newVar.replace("'", "&#39;");
                                                    }
                                                }
                                                var links = JSON.stringify({
                                                    type: $scope.e[c].link.type,
                                                    objlink: obj
                                                });
                                                if ($scope.e[c].mData === 'time') {
                                                    $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<div style='height:50px;max-width:120px'><button class='bPage button-secondary pure-button' value='"+links+"'>"+timeFormat(aData[$scope.e[c].mData], 'tables')+"</button><br /><span style='font-size:9px; float:right;' data-livestamp='"+aData[$scope.e[c].mData]+"'></span></div>");
                                                } else {
                                                    $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bPage btn btn-link' type='button' value='"+links+"' href=''>"+timeFormat(aData[$scope.e[c].mData], 'tables')+"</button>");
                                                }
                                            break;
                                        }  
                                    }   
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
                                $http({method: 'POST', url: '/api/actions/archive', data: {lan_ip: rowData.lan_ip, remote_ip: rowData.remote_ip, ioc: rowData.ioc}}).
                                    success(function(data, status, headers, config) {
                                        var fil = dimension.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
                                        $scope.tableCrossfitler.remove(fil);
                                        dimension.filterAll();
                                        redrawTable(dimension);
                                    })
                            });
                            $('table .bRestore').on('click',function(){
                                var rowData = JSON.parse(this.value);
                                $http({method: 'POST', url: '/api/actions/restore', data: {lan_ip: rowData.lan_ip, remote_ip: rowData.remote_ip, ioc: rowData.ioc}}).
                                    success(function(data, status, headers, config) {
                                        var fil = dimension.filter(function(d) { if (d.time === rowData.time) {return rowData; }}).top(Infinity);
                                        $scope.tableCrossfitler.remove(fil);
                                        dimension.filterAll();
                                        redrawTable(dimension);
                                    })
                            });
                            $('table .bUpload').on('click',function(){
                                var rowData = JSON.parse(this.value);
                                $scope.uploadOpen(rowData);
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
                // $scope.$on('crossfilterToTable', function () {
                //     $('#table').dataTable().fnClearTable();
                //     $('#table').dataTable().fnAddData(dimension.top(Infinity));
                //     $('#table').dataTable().fnDraw();
                // });
                
                $scope.$on('table-redraw', function (event, term){
                    console.log(event)
                    console.log(term)
                    table.dataTable().fnFilter(term);
                })

                $.fn.dataTableExt.sErrMode = 'throw';

                $('.bCsv').on('click',function(){                                     
                    var array = [];
                    for (var i in data.aaData) {
                        //need to sort each value set into the order of the columns
                        var sortedRow = [];
                        for (var p in data.params){
                            for (var property in data.aaData[i]) {
                                if (data.params[p].mData == property) {
                                    sortedRow.push(data.aaData[i][property]);
                                } 
                            }
                        }
                        array.push(sortedRow);//push each sorted row as an array to the main array
                    }
                    //sort array by the sort of the datatable
                    array.sort(sortFunction);
                    var headerRow = [];
                    for (var p in data.params) {
                        if(data.data[p].sTitle != "") {
                            headerRow.push(data.data[p].sTitle);
                        }
                    }
                    //add the header row to the start of the array
                    array.unshift(headerRow);//array[0] will be the array of column headers 
                    makeCsv(array, data.title);//create the csv
                    var fileName = $location.url().replace("/", "");
                    //create the download
                    download(csv, fileName+"_CSV.csv", "text/csv");
                    csv = "data:text/csv;charset=utf-8,";
                });
            });
            // $scope.$on('tableUpdate', function (event, dimension, data, tableType) {
            //     redrawTable(dimension);
            // });

            function download(strData, strFileName, strMimeType) {
                var D = document,
                    a = D.createElement("a");
                    strMimeType = strMimeType;

                if (navigator.msSaveBlob) { // IE10
                    return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
                } 

                if ('download' in a) { //html5 A[download]
                    a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
                    a.setAttribute("download", strFileName);
                    a.innerHTML = "downloading...";
                    D.body.appendChild(a);
                    setTimeout(function() {
                        a.click();
                        D.body.removeChild(a);
                    }, 66);
                    return true;
                } 

                //do iframe dataURL download (old ch+FF):
                var f = D.createElement("iframe");
                D.body.appendChild(f);
                f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

                setTimeout(function() {
                    D.body.removeChild(f);
                }, 333);
                return true;
            } 
        }
    };
}]);

// angular.module('mean.pages').directive('universalSearch', function() {
//     return {
//         link: function($scope, element, attrs) {
//             $scope.$watch('search', function(){
//                 if ($scope.search) {
//                     if (($scope.search !== null) || ($scope.search !== '')) {
//                         $('#table').dataTable().fnFilter($scope.search);
//                         // var testSearch = searchFilter($scope.crossfilterData);
//                         // console.log(testSearch);
//                     }
//                 }
//             });
//         }
//     };
// });

// angular.module('mean.pages').directive('sevTable', ['$timeout', 'ngTableParams', '$filter', '$rootScope', 'searchFilter', '$location', function ($timeout, ngTableParams, $filter, $rootScope, searchFilter, $location) {
//     return {
//         restrict: 'E',
//         templateUrl : 'public/pages/views/sevtable.html',
//         transclude : true,
//         link: function($scope, element) {
//             $scope.$on('sevTable', function (event, result, dimension, params) {
//                 $scope.dat = dimension.top(Infinity);
//                 $scope.$watch('dat', function(d){
//                     console.log(d)
//                 })
//                 $scope.columns = result.params;
//                 $scope.colCount = $.grep(result.params, function(d){ return (d.visible) }).length + 1;
//                 $scope.tTotal = result.aaData.length;
//                 $scope.tableParams = new ngTableParams({
//                     page: 1,            // show first page
//                     count: 15,          // count per page
//                     // filter: {
//                     //     ioc: 'M'       // initial filter
//                     // }
//                     sorting: result.sort // sort object
//                 }, {
//                     total: $scope.tTotal, // length of data
//                     getData: function($defer, params) {
//                         // use build-in angular filter
//                         var orderedData = params.sorting() ? $filter('orderBy')(dimension.top(Infinity), params.orderBy()) : dimension.top(Infinity);
//                         $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
//                     }
//                 });
//                 $scope.openId = -1;
//                 $scope.toggle =  function(pid) {
//                     if (pid === $scope.openId) {
//                         $scope.openId = -1;
//                     } else { 
//                         $scope.openId = pid;
//                     }
//                 }
//                 // var searchFired = false;
//                 // $rootScope.$watch('search', function(){
//                 //     if (searchFired === true) {
//                 //         searchFilter(dimension, $rootScope.search);
//                 //         $scope.tableParams.reload();
//                 //     }
//                 //     searchFired = true;
//                 // })
//                 $scope.$on('table-redraw', function(event){
//                     $scope.tableParams.reload();
//                 })
//                 $scope.openLink = function(obj, row) {
//                     var page = obj.type;
//                     var params = {};
//                     for (var i in obj.val) {
//                         params[obj.val[i]] = row[obj.val[i]];
//                     }
//                     if ($location.$$search.start && $location.$$search.end) {
//                         params.start = $location.$$search.start;
//                         params.end = $location.$$search.end;
//                     }
//                     $location.path(page).search(params);
//                 }
//                 // $scope.expandTable = results.expand;
//                 $scope.$broadcast('spinnerHide');
//             })
//         }
//     };
// }]);
// 
// angular.module('mean.pages').directive('customSort', ['$filter', function ($filter) {
//     return {
//         restrict: 'A',
//         transclude: true,    
//         scope: {
//           order: '=',
//           sort: '='
//         },
//         template : 
//           ' <a ng-click="sort_by(order)" style="color: #555555;">'+
//           '    <span ng-transclude></span>'+
//           '    <i ng-class="selectedCls(order)"></i>'+
//           '</a>',
//         link: function(scope) {                
//             // change sorting order
//             scope.sort_by = function(newSortingOrder) {       
//                 var sort = scope.sort;
                
//                 if (sort.sortingOrder == newSortingOrder){
//                     sort.reverse = !sort.reverse;
//                 }                    

//                 sort.sortingOrder = newSortingOrder;        
//             };
//             scope.selectedCls = function(column) {
//                 if(column == scope.sort.sortingOrder){
//                     return ('icon-chevron-' + ((scope.sort.reverse) ? 'down' : 'up'));
//                 }
//                 else{            
//                     return'icon-sort' 
//                 } 
//             };      
//         }// end link
//     }
// }]);

angular.module('mean.pages').directive('sevTable', ['$timeout', '$filter', '$rootScope', '$location', '$http', 'timeFormat', '$window', function ($timeout, $filter, $rootScope, $location, $http, timeFormat, $window) {
    return {
        restrict: 'E',
        templateUrl : 'public/pages/views/sevtable.html',
        transclude : true,
        link: function($scope, element) {
            $scope.$on('sevTable', function (event, result, params) {
                $scope.$broadcast('spinnerHide');
                if (result === null) { return; }
                // on sevTable = $scope.table[name] = data
                // here create table div from element + name
                // TODO - add unique name in controller to post this in a key (in case direcive gets called multiple times)- i.e. $scope[name].table = this
                // result.sort = 22;

                $scope.tableColumns = result.params;
                $scope.tableData = params.crossfilterObj;
                $scope.tableData.sortBy($scope.tableColumns[result.sort[0][0]].mData, result.sort[0][1]);

                $scope.tableData.collection().map(function(d) {d.time = timeFormat(d.time, 'tables')})
                $scope.words = {};
                $scope.word = '';
                $scope.show_hide = false;

                if ($window.sessionStorage[$window.location.pathname.replace("/", '')] !== undefined) {
                    $scope.tableColumns = angular.fromJson($window.sessionStorage[$window.location.pathname.replace("/", '')])
                } else {
                    window.sessionStorage.setItem($window.location.pathname.replace("/", ''), JSON.stringify($scope.tableColumns));
                }               

                // -------------------table indexing variables ------------
                $scope.pageConstant = 50;
                $scope.pageNumber = $scope.pageConstant;
                $scope.pageOffset = -$scope.pageConstant;
                $scope.maxLength = $scope.tableData.collection().length;
                $scope.currentIndex = Math.ceil($scope.pageNumber/$scope.pageConstant);
                $scope.maxIndex = Math.ceil($scope.maxLength/$scope.pageConstant);
                $scope.nextButton = false;
                $scope.prevButton = true;
                // ^^^^^^^^^^^^^^^^^^^ table indexing variables ^^^^^^^^^^
                // 
                // 

                $scope.toggleShow = function () {
                    if ($scope.show_hide) {
                        $scope.show_hide = false;
                    } else {
                        $scope.show_hide = true;
                    }
                }
                $scope.$watch('tableData', function(olddata, newdata){
                    $scope.maxLength = $scope.tableData.collection().length;
                    if ($scope.pageNumber > $scope.maxLength) {
                        $scope.pageNumber = $scope.maxLength;
                        $scope.pageOffset = -($scope.maxLength)
                    } else {
                        $scope.pageNumber = $scope.pageConstant;
                        $scope.pageOffset = -$scope.pageConstant;
                    }
                    if ($scope.maxLength === 0) {
                        $scope.pageOffset = -1;
                    }
                    $scope.currentIndex = Math.ceil($scope.pageNumber/$scope.pageConstant);
                    $scope.maxIndex = Math.ceil($scope.maxLength/$scope.pageConstant);
                    checkButtons(); 
                    $scope.$broadcast('spinnerHide');
                }, true);

                $scope.showHide = function(col) {
                    setTimeout(function () {
                        $window.sessionStorage.setItem($window.location.pathname.replace("/", ''), JSON.stringify($scope.tableColumns));
                        $scope.tableColumns = angular.fromJson($window.sessionStorage[$window.location.pathname.replace("/", '')])
                    }, 0);
                }
                
                $scope.generateLink = function(data, column) {
                    var searchObj = {};
                    // add url date params to new page if they exist
                    if ($location.$$search.start && $location.$$search.end) {
                        searchObj.start = $location.$$search.start;
                        searchObj.end = $location.$$search.end;
                    }
                    // loop through defined links to genereate search object
                    if (column.link.val.length > 0) {
                        for (var i in column.link.val) {
                            searchObj[column.link.val[i]] = data[column.link.val[i]];
                        }
                    }
                    // finally hit page being requested with search params
                    $location.path(column.link.type).search(searchObj);
                }

                function checkButtons () {
                    if ($scope.pageNumber <=$scope.pageConstant) {
                        $scope.prevButton = true;
                        $scope.nextButton = false;
                    } else if ($scope.pageNumber >= $scope.maxLength) {
                        $scope.prevButton = false;
                        $scope.nextButton = true;
                    } else {
                        $scope.prevButton = false;
                        $scope.nextButton = false;
                    } 
                }

                $scope.decreasePage = function(n) {
                    $scope.pageNumber += n;
                    if ($scope.pageNumber <= $scope.pageConstant) {
                        $scope.pageNumber = $scope.pageConstant;
                    } 
                    $scope.pageOffset = -$scope.pageConstant;
                    checkButtons();
                    $scope.currentIndex = Math.ceil($scope.pageNumber/$scope.pageConstant);
                }

                $scope.setPage = function(n) {
                    $scope.pageNumber = (n+1)*$scope.pageConstant;
                    $scope.increasePage(0);
                }

                $scope.increasePage = function(n) {
                    $scope.pageNumber += n;
                    if (($scope.maxLength - $scope.pageNumber) <=0) {
                        $scope.pageOffset = -($scope.pageConstant) + ($scope.pageNumber-$scope.maxLength);
                    } else {
                        $scope.pageOffset = -$scope.pageConstant;
                    }
                    checkButtons(); 
                    if ($scope.pageNumber >= $scope.maxLength) {
                        $scope.pageNumber = ($scope.maxLength);
                    }
                    $scope.currentIndex = Math.ceil($scope.pageNumber/$scope.pageConstant);
                }

                //////////////////////////////
                ////// INCOMING FILTERS //////
                //////////////////////////////
                var activeFilters = {};
                function timeFilter(filters, value) {
                    if (filters===null) {return true}
                    if (((Date.parse(filters[0])/1000) <= value) && ((Date.parse(filters[1])/1000) >= value)) {
                        return true;
                    }             
                }
                function checkFilter(type, value, callback) {
                    if (type in activeFilters) { // if type is already defined
                        var index = activeFilters[type].indexOf(value);
                        if (index !== -1) { // if value is already in type
                            // remove it
                            activeFilters[type].splice(index, 1);
                            // delete array if its empty
                            callback();
                            return;
                        } else { // if no value in type
                            activeFilters[type].push(value);
                            callback();
                            return;
                        }
                    } else { // no type in filter
                        activeFilters[type] = [value];
                        callback();
                        return;
                    }
                }
                $scope.$on('outFilter', function (event, type, value){
                    if ((typeof type != 'object') || (!'table' in type)) { return }
                    var type = type['table'];
                    if (typeof value === 'object'){ // only if its time
                        $scope.$apply(function () {
                            params.crossfilterObj.filterBy(type, value, timeFilter);
                        });
                    } else {
                        checkFilter(type, value, function(){
                            $scope.$apply(function() {
                                var filter = activeFilters[type];
                                if (filter.length === 0) {
                                    $scope.tableData.filterBy(type, filter, $scope.tableData.filters.inArray());
                                } else {
                                    $scope.tableData.filterBy(type, filter, $scope.tableData.filters.inArray('some'));
                                }
                            })
                        })
                    }
                })
                //////////////////////////////
                //////  TABLE BUTTONS   //////
                //////////////////////////////
                $scope.generateButton = function(type, data) {
                    switch(type){
                        case 'Archive':
                            $http({method: 'POST', url: '/api/actions/archive', data: {lan_ip: data.lan_ip, remote_ip: data.remote_ip, ioc: data.ioc}}).
                                success(function(dataa, status, headers, config) {
                                    $scope.tableData.deleteModel(data);
                                })
                        break;
                        case 'Restore':
                            $http({method: 'POST', url: '/api/actions/restore', data: {lan_ip: data.lan_ip, remote_ip: data.remote_ip, ioc: data.ioc}}).
                                success(function(dataa, status, headers, config) {
                                    $scope.tableData.deleteModel(data);
                                })
                        break;
                        case 'Upload Image':     
                            $scope.uploadOpen(data);
                        break;
                    }
                }

            })
        }
    };
}]);

angular.module('mean.pages').filter('makeRange', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
        case 1:
            lowBound = 0;
            highBound = parseInt(input[0]) - 1;
            break;
        case 2:
            lowBound = parseInt(input[0]);
            highBound = parseInt(input[1]);
            break;
        default:
            return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++)
            result.push(i);
        return result;
    };
});

angular.module('mean.pages').directive('fileReplace', ['$rootScope', '$timeout', 'mimeIcon', function ($rootScope, $timeout, mimeIcon) {
    return {
        link: function($scope, element, attrs) {
            $timeout(function() {
                var mime = $(element).html();
                $(element).html(mimeIcon(mime));
            }, 10)
        }
    };
}]);

angular.module('mean.pages').directive('appReplace', ['$rootScope', '$timeout', 'appIcon', function ($rootScope, $timeout, appIcon) {
    return {
        link: function($scope, element, attrs) {
            $timeout(function() {
                var l7_proto = $(element).html();
                $(element).html(appIcon(l7_proto));
            }, 10)
        }
    };
}]);

angular.module('mean.pages').directive('makePieChart', ['$timeout', '$window', '$rootScope', 'getSize', function ($timeout, $window, $rootScope, getSize) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('pieChart', function (event, dimension, group, chartType, params) {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
                    //var arr = $scope.data.tables[0].aaData;
                    $scope.pieChart = dc.pieChart('#piechart');
                    // var waitForFinalEvent = (function () {
                    //     var timers = {};
                    //     return function (callback, ms, uniqueId) {
                    //         if (!uniqueId) {
                    //             uniqueId = "piechartWait"; //Don't call this twice without a uniqueId
                    //         }
                    //         if (timers[uniqueId]) {
                    //             clearTimeout (timers[uniqueId]);
                    //         }
                    //         timers[uniqueId] = setTimeout(callback, ms);
                    //     };
                    // })();
                    var filter;
                    var width = getSize(element, 'pieChart').width;
                    var connMargin = 0;
                    if (chartType === "hostConnections"){
                        width = width/2.3;
                        connMargin = 110;
                        filter = false;
                    }
                    var height = getSize(element, 'pieChart').height;
                    $scope.sevWidth = function() {
                        return getSize(element, 'pieChart').width;
                    }
                    filter = true;

                    // switch (chartType){
                    //  case 'bandwidth':
                    //      var setNewSize = function(width) {
                    //          $scope.pieChart
                    //              .width(width)
                    //              .height(width/3.5)
                    //              .margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
                    //          // $('#piechart').parent().height(width/3.5);
                    //          d3.select('#piechart svg').attr('width', width).attr('height', width/3.5);
                    //          $scope.pieChart.redraw();
                    //      }
                    //      $scope.pieChart
                    //          .group(group, "MB To Remote")
                    //          .valueAccessor(function(d) {
                    //              return d.value.in_bytes;
                    //          })
                    //          .stack(group, "MB From Remote", function(d){return d.value.out_bytes;})
                    //          .legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
                    //          .colors(["#112F41","#068587"]);
                    //      filter = true;
                    //      break;
                    //  case 'severity':
                    //      var setNewSize = function(width) {
                    //          $scope.pieChart
                    //              .width(width)
                    //              .height(width/3.5)
                    //              .margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
                    //          // $('#piechart').parent().height(width/3.5);
                    //          d3.select('#piechart svg').attr('width', width).attr('height', width/3.5);
                    //          $scope.pieChart.redraw();
                    //      }
                    //      $scope.pieChart
                    //          .group(group, "(1) Guarded")
                    //          .valueAccessor(function(d) {
                    //              return d.value.guarded;
                    //          })
                    //          .stack(group, "(2) Elevated", function(d){return d.value.elevated;})
                    //          .stack(group, "(3) High", function(d){return d.value.high;})
                    //          .stack(group, "(4) Severe", function(d){return d.value.severe;})
                    //          .colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"]);
                    //      filter = true;
                    //      break;
                    //  case 'drill':
                    //      var setNewSize = function(width) {
                    //          $scope.pieChart
                    //              .width(width)
                    //              .height(width/1.63)
                    //              .margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
                    //          $('#piechart').parent().height(width/1.63);
                    //          d3.select('#piechart svg').attr('width', width).attr('height', width/1.63);
                    //          $scope.pieChart.redraw();
                    //      }
                    //      $scope.pieChart
                    //          .group(group, "(1) DNS")
                    //          .valueAccessor(function(d) {
                    //              return d.value.dns;
                    //          })
                    //          .stack(group, "(2) HTTP", function(d){return d.value.http;})
                    //          .stack(group, "(3) SSL", function(d){return d.value.ssl;})
                    //          .stack(group, "(4) File", function(d){return d.value.file;})
                    //          .stack(group, "(5) Endpoint", function(d){return d.value.ossec;})
                    //          .stack(group, "(6) Total Connections", function(d){return d.value.connections;})
                    //          .colors(["#cb2815","#e29e23","#a3c0ce","#5c5e7d","#e3cdc9","#524A4F"]);
                    //      filter = false;
                    //      height = width/1.63;
                    //      break;
                    //  case 'bar':
                    //      var setNewSize = function(width) {
                    //          $scope.pieChart
                    //              .width(width)
                    //              .height(width/3.5)
                    //              .margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
                    //          // $(element).height(width/3.5);
                    //          d3.select('#pieChart svg').attr('width', width).attr('height', width/3.5);
                    //          $scope.pieChart.redraw();
                    //      }
                    //      $scope.pieChart
                    //          .group(group)
                    //          .colors(["#193459"]);
                    //      filter = false;
                    //      break;
                    // }

                    // if ((filter == true) && (chartType !== "hostConnections")) {
                    //     $scope.pieChart
                    //         .on("filtered", function(chart, filter){
                    //             waitForFinalEvent(function(){
                    //                 //$scope.tableData.filterAll();
                    //                 var arr = [];
                    //                 for(var i in dimension.top(Infinity)) {
                    //                     if (dimension.top(Infinity)[i].pie_dimension !== undefined) {
                    //                         arr.push(dimension.top(Infinity)[i].pie_dimension);
                    //                     } else if (dimension.top(Infinity)[i].l7_proto !== undefined) {
                    //                         arr.push(dimension.top(Infinity)[i].l7_proto);
                    //                     } else {
                    //                         arr.push(dimension.top(Infinity)[i].lan_user + dimension.top(Infinity)[i].lan_zone + dimension.top(Infinity)[i].lan_ip);
                    //                     }
                    //                 }
                    //                 $scope.tableData.filter(function(d) { 
                    //                     if (d.pie_dimension !== undefined) {
                    //                         return arr.indexOf(d.pie_dimension) >= 0; 
                    //                     } else if (d.l7_proto !== undefined) {
                    //                         return arr.indexOf(d.l7_proto) >= 0; 
                    //                     } else {
                    //                         return (arr.indexOf(d.lan_user+d.lan_zone+d.lan_ip)) >= 0;
                    //                     }
                    //                 });
                    //                 $scope.$broadcast('crossfilterToTable');

                    //             }, 400, "filterWait");
                    //         })
                    // }         

                    if (filter == true) {
                        $scope.pieChart.on("filtered", function(chart, filter){
                            // console.log(chart)
                            // console.log(filter)
                            $scope.$broadcast('outFilter', params.outgoingFilter, filter)
                        });
                    }
                    $scope.pieChart
                        .width(width) // (optional) define chart width, :default = 200
                        .height(height)
                        .transitionDuration(500) // (optional) define chart transition duration, :default = 500
                        // .margins(margin) // (optional) define margins
                        .ordering(function(d) { return 1 - d.value; })
                        .dimension(dimension) // set dimension
                        .group(group) // set group
                        // .ordering($scope.pieGroup)
                        .legend(dc.legend().x(width - 170+connMargin).y(10).itemHeight(13).gap(5))
                        .colors(d3.scale.category20());

                    $scope.pieChart.render();
                    $scope.$broadcast('spinnerHide');

                 /*   if (chartType !== "hostConnections"){
                        $(window).resize(function () {
                            waitForFinalEvent(function(){
                              $scope.pieChart.render();
                            }, 200, "pieChartresize");
                        });
                        $(window).bind('resize', function() {
                            setTimeout(function(){
                              //setNewSize($scope.sevWidth());
                            }, 150);
                        });
                        $('.sidebar-toggler').on("click", function() {
                              setTimeout(function() {
                                setNewSize($scope.sevWidth());
                                //$scope.pieChart.render();
                              },10);
                        });
                        // $rootScope.$watch('search', function(){
                        //     $scope.pieChart.redraw();
                        // });
                    }

                    $scope.$on('piechart-redraw', function (event) {
                        $scope.piechart.redraw();
                    })*/
                    // var geoFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
                    // $rootScope.$watch('search', function(){

                    //     if ($rootScope.search === null) {
                    //         $scope.appDimension.filterAll();
                    //     } else {
                    //         $scope.appDimension.filterAll();
                    //         // console.log($scope.appDimension.top(Infinity));
                    //         if ($scope.pie_dimension) {
                    //             $scope.appDimension.filter(function(d) { return $scope.pie_dimension.indexOf(d) >= 0; });
                    //             // $scope.pieGroup = $scope.appDimension.group().reduceSum(function (d) {
                    //             //    return d.count;
                    //             // });
                    //         }
                    //         // console.log($scope.appDimension.top(Infinity));

                    //     }
                    //     $scope.pieChart.dimension($scope.appDimension);
                    //     $scope.pieChart.group($scope.pieGroup); // set group
                    //     $scope.pieChart.redraw();
                    //     // $scope.pieChart.render();
                    // });
                }, 0, false);
            })
        }
    };
}]);

angular.module('mean.pages').directive('makeBarChart', ['$timeout', '$window', '$rootScope', '$location', function ($timeout, $window, $rootScope, $location) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('barchart', function (event, dimension, group, chartType, params) {
                function currentTime(callback) {
                    var time;
                    if ($location.$$search.start && $location.$$search.start) {
                        time = {
                            start: $location.$$search.start,
                            end: $location.$$search.end
                        }
                    } else {
                        time = {
                            start: $scope.global.startTime,
                            end: $scope.global.endTime
                        }
                    }
                    callback(time);
                    return;
                }
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
                        case 'stealthtraffic':
                            var setNewSize = function(width) {
                                $scope.barChart
                                    .width(width)
                                    .height(width/3.5)
                                    .margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
                                // $('#barchart').parent().height(width/3.5);
                                d3.select('#barchart svg').attr('width', width).attr('height', width/3.5);
                                $scope.barChart.redraw();
                            }

                            var in1=0, in2=0, in3=0, in4=0, in5=0, out1=0, out2=0, out3=0, out4=0, out5=0;

                            group.top(Infinity).map(function(d){
                                in1 += d.value.in_bytes;
                                in2 += d.value.in_bytes2;
                                in3 += d.value.in_bytes3;
                                in4 += d.value.in_bytes4;
                                in5 += d.value.in_bytes5;
                                out1 += d.value.out_bytes;
                                out2 += d.value.out_bytes2;
                                out3 += d.value.out_bytes3;
                                out4 += d.value.out_bytes4;
                                out5 += d.value.out_bytes5;
                            })

                            $scope.barChart
                                .group(group, "MB To Remote")
                                .valueAccessor(function(d) {
                                    return d.value.in_bytes;
                                })
                                .stack(group, "MB From Remote", function(d){return d.value.out_bytes;})
                                .legend(dc.legend().x(width - 153).y(10).itemHeight(13).gap(5))
                                .colors(d3.scale.ordinal().domain(["in_bytes","out_bytes","in_bytes2","out_bytes2","in_bytes3","out_bytes3","in_bytes4","out_bytes4","in_bytes5","out_bytes5"]).range(["#034142","#068587","#1A4569","#3FA8FF","#73100A","#FF3628","#001C01","#00692B","#280069","#463369 "]));

                            if ((in2 > 0) || (out2 > 0)) {
                                $scope.barChart
                                    .stack(group, "MB To Remote (Conn)", function(d){return d.value.in_bytes2;})
                                    .stack(group, "MB From Remote (Conn)", function(d){return d.value.out_bytes2;})
                            }
                            if ((in3 > 0) || (out3 > 0)) {
                                $scope.barChart
                                    .stack(group, "MB To Remote (Drop)", function(d){return d.value.in_bytes3;})
                                    .stack(group, "MB From Remote (Drop)", function(d){return d.value.out_bytes3;})
                            }
                            if ((in4 > 0) || (out4 > 0)) {
                                $scope.barChart
                                    .stack(group, "MB To Remote v3 (Conn)", function(d){return d.value.in_bytes4;})
                                    .stack(group, "MB From Remote v3 (Conn)", function(d){return d.value.out_bytes4;})
                            }
                            if ((in5 > 0) || (out5 > 0)) {
                                $scope.barChart
                                    .stack(group, "MB To Remote v3 (Drop)", function(d){return d.value.in_bytes5;})
                                    .stack(group, "MB From Remote v3 (Drop)", function(d){return d.value.out_bytes5;})
                            }

                            filter = true;
                            break;
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
                                .stack(group, "MB From Remote", function(d){ return d.value.out_bytes;})
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
                            filter = true;
                            height = width/1.63;
                            break;
                        case 'bar':
                            var setNewSize = function(width) {
                                $scope.barChart
                                    .width(width)
                                    .height(width/3.5)
                                    .margins({top: 10, right: 30, bottom: 20, left: 30}); // (optional) define margins
                                // $(element).height(width/3.5);
                                d3.select('#barchart svg').attr('width', width).attr('height', width/3.5);
                                $scope.barChart.redraw();
                            }
                            $scope.barChart
                                .group(group, "")
                                .valueAccessor(function(d) {
                                    return d.value;
                                })
                               .colors(d3.scale.ordinal().domain([]).range(["#112F41"]));
                            filter = true;
                            break;
                        case 'hostConnections':
                            var setNewSize = function(width) {
                                $scope.barChart
                                    .width(width)
                                    .height(width/3.5)
                                    .margins({top: 10, right: 30, bottom: 25, left: 43}); // (optional) define margins
                                // $('#barchart').parent().height(width/3.5);
                                d3.select('#barchart svg').attr('width', width).attr('height', width/3.5);
                                // $scope.barChart.redraw();
                            }
                            $scope.barChart
                                .group(group, "Conn Out")
                                .valueAccessor(function(d) {
                                    return d.value.conn_out;
                                })
                                //.group(group, "Count").valueAccessor(function(d) { return d.value.count; })
                                .stack(group, "Conn In", function(d){return d.value.conn_in;})
                                // .stack(group, "Conn Out", function(d){return d.value.conn_out;})
                                // .stack(group, "Conn In", function(d){return d.value.conn_in;})
                                .stack(group, "Stealth Out", function(d){return d.value.stealth_out;})
                                .stack(group, "Stealth In", function(d){return d.value.stealth_in;})
                                .legend(dc.legend().x(width - 100).y(10).itemHeight(13).gap(5))
                                .colors(d3.scale.ordinal().domain(["conn_in","conn_out","stealth_out","stealth_in"]).range(["#34D4FF","#009426","#C40600","#C43C00"]));
                            filter = false;
                            break;
                    }
                    if (filter == true) {
                        $scope.barChart.on("filtered", function(chart, filter){
                            $scope.$broadcast('outFilter', params.outgoingFilter, filter)
                        })
                    }
                    if (($scope.barChartxAxis == null) && ($scope.barChartyAxis == null)) {
                        var margin = {top: 10, right: 20, bottom: 10, left: 20};
                    } else {
                        if (chartType === "hostConnections") {
                          var margin = {top: 10, right: 10, bottom: 10, left: 43};
                        } else {
                          var margin = {top: 10, right: 30, bottom: 25, left: 43};
                        }
                    }

                    currentTime(function(time) {
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
                            .x(d3.time.scale().domain([moment.unix(time.start), moment.unix(time.end)])) // define x scale
                            .xUnits(d3.time.hours) // define x axis units
                            .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
                            .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
                            //.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
                            .title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
                            .renderTitle(true); // (optional) whether chart should render titles, :default = fal
                        $scope.barChart.render();
                    })
                   

                    $scope.$on('crossfilter-redraw', function (event, time) {
                        if (time) {
                            var start = time.query.end - (3600*24);
                            $scope.barChart.x(d3.time.scale().domain([moment.unix(start), moment.unix(time.query.end)]))
                        }
                        $scope.barChart.redraw();
                    })
                    $scope.$on('crossfilter-render', function (event) {
                        currentTime(function(time){
                            $scope.barChart.x(d3.time.scale().domain([moment.unix(time.start), moment.unix(time.end)]))
                            $scope.barChart.render();
                        })  
                    })
                        // $scope.$broadcast('spinnerHide');
                        // $(window).resize(function () {
                        //     waitForFinalEvent(function(){
                        //         $scope.barChart.render();
                        //     }, 200, "barchartresize");
                        // });
                        // // $(window).bind('resize', function() {
                        // //     setTimeout(function(){
                        // //         setNewSize($scope.sevWidth());
                        // //     }, 150);
                        // // });
                        // $('.sidebar-toggler').on("click", function() {
                        //     setTimeout(function() {
                        //         setNewSize($scope.sevWidth());
                        //         $scope.barChart.render();
                        //     },10);
                        // });
                        // // $rootScope.$watch('search', function(){
                        // //     $scope.barChart.redraw();
                        // // });
                }, 0, false);
            })
        }
    };
}]);

angular.module('mean.pages').directive('makeRowChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('rowchart', function (event, dimension, group, chartType, params) {
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
                                    //$scope.rowChart.redraw();
                                }
                            };
                            $scope.rowChart
                                // .colors(d3.scale.ordinal().domain(["guarded","elevated","high","severe"]).range(["#F88B12","#F5D800","#377FC7","#DD122A"]))//["#377FC7","#F5D800","#F88B12","#DD122A"]))
                                .colors(d3.scale.ordinal().domain([0,1,2,3,4]).range(["#377FC7","#F5D800","#F88B12","#DD122A"]))//["#377FC7","#DD122A","#F88B12", "#F5D800"]))
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
                                    // $scope.rowChart.redraw();
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
                        $scope.rowChart.on("filtered", function(chart, filter){
                                $scope.$broadcast('outFilter', params.outgoingFilter, filter.replace(/[0-9]/,''))
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
                        .height(hHeight)
                        .margins({top: 5, left: 0, right: 0, bottom: 20})
                        .group(group)
                        .dimension(dimension)
                        .ordering(function(d) { return -d.value.severity; })
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
                        .label(function(d) { return d.key.substring(0, d.key.length - 1)+' ('+d.value.count+')'; })
                        .labelOffsetY(lOffset) //lOffset
                        .elasticX(false)
                        .x(d3.scale.log().domain([1, $scope.rowDomain]).range([0,width])) //500 ->width
                        .xAxis()
                        .scale($scope.rowChart.x())
                        .tickFormat(logFormat);
                        $scope.rowChart.render();

                        $scope.$on('crossfilter-redraw', function (event, time) {
                            if (time) {
                                $scope.rowChart.x(d3.scale.log().domain([1, $scope.rowDomain]).range([0,width]));
                            }
                            $scope.rowChart.redraw();
                        })
                        $scope.$on('crossfilter-render', function (event) {
                            // update height of rowchart
                            var count = group.top(Infinity).length; ///CHANGE THIS to count return rows
                            if (count < 7) {
                                lOffset = 17+(count*0.2);
                                hHeight = 25+(count*35);
                            }
                            else if (count >= 7) {
                                lOffset = 12.7+(count*0.2);
                                hHeight = 25+(count*28);
                            }
                            d3.select('#rowchart svg').attr('width', width).attr('height', hHeight);
                            $(element).height(hHeight);
                            $scope.rowChart.height(hHeight);
                            $scope.rowChart.render();
                        })


                        // $(window).bind('resize', function() {
                        //     setTimeout(function(){
                        //         setNewSize($scope.rowWidth());
                        //     }, 150);
                        // });
                        // $(window).resize(function () {
                        //     waitForFinalEvent(function(){
                        //         $scope.rowChart.render();
                        //     }, 200, "rowchartresize");
                        // });
                        // $('.sidebar-toggler').on("click", function() {
                        //     setTimeout(function() {
                        //         setNewSize($scope.rowWidth());
                        //         $scope.rowChart.render();
                        //     },10);
                        // });
                        // var rowFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
                        // $rootScope.$watch('search', function(){
                        //     $scope.tableToRowChart = function () {
                        //         if ($rootScope.search === null) {
                        //             rowFilterDimension.filterAll();
                        //         } else {
                        //             rowFilterDimension.filterAll();
                        //             if ($scope.country) {
                        //                 rowFilterDimension.filter(function(d) { return $scope.country.indexOf(d) >= 0; });
                        //             }
                        //         }
                        //     }
                        //     $scope.tableToRowChart();
                        //     $scope.rowChart.redraw();
                        // });
                }, 0, true);
            });
        }
    }
}]);

angular.module('mean.pages').directive('makeGeoChart', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('geoChart', function (event, dimension, group, chartType, params) {
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

                    if (filter == true) {
                        $scope.geoChart.on("filtered", function(chart, filter){
                                $scope.$broadcast('outFilter', params.outgoingFilter, filter.replace(/[0-9]/,''))
                            });
                    }
                    $scope.$on('crossfilter-redraw', function (event) {
                        $scope.geoChart.redraw();
                    })
                    $scope.$on('crossfilter-render', function (event) {
                        $scope.geoChart.render();
                    })
                    // $scope.geoWidth = function() {
                    //     return $('#geochart').parent().width();
                    // }
                    // var setNewSize = function(width) {
                    //     if (width > 0) {
                    //         $scope.geoChart
                    //             .width(width)
                    //             .height(width/3.3)
                    //             .projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 2 / Math.PI).translate([width / 2.1, width / 2.4]))
                    //             $(element).height(width/1.628);
                    //             d3.select('#geochart svg').attr('width', width).attr('height', width/1.628);
                    //         $scope.geoChart.redraw();
                    //     }
                    // }
                    // $(window).bind('resize', function() {
                    //     setTimeout(function(){
                    //         setNewSize($scope.geoWidth());
                    //     }, 150);
                    // });
                    // $('.sidebar-toggler').on("click", function() {
                    //     setTimeout(function() {
                    //         setNewSize($scope.geoWidth());
                    //     },10);
                    // });
                    // var geoFilterDimension = $scope.crossfilterData.dimension(function(d){ return d.remote_country;});
                    // $rootScope.$watch('search', function(){
                    //     if ($rootScope.search === null) {
                    //             geoFilterDimension.filterAll();
                    //         } else {
                    //             geoFilterDimension.filterAll();
                    //             if ($scope.country) {
                    //                 geoFilterDimension.filter(function(d) { return $scope.country.indexOf(d) >= 0; });
                    //             }
                    //         }
                    //     $scope.geoChart.redraw();
                    // });
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

angular.module('mean.pages').directive('makeCoiChart', ['$timeout', '$rootScope', 'dictionary', '$http', function ($timeout, $rootScope, dictionary, $http) {
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
                    var palette = {
                        "lightgray": "#819090","gray": "#708284","mediumgray": "#536870","darkgray": "#3a3a3a",
                        "darkblue": "#0A2933","darkerblue": "#042029",
                        "paleryellow": "#FCF4DC","paleyellow": "#EAE3CB","yellow": "#A57706","orange": "#BD3613","red": "#D11C24",
                        "pink": "#C61C6F","purple": "#595AB7","blue": "#2176C7","green": "#259286","yellowgreen": "#738A05"
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
                            return 140;
                        }
                        // position will be between 0 and 100
                        // if(x > 50) {
                        //  x = 50;
                        // }
                        var minp = 0;
                        var maxp = maxNum;
                        // The result should be between 100 an 10000000
                        var minv = Math.log(5);
                        var maxv = Math.log(40);
                        // calculate adjustment factor
                        var scale = (maxv-minv) / (maxp-minp);
                        return Math.exp(minv + scale*(x-minp));
                    }
                    
                    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
                    var zoomListener = d3.behavior.zoom().scaleExtent([0.7, 3]).on("zoom", zoom);

                    var vis = d3.select("#forcechart")
                        .append("svg")
                        .attr("class", "stage")
                        .attr("width", width)
                        .attr("height", height)
                        .call(zoomListener)
                        .append('g');

                    function zoom() {
                        vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                    }

                    var force = d3.layout.force()
                        .nodes(data.nodes)
                        .links(data.links)
                        .gravity(function(d) { 
                            if (d.class === 'child') {
                               return  0.2;
                            } else {
                               return  0;
                            }
                        })
                        .linkDistance(function(d) { 
                            if (d.class === 'child') {
                                return  130;
                            } else {
                                var w;
                                if (width/2 > 400) {
                                    w = 400;
                                } else {
                                    w = width/2;
                                }
                                return w;
                            }
                        })
                        .charge(-30)
                        .size([width-50, height]);


                    var link = vis.selectAll(".link")
                        .data(data.links)
                        .enter().append('g')
                        .attr('class', 'linkgroup')
                        .append("line")
                        .attr("class", "link")
                        .style("display", function(d){
                             if (d.allowed==="authorized") {
                                return 'none';
                                //return 'inline-block';
                            } else {
                                return 'inline-block';
                            }
                        })
                        .style('stroke', function(d){
                            if (d.class === 'child'){
                                if (d.allowed==="authorized") {
                                    return '#00FF00';
                                } else {
                                    return '#CC0000';
                                }
                            } else {
                                return '#259286';
                            }
                        })
                        .style('stroke-opacity', function(d){
                            if (d.class === 'child'){
                                return '.7';
                            } else {
                                return '1';
                            }
                        })
                        .attr('stroke-width', function(d){
                            if (d.class === 'child'){
                                return '3';
                            } else {
                                return '70';
                            }
                        });

                    var node_drag = d3.behavior.drag()
                        .on("dragstart", dragstart)
                        .on("drag", dragmove)
                        .on("dragend", dragend);

                    var node = vis.selectAll("circle.node")
                        .data(data.nodes)
                        .enter().append("g")
                        .attr("class", "node")
                        .call(node_drag);
                        //.call(force.drag);

                    function dragstart(d, i) {
                        d3.event.sourceEvent.stopPropagation();
                        d.fixed = true; 
                        force.stop();
                    }

                    function dragmove(d, i) {
                        d.fixed = true; 
                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                        d.x += d3.event.dx;
                        d.y += d3.event.dy;
                        tick(); 
                    }

                    function dragend(d, i) {
                        d.fixed = true; 
                        $http({method: 'GET', url: '/api/stealth/stealth_op_view?type=checkCoor&user_login='+$scope.global.user.email+'&name='+d.name+'&page_title=stealth_op_view'}).
                            success(function(data) { 
                                if (data["result"].length>0) {
                                    $http({method: 'POST', url: '/api/stealth/stealth_op_view', data: {x: d.x, y: d.y, user_login: $scope.global.user.email, name: d.name, page_title: "stealth_op_view"}});
                                }else{
                                    $http({method: 'POST', url: '/api/stealth/stealth_op_view?type=insert', data: {x: d.x, y: d.y, user_login: $scope.global.user.email, name: d.name, page_title: "stealth_op_view"}});
                                }
                            });
                        tick();
                        force.resume();
                    }

                    var tableDiv = d3.select('#force-table');
                    var infoDiv = d3.select('#forcechartinfo').append('table');

                    var circleWidth = 5;
                    node.each(function(d){
                        var elm = d3.select(this).append('g').attr('transform', 'scale(0.7)');
                        if (d.group === "child") {
                        } else {
                            d.fixed = true;
                        }
                        switch(d.group) {
                            case 'coi':
                                //CIRCLE
                                elm.append("svg:circle")
                                    .attr("r", function (d) {return logslider(d["width"]); })
                                    .attr("fill", '#fff')
                                    .style("stroke-width", "14px")
                                    .style('stroke', function(d){
                                        if (d.name === 'QuarantineCOI'){
                                            return '#ff0000';
                                        } else {
                                            return '#259286';
                                        }
                                    });

                                //TEXT appends name
                                elm.append("text")
                                    .text(function(d, i) { return d.name; })
                                    .attr("x", 0)
                                    .attr("y", 10)
                                    .attr("font-family",  "Helvetica Neue, Arial")
                                    .attr("fill", '#c61c6f')
                                    .style("font-size", '2em')
                                    .attr("text-anchor", 'middle');

                                //TEXT appends count
                                var text = elm.append("g")
                                    .attr('transform', 'translate(0, 110)');
                                text.append('text')
                                    .html(function(d, i) { return d.count; })
                                    .attr("fill", '#000')
                                    .style("font-size", '5em')
                                    .attr("text-anchor", 'middle');

                                // append a rectangle on top for click events
                                text.append('rect')
                                    .attr('x', -34)
                                    .attr('y', -45)
                                    .style('fill-opacity', '0.4')
                                    .style('fill', '#fff')
                                    .attr('width', 70)
                                    .attr('height', 50)
                                    .on('mouseover', function(){
                                        d3.select(this).style('cursor', 'pointer')
                                        .style('fill-opacity', '0');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'users');
                                    })
                                    .on('mouseout', function(){d3.select(this)
                                    .style('fill-opacity', '0.4');
                                    });

                                // ICONS
                                // right button red x
                                elm
                                    .append('g')
                                    .attr('transform', 'scale(.8)')
                                    .append('g')
                                    .attr('transform', 'translate(98, -15)')
                                    .append('path')
                                    .attr('d', 'M0,29.9c0-0.6,11.3-12,11.8-12.6c0.5-0.5-3.3-13-3.3-14.6C8.4,1.5,10.7,0,11.2,0'+
                                    'c2.1,0,9.4,9.1,9.4,9.1s11-8.2,12.3-7.8c2.5,0.8,3.5,3,2,4.4c-2.3,2.5-11,11.8-11,13.9c0,1,5.3,8.7,4.7,9.5l-3.1,4.5'+
                                    'c-0.6,0.9-10-7.7-10-7.7S5.3,35.8,4.9,35.8C4.5,35.8,0,30.5,0,29.9z')
                                    .attr('style', 'fill:#f60000;fill-opacity:1;stroke:none;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1')

                                elm.append("svg:circle")
                                    .attr("cx", 92)
                                    .attr("cy", 0)
                                    .attr("r", 24)
                                    .attr("fill", '#fff')
                                    .style('fill-opacity', '0.3')
                                    .on('mouseover', function(){
                                        d3.select(this).style('cursor', 'pointer')
                                        .style('fill-opacity', '0');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'blocked');
                                    })
                                    .on('mouseout', function(){d3.select(this)
                                    .style('fill-opacity', '0.3');
                                    })

                                // left button check mark
                                elm
                                    .append('g')
                                    .attr('transform', 'scale(.9)')
                                    .append('g')
                                    .attr('transform', 'translate(-300,-525)')
                                    .append('path')
                                        .style('fill', '#000000')
                                        .attr('d', 'M193.6,542.1c-0.5,0-8.8-14.6-8.8-14.6l8-3.6l1.6,8.4c0,0,19.9-22.3,21.7-23.9l4.3-0.2'+
                                        'C220.3,508.2,194.1,542.1,193.6,542.1z')
                                    .on('mouseover', function(d){
                                        d3.select(this).style('cursor', 'pointer');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'right');
                                    })

                                elm.append("svg:circle")
                                    .attr("cx", -90)
                                    .attr("cy", 0)
                                    .attr("r", 24)
                                    .attr("fill", '#fff')
                                    .style('fill-opacity', '0.3')
                                    .on('mouseover', function(){
                                        d3.select(this).style('cursor', 'pointer')
                                        .style('fill-opacity', '0');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'authorized');
                                    })
                                    .on('mouseout', function(){d3.select(this)
                                    .style('fill-opacity', '0.3');
                                    })

                                switch(d.name){
                                    case 'ClearTextCOI':
                                        elm.append('path')
                                            .style('fill', '#259286')
                                            .attr('d', 'M36.8,12.2L19.6,15l4.4-12L36.8,0V12.2z M3.8,20.8l9.2-3.7l5.4-11.4L3.8,20.8z M36.8,16.5l-18.6,3.8'+
                                            'L17.5,37h19.3V16.5z M12.2,21.6l-9.8,3.6L0,37h10.3L12.2,21.6z M42.8,12.2L59.9,15l-4.6-12L42.8,0V12.2z M60.4,5.8l5.4,11.4l9.2,3.7'+
                                            'L60.4,5.8z M42.8,37h20.4L61,20.3l-18.2-3.8V37z M68.6,37h10.3l-2.4-11.8l-9.8-3.6L68.6,37z M36.8,67.2l-17.3-2.8l4.4,12l12.8,3.1'+
                                            'V67.2z M18.5,73.6l-5.4-11.4l-9.2-3.7L18.5,73.6z M36.8,42H17.5l0.7,16.8l18.6,2.1V42z M10.3,42H0l2.4,11.9l9.8,3.7L10.3,42z'+
                                            ' M42.8,79.4l12.4-3.1l4.6-12l-17.1,2.8V79.4z M75.1,58.6l-9.2,3.7l-5.4,11.4L75.1,58.6z M42.8,60.9L61,58.8L63.2,42H42.8V60.9z'+
                                            ' M66.7,57.5l9.8-3.7L78.9,42H68.6L66.7,57.5z')
                                            .attr('transform', 'translate(-25,-115) scale(0.7)')

                                        elm.append("svg:circle")
                                            .attr("cx", 2)
                                            .attr("cy", -88)
                                            .attr("r", 32)
                                            .attr("fill", '#fff')
                                            .style('fill-opacity', '0.3')
                                            .on('mouseover', function(){
                                                d3.select(this).style('cursor', 'pointer')
                                                .style('fill-opacity', '0');
                                            })
                                            .on('click', function(d){
                                               //$scope.requery(d, 'top');
                                               $scope.requery(d, 'rules');
                                            })
                                            .on('mouseout', function(){d3.select(this)
                                            .style('fill-opacity', '0.3');
                                            });
                                        break;
                                    case 'QuarantineCOI':
                                        elm.append('path')
                                            .style('fill', '#ff0000')
                                            .attr('d','M36.6,32.1c1.4-2.2,2.4-4.7,2.9-7.3c-8.1-3.3-13.8-11.2-13.8-20.5c0-1.1,0.1-2.1,0.2-3.1 C23.7,0.4,21.3,0,18.8,0c-0.2,0-0.4,0-0.6,0'+
                                            'c-0.2,1.4-0.3,2.9-0.3,4.3C17.9,16.9,25.6,27.7,36.6,32.1z M94.3,36.2c-4.3,5-10.6,8.1-17.7,8.1c-12.9,0-23.4-10.4-23.4-23.3c0-3.8,0.9-7.5,2.6-10.7'+
                                            'l-2.8-1.6 c-1.2,1.4-3.1,2.4-5.1,2.4c-2.1,0-3.9-0.9-5.1-2.4l-3,1.8c1.6,3.2,2.5,6.8,2.5,10.6c0,12.9-10.5,23.3-23.4,23.3 c-7,0-13.3-3.1-17.6-7.9'+
                                            'L0,37.1c6.2,8,15.9,13.1,26.7,13.1c8,0,15.3-2.8,21.1-7.4c5.8,4.6,13.1,7.4,21.1,7.4 c10.9,0,20.6-5.2,26.7-13.1L94.3,36.2z')
                                            .attr('transform', 'translate(-21,-90) scale(0.5)')

                                        elm.append('path')
                                            .style('fill', '#ff0000')
                                            .attr('d','M36.6,32.1c1.4-2.2,2.4-4.7,2.9-7.3c-8.1-3.3-13.8-11.2-13.8-20.5c0-1.1,0.1-2.1,0.2-3.1 C23.7,0.4,21.3,0,18.8,0c-0.2,0-0.4,0-0.6,0'+
                                            'c-0.2,1.4-0.3,2.9-0.3,4.3C17.9,16.9,25.6,27.7,36.6,32.1z M94.3,36.2c-4.3,5-10.6,8.1-17.7,8.1c-12.9,0-23.4-10.4-23.4-23.3c0-3.8,0.9-7.5,2.6-10.7'+
                                            'l-2.8-1.6 c-1.2,1.4-3.1,2.4-5.1,2.4c-2.1,0-3.9-0.9-5.1-2.4l-3,1.8c1.6,3.2,2.5,6.8,2.5,10.6c0,12.9-10.5,23.3-23.4,23.3 c-7,0-13.3-3.1-17.6-7.9'+
                                            'L0,37.1c6.2,8,15.9,13.1,26.7,13.1c8,0,15.3-2.8,21.1-7.4c5.8,4.6,13.1,7.4,21.1,7.4 c10.9,0,20.6-5.2,26.7-13.1L94.3,36.2z')
                                            .attr('transform', 'rotate(120,39,-49) scale(0.5)')

                                        elm.append('path')
                                            .style('fill', '#ff0000')
                                            .attr('d','M36.6,32.1c1.4-2.2,2.4-4.7,2.9-7.3c-8.1-3.3-13.8-11.2-13.8-20.5c0-1.1,0.1-2.1,0.2-3.1 C23.7,0.4,21.3,0,18.8,0c-0.2,0-0.4,0-0.6,0'+
                                            'c-0.2,1.4-0.3,2.9-0.3,4.3C17.9,16.9,25.6,27.7,36.6,32.1z M94.3,36.2c-4.3,5-10.6,8.1-17.7,8.1c-12.9,0-23.4-10.4-23.4-23.3c0-3.8,0.9-7.5,2.6-10.7'+
                                            'l-2.8-1.6 c-1.2,1.4-3.1,2.4-5.1,2.4c-2.1,0-3.9-0.9-5.1-2.4l-3,1.8c1.6,3.2,2.5,6.8,2.5,10.6c0,12.9-10.5,23.3-23.4,23.3 c-7,0-13.3-3.1-17.6-7.9'+
                                            'L0,37.1c6.2,8,15.9,13.1,26.7,13.1c8,0,15.3-2.8,21.1-7.4c5.8,4.6,13.1,7.4,21.1,7.4 c10.9,0,20.6-5.2,26.7-13.1L94.3,36.2z')
                                            .attr('transform', 'rotate(240,-12,-37) scale(0.5)')

                                        elm.append("svg:circle")
                                            .attr("cx", 2)
                                            .attr("cy", -88)
                                            .attr("r", 32)
                                            .attr("fill", '#fff')
                                            .style('fill-opacity', '0.3')
                                            .on('mouseover', function(){
                                                d3.select(this).style('cursor', 'pointer')
                                                .style('fill-opacity', '0');
                                            })
                                            .on('click', function(d){
                                               //$scope.requery(d, 'top');
                                               $scope.requery(d, 'rules');
                                            })
                                            .on('mouseout', function(){d3.select(this)
                                            .style('fill-opacity', '0.3');
                                            });
                                        break;
                                    default:
                                        elm.append('polygon')
                                            .style('fill', '#515151')
                                            .attr('points', '53,18 53,10 60,10 60,0 44,0 44,10 51,10 51,16 31,16 31,10 38,10 38,0 22,0 22,10 29,10 '+
                                            '29,16 9,16 9,10 16,10 16,0 0,0 0,10 7,10 7,18 29,18 29,26 7,26 7,35 0,35 0,45 16,45 16,35 9,35 9,28 29,28 29,35 22,35 22,45 '+
                                            '38,45 38,35 31,35 31,28 51,28 51,35 44,35 44,45 60,45 60,35 53,35 53,26 31,26 31,18 ')
                                            .attr('transform', 'translate(-25,-110) scale(0.9)');

                                        elm.append("svg:circle")
                                            .attr("cx", 2)
                                            .attr("cy", -88)
                                            .attr("r", 40)
                                            .attr("fill", '#fff')
                                            .style('fill-opacity', '0.3')
                                            .on('mouseover', function(){
                                                d3.select(this).style('cursor', 'pointer')
                                                .style('fill-opacity', '0');
                                            })
                                            .on('click', function(d){
                                                //$scope.requery(d, 'top');
                                                $scope.requery(d, 'rules');
                                            })
                                            .on('mouseout', function(){d3.select(this)
                                            .style('fill-opacity', '0.3');
                                            })
                                        break;
                                }
                            break;
                            case 'child':
                                if (d.value.type === 'Stealth COI Mismatch') {
                                    elm.append("path")
                                        .attr('d', 'M14,3.1C9.4,3.3,7,0,7,0c0,0-2,3.1-7,3.1C-0.4,8.3,2.7,18,7,18C11.2,18,14.4,7.2,14,3.1z')
                                        .attr('transform', 'translate(-25,-115) scale(0.7)')
                                        .style('fill', "#000")
                                        .style('border', "solid 1px #000")
                                        .attr('transform', 'translate(-8,-8) scale(1.1)')
                                } else if (d.value.type === 'Stealth COI Mismatch v3') {
                                    elm.append("path")
                                        .attr('d', 'M14,3.1C9.4,3.3,7,0,7,0c0,0-2,3.1-7,3.1C-0.4,8.3,2.7,18,7,18C11.2,18,14.4,7.2,14,3.1z')
                                        .attr('transform', 'translate(-25,-115) scale(0.7)')
                                        .style('fill', "#666")
                                        .style('border', "solid 1px #666")
                                        .attr('transform', 'translate(-8,-8) scale(1.1)')
                                } else if (d.value.type === 'Non-Stealth Internal Attack') {
                                    elm.append('rect')
                                        .attr('x', function(d) { return d.x; })
                                        .attr('y', function(d) { return d.y; })
                                        .attr('height', 14)
                                        .attr('width', 14)
                                        .style('fill', "#002E7F")
                                        .attr('transform', 'translate(-8,-8)')
                                        .style('fill-opacity', '1') 
                                } else if (d.value.type === 'outside') {
                                    elm.append("circle")
                                        .attr("cx", function(d) { return d.x; })
                                        .attr("cy", function(d) { return d.y; })
                                        .attr("r", 8)
                                        .attr("fill", "#000")
                                        .style('border', "solid 1px #000")
                                } 
                            break;
                        }
                    });
                    
                    $scope.appendInfo = function(data, type) { 
                        infoDiv.selectAll('tr').remove();

                        var divInfo = '';
                        if (type === "linkBetween") {
                            var uniqueNodes = $scope.forcedata.uniqueNodes;
                            var uniqueUsers = $scope.forcedata.uniqueUsers;
                            var unique = [];
                            var source = data.source.name;
                            var target = data.target.name;             
                            
                            for (var i in uniqueNodes[source]) {
                                for (var j in uniqueNodes[target]) {
                                    if (i === j) { 
                                        unique.push(i);
                                    }
                                }         
                            }
                            for (var x=0; x<unique.length; x++) {
                                var divInfo = '';
                                divInfo += '<div><strong>'+unique[x]+'</strong></div>';
                                for (var k in uniqueUsers) {
                                    if (k === unique[x]) {
                                        for (var z in uniqueUsers[k]) {
                                            divInfo += '<div>'+z+'</div>';
                                        }
                                    }
                                }
                                var row = infoDiv.append('tr');
                                row
                                    .append('td')
                                    .html(divInfo);
                            }
                        } else if (type === "rules"){
                                var divInfo = '';
                                divInfo += '<div><strong>Rules: </strong><br />';
                                var rules = "";
                                for (var i = 0; i < data.rules.length; i++) {
                                    if (data.rules[i].rule !== "-"){
                                        var ruleString = data.rules[i].rule.replace(/Except/g , "<br />Except");
                                        divInfo += data.rules[i].order  + "<br />" + " " + ruleString + "<br />";
                                    } else {
                                        divInfo += "none <br />";
                                    }                                    
                                }
                                var row = infoDiv.append('tr');
                                    row
                                        .append('td')
                                        .html(divInfo);
                        } else {
                            for (var i in data) {
                                if (typeof data[i] === 'object') {
                                    var divInfo = '';
                                    for (var e in data[i]) {
                                        divInfo += '<div><strong>'+e+': </strong>'+data[i][e]+'</div>';
                                    }
                                    var row = infoDiv.append('tr');
                                        row
                                            .append('td')
                                            .html(divInfo);
                                } else {
                                    var row = infoDiv.append('tr');
                                        row
                                            .append('td')
                                            .html('<strong>'+dictionary(i)+'</strong>');
                                        row
                                            .append('td')
                                            .text(data[i]);
                                }
                            }                            
                        }  
                    }


                    $scope.pageLoadInfo = function(data, type) {
                        for (var i in data) {
                            if (typeof data[i] === 'object') {
                                var divInfo = '';
                                for (var e in data[i]) {
                                    if (e !==  "index"){
                                        divInfo += '<div><strong>'+e+': </strong>'+data[i][e]+'</div>';
                                    }
                                }
                                var row = infoDiv.append('tr');
                                    row
                                        .append('td')
                                        .html(divInfo);
                            } else {
                                var row = infoDiv.append('tr');
                                    row
                                        .append('td')
                                        .html('<strong>'+dictionary(i)+'</strong>');
                                    row
                                        .append('td')
                                        .text(data[i]);
                            }
                        }                       
                    }

                    var linktext = d3.selectAll('.linkgroup');
                    var text = linktext
                        .append('text')
                        .attr("fill", '#fff')
                        .style('font-size', '3em')
                        .style('cursor', 'pointer')
                        .attr('text-anchor', 'middle')
                        .text(function(d) { return d.value; })
                        .on('click', function(d){
                            $scope.appendInfo(d, 'linkBetween');
                        });

                    function tick() {
                        node[0].x = width;
                        node[0].y = height;
                        var value = 120; 

                        node.attr("cx", function(d) { 
                                if (d.group === "child") {
                                    value = 0;
                                } else {
                                    value = 120;
                                }
                                return d.x = Math.max(value, Math.min(width - value, d.x)); 
                            })
                            .attr("cy", function(d) { 
                                if (d.group === "child") {
                                    value = 0;
                                } else {
                                    value = 120;
                                }
                                return d.y = Math.max(value, Math.min(height - value, d.y)); });

                        link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });


                        text.attr("transform", function(d, i) {
                            var x1 = d.source.x;
                            var x2 = d.target.x;
                            var y1 = d.source.y;
                            var y2 = d.target.y;
                            var x = (x1+x2)/2;
                            var y = ((y1+y2)*1.027)/2;
                            return "translate(" + x + "," + y + ")";
                        });

                        node.attr("transform", function(d, i) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                    };

                    force.on("tick", tick);
                    force.start();
                    $scope.onloadInfo();

                    //LEGEND
                    var circle_legend = vis.selectAll(".circle_legend")
                        .data(["Stealth COIs"])
                        .enter().append("g")
                        .attr("class", "circle_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                    circle_legend.append('svg:circle')
                        .attr('transform', 'translate(15,15) scale(0.5)')
                        .attr('r', 25)
                        .style('fill', '#fff')
                        .style("stroke-width", "8px")
                        .style("stroke" , "#259286");
                    circle_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 17)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });


                    var link_legend = vis.selectAll(".link_legend")
                        .data(["User with Shared Access"])
                        .enter().append("g")
                        .attr("class", "link_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                    link_legend.append('svg:rect')
                        .attr('transform', 'translate(0,35)')
                        .style('fill', '#259286')
                        .attr('width', 30)
                        .attr('height', 20);
                    link_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 44)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });


                    var standard_legend = vis.selectAll(".standard_legend")
                        .data(["Standard"])
                        .enter().append("g")
                        .attr("class", "standard_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                    standard_legend.append('svg:polygon')
                        .attr('transform', 'translate(0,61) scale(0.5)')
                        .style('fill', '#515151')
                        .attr('points', '53,18 53,10 60,10 60,0 44,0 44,10 51,10 51,16 31,16 31,10 38,10 38,0 22,0 22,10 29,10 '+
                        '29,16 9,16 9,10 16,10 16,0 0,0 0,10 7,10 7,18 29,18 29,26 7,26 7,35 0,35 0,45 16,45 16,35 9,35 9,28 29,28 29,35 22,35 22,45 '+
                        '38,45 38,35 31,35 31,28 51,28 51,35 44,35 44,45 60,45 60,35 53,35 53,26 31,26 31,18');
                    standard_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 74)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });


                    var ct_legend = vis.selectAll(".ct_legend")
                        .data(["ClearText"])
                        .enter().append("g")
                        .attr("class", "ct_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                    ct_legend.append('svg:path')
                        .attr('transform', 'translate(0,90) scale(0.4)')
                        .style('fill', '#259286')
                        .attr('d', 'M36.8,12.2L19.6,15l4.4-12L36.8,0V12.2z M3.8,20.8l9.2-3.7l5.4-11.4L3.8,20.8z M36.8,16.5l-18.6,3.8'+
                        'L17.5,37h19.3V16.5z M12.2,21.6l-9.8,3.6L0,37h10.3L12.2,21.6z M42.8,12.2L59.9,15l-4.6-12L42.8,0V12.2z M60.4,5.8l5.4,11.4l9.2,3.7'+
                        'L60.4,5.8z M42.8,37h20.4L61,20.3l-18.2-3.8V37z M68.6,37h10.3l-2.4-11.8l-9.8-3.6L68.6,37z M36.8,67.2l-17.3-2.8l4.4,12l12.8,3.1'+
                        'V67.2z M18.5,73.6l-5.4-11.4l-9.2-3.7L18.5,73.6z M36.8,42H17.5l0.7,16.8l18.6,2.1V42z M10.3,42H0l2.4,11.9l9.8,3.7L10.3,42z'+
                        ' M42.8,79.4l12.4-3.1l4.6-12l-17.1,2.8V79.4z M75.1,58.6l-9.2,3.7l-5.4,11.4L75.1,58.6z M42.8,60.9L61,58.8L63.2,42H42.8V60.9z'+
                        ' M66.7,57.5l9.8-3.7L78.9,42H68.6L66.7,57.5z');
                    ct_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 107)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });


                    var quar_legend = vis.selectAll(".quar_legend")
                        .data(["Quarantine"])
                        .enter().append("g")
                        .attr("class", "quar_legend")
                        .attr("transform", function(d, i) { return "translate(0, " + i * 20 + ")"; });
                    quar_legend.append('svg:path')
                        .attr('transform', 'translate(3,140) scale(0.25)')
                        .style('fill', '#ff0000')
                        .attr('d', 'M36.6,32.1c1.4-2.2,2.4-4.7,2.9-7.3c-8.1-3.3-13.8-11.2-13.8-20.5c0-1.1,0.1-2.1,0.2-3.1 C23.7,0.4,21.3,0,18.8,0c-0.2,0-0.4,0-0.6,0'+
                        'c-0.2,1.4-0.3,2.9-0.3,4.3C17.9,16.9,25.6,27.7,36.6,32.1z M94.3,36.2c-4.3,5-10.6,8.1-17.7,8.1c-12.9,0-23.4-10.4-23.4-23.3c0-3.8,0.9-7.5,2.6-10.7'+
                        'l-2.8-1.6 c-1.2,1.4-3.1,2.4-5.1,2.4c-2.1,0-3.9-0.9-5.1-2.4l-3,1.8c1.6,3.2,2.5,6.8,2.5,10.6c0,12.9-10.5,23.3-23.4,23.3 c-7,0-13.3-3.1-17.6-7.9'+
                        'L0,37.1c6.2,8,15.9,13.1,26.7,13.1c8,0,15.3-2.8,21.1-7.4c5.8,4.6,13.1,7.4,21.1,7.4 c10.9,0,20.6-5.2,26.7-13.1L94.3,36.2z');
                    quar_legend.append('svg:path')
                        .attr('transform', 'rotate(120,-27,71.5) scale(0.25)')
                        .style('fill', '#ff0000')
                        .attr('d', 'M36.6,32.1c1.4-2.2,2.4-4.7,2.9-7.3c-8.1-3.3-13.8-11.2-13.8-20.5c0-1.1,0.1-2.1,0.2-3.1 C23.7,0.4,21.3,0,18.8,0c-0.2,0-0.4,0-0.6,0'+
                        'c-0.2,1.4-0.3,2.9-0.3,4.3C17.9,16.9,25.6,27.7,36.6,32.1z M94.3,36.2c-4.3,5-10.6,8.1-17.7,8.1c-12.9,0-23.4-10.4-23.4-23.3c0-3.8,0.9-7.5,2.6-10.7'+
                        'l-2.8-1.6 c-1.2,1.4-3.1,2.4-5.1,2.4c-2.1,0-3.9-0.9-5.1-2.4l-3,1.8c1.6,3.2,2.5,6.8,2.5,10.6c0,12.9-10.5,23.3-23.4,23.3 c-7,0-13.3-3.1-17.6-7.9'+
                        'L0,37.1c6.2,8,15.9,13.1,26.7,13.1c8,0,15.3-2.8,21.1-7.4c5.8,4.6,13.1,7.4,21.1,7.4 c10.9,0,20.6-5.2,26.7-13.1L94.3,36.2z');   
                    quar_legend.append('svg:path')
                        .attr('transform', 'rotate(240,54,70) scale(0.25)')
                        .style('fill', '#ff0000')
                        .attr('d', 'M36.6,32.1c1.4-2.2,2.4-4.7,2.9-7.3c-8.1-3.3-13.8-11.2-13.8-20.5c0-1.1,0.1-2.1,0.2-3.1 C23.7,0.4,21.3,0,18.8,0c-0.2,0-0.4,0-0.6,0'+
                        'c-0.2,1.4-0.3,2.9-0.3,4.3C17.9,16.9,25.6,27.7,36.6,32.1z M94.3,36.2c-4.3,5-10.6,8.1-17.7,8.1c-12.9,0-23.4-10.4-23.4-23.3c0-3.8,0.9-7.5,2.6-10.7'+
                        'l-2.8-1.6 c-1.2,1.4-3.1,2.4-5.1,2.4c-2.1,0-3.9-0.9-5.1-2.4l-3,1.8c1.6,3.2,2.5,6.8,2.5,10.6c0,12.9-10.5,23.3-23.4,23.3 c-7,0-13.3-3.1-17.6-7.9'+
                        'L0,37.1c6.2,8,15.9,13.1,26.7,13.1c8,0,15.3-2.8,21.1-7.4c5.8,4.6,13.1,7.4,21.1,7.4 c10.9,0,20.6-5.2,26.7-13.1L94.3,36.2z');                  
                    quar_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 140)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });


                    var checkmark_legend = vis.selectAll(".checkmark_legend")
                        .data(["Allowed Connections"])
                        .enter().append("g")
                        .attr("class", "checkmark_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                    checkmark_legend.append('svg:path')
                        .attr('transform', 'translate(-85 -93) scale(0.5)')
                        .attr('d', 'M193.6,542.1c-0.5,0-8.8-14.6-8.8-14.6l8-3.6l1.6,8.4c0,0,19.9-22.3,21.7-23.9l4.3-0.2'+
                                        'C220.3,508.2,194.1,542.1,193.6,542.1z')
                        .style('fill', '#000000');                
                    checkmark_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 170)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

                    
                    var redx_legend = vis.selectAll(".redx_legend")
                        .data(["Dropped Connections"])
                        .enter().append("g")
                        .attr("class", "redx_legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                    redx_legend.append('svg:path')
                        .attr('transform', 'translate(7,185) scale(0.5)')
                        .attr('d', 'M0,29.9c0-0.6,11.3-12,11.8-12.6c0.5-0.5-3.3-13-3.3-14.6C8.4,1.5,10.7,0,11.2,0'+
                                    'c2.1,0,9.4,9.1,9.4,9.1s11-8.2,12.3-7.8c2.5,0.8,3.5,3,2,4.4c-2.3,2.5-11,11.8-11,13.9c0,1,5.3,8.7,4.7,9.5l-3.1,4.5'+
                                    'c-0.6,0.9-10-7.7-10-7.7S5.3,35.8,4.9,35.8C4.5,35.8,0,30.5,0,29.9z')
                        .attr('style', 'fill:#f60000;fill-opacity:1;stroke:none;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1');    
                    redx_legend.append("text")
                        .attr("x", 38)
                        .attr("y", 194)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

                }, 0, false);
            })
        }
    };
}]);

angular.module('mean.pages').directive('makeNetworkTree', ['$timeout', '$rootScope', 'treeIcon', function ($timeout, $rootScope, treeIcon) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('networkChart', function (event, data) {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render

                    var margin = {top: 20, right: 120, bottom: 20, left: 120},
                        width = 960 - margin.right - margin.left,
                        height = 800 - margin.top - margin.bottom;

                    var i = 0,
                        duration = 750;

                    var tree = d3.layout.tree()
                        .size([height, width]);

                    var diagonal = d3.svg.diagonal()
                        .projection(function(d) { return [d.y, d.x]; });

                    var svg = d3.select("#networktree").append("svg")
                        .attr("width", width + margin.right + margin.left)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    data.x0 = height / 2;
                    data.y0 = 0;

                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }

                    data.children.forEach(collapse);
                    update(data);


                    d3.select(self.frameElement).style("height", "800px");

                    function update(source) {

                        // Compute the new tree layout.
                        var nodes = tree.nodes(data).reverse(),
                            links = tree.links(nodes);

                        // Normalize for fixed-depth.
                        nodes.forEach(function(d) { d.y = d.depth * 200; });

                        // Update the nodes…
                        var node = svg.selectAll("g.node")
                            .data(nodes, function(d) { return d.id || (d.id = ++i); });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                            .on("click", click);

                        var customNode = nodeEnter.append("g")
                            .attr("class", "points")
                            .append("text") 
                            .attr("x", function(d) { return d.children || d._children ? -32 : 18; })
                            .attr("dy", ".35em")
                            .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                            .text(function(d) { return d.name + ' - ' + d.value; })
                            .style("fill-opacity", 1e-6);

                        // nodeEnter.each(function(d) {
                        //     var elm = d3.select(this).append('g');
                        //     if (d.open) {
                        //         elm
                        //             .append('div')
                        //             .attr('transform', 'translate(10, -10)')
                        //             .append('text')
                        //             .text('[load all]')
                        //             .style('cursor', 'pointer')
                        //             .on('click', $scope.clickedNode(d))
                        //     }
                        // })

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                        nodeUpdate.select(".points").each(function(d){
                            var elm = d3.select(this);
                            treeIcon(d.value, elm);
                        })

                        d3.selectAll('g.points').each(function(d){
                            var elm = d3.select(this);
                            elm
                                .append('text')
                                .text(function(d){
                                    if ((d._children !== undefined) && (d._children !== null)) {
                                        return d._children.length;
                                    } else if ((d._children === null) || (d._children === undefined)){
                                        return '';
                                    }
                                })
                                .attr('transform', 'translate(-44,22)')
                                .style('font-size', 12)
                                .attr('fill', 'red')
                                .style('font-weight', 'bold')
                                .attr('text-anchor', 'middle');
                        })

                        nodeUpdate.select("text")
                            .style("fill-opacity", 1)
                            .style("font-size", 14);

                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                            .remove();

                        nodeExit.select("rect")
                            .attr('x', -6)
                            .attr('y', -6)
                            .attr('height', 0.1)
                            .attr('width', 0.1);

                        nodeExit.select("text")
                            .style("fill-opacity", 1e-6);

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(links, function(d) { return d.target.id; });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .style("fill", "none")
                            .style("stroke-width", 12)
                            .style("stroke-opacity", .4)
                            .attr("d", function(d) {
                                var o = {x: source.x0, y: source.y0};
                                return diagonal({source: o, target: o});
                            });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal);

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function(d) {
                                var o = {x: source.x, y: source.y};
                                return diagonal({source: o, target: o});
                            })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function(d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });
                    }

                    // Toggle children on click.
                    function click(d) {
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else {
                            d.children = d._children;
                            d._children = null;
                        }
                        update(d);
                    }

                }, 0, false);
            })
        }
    };
}]);

angular.module('mean.pages').directive('makeStealthForceChart', ['$timeout', '$rootScope', '$location', '$http', function ($timeout, $rootScope, $location, $http) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('stealthForceChart', function (event, data, params) {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render

                    var trig = d3.select("#stealthforcechart")
                        .append("div");

                    var trigger_leggend = trig.selectAll(".trigger_leggend")
                        .data(["test"])
                        .enter().append("button")
                        .text("Redraw")
                        .style("display","block")
                        .attr("class", "sUpload button-success pure-button")
                        .style("fill", "#000");

                    $('.sUpload').on('click',function(){
                        $scope.triggerScript();
                    });


                    var width = $('#stealthforcechart').width();
                    var height = width/1.5;
                    var tCount = [], link, node;
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
                            if (type === "role") {
                                return palette.pink;
                            } else if (type === "group") {
                                return palette.purple;
                            } else if (type === "coi") {
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
                        .append("svg")
                        .attr("class", "stage")
                        .attr("width", width)
                        .attr("height", height)
                        .call(d3.behavior.zoom().scaleExtent([0.5, 4]).on("zoom", zoom))
                        .append('g');

                      function zoom() {
                        vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                      }

                    // Add tooltip
                    $scope.tip = d3.tip()
                        .attr('class', 't-tip')
                        .offset([-50, -100])
                        .html(function(d) {
                            var title = "<strong>Rules: </strong> <br />";
                            var rules = "";
                            for (var i = 0; i < d.rules.length; i++) {
                                if (d.rules[i].rule !== "-") {
                                    rules += "&nbsp&nbsp&nbsp" + d.rules[i].order + " " + d.rules[i].rule + "<br />";
                                }                                
                            }
                            if (rules === "") {
                                return title + "None";
                            }
                            else {
                                return title + rules;
                            }                            
                        });
                        vis.call($scope.tip);
                   
                    var force = d3.layout.force()                        
                        .on("tick", tick)
                        .gravity(0.05)
                        .linkDistance(20)
                        .charge(-1500)
                        .size([width-50, height]);

                    function dragstart(d, i) {
                        d3.event.sourceEvent.stopPropagation();
                        d.fixed = true;
                        force.stop();
                    }

                    function dragmove(d, i) {
                        d.fixed = true; 
                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                        d.x += d3.event.dx;
                        d.y += d3.event.dy;
                        tick(); 
                    }

                    function dragend(d, i) {
                        d.fixed = true; 
                        $http({method: 'GET', url: '/api/stealth/stealth_deploy_config?type=checkCoor&user_login='+$scope.global.user.email+'&name='+d.name+'&page_title=stealth_COI_map'}).
                            success(function(data) { 
                                if (data["force"].length>0) {
                                    $http({method: 'POST', url: '/api/stealth/stealth_deploy_config', data: {x: d.x, y: d.y, user_login: $scope.global.user.email, name: d.name, page_title: "stealth_COI_map"}});
                                }else{
                                    $http({method: 'POST', url: '/api/stealth/stealth_deploy_config?type=insert', data: {x: d.x, y: d.y, user_login: $scope.global.user.email, name: d.name, page_title: "stealth_COI_map"}});
                                }
                            });
                        tick();
                        force.resume();
                    }

                    $scope.update = function() {
                        force
                            .nodes(data.nodes)
                            .links(data.links)
                            .start();

                        link = vis.selectAll(".link")
                            .data(data.links);
                            
                        link.enter().append("line")
                            .attr("class", "link")
                            .attr("stroke", "#CCC")
                            .attr("fill", "#000")
                            .style("stroke-width", "5");
                        link.exit().remove();


                        var node_drag = d3.behavior.drag()
                            .on("dragstart", dragstart)
                            .on("drag", dragmove)
                            .on("dragend", dragend);       

                        node = vis.selectAll(".node")
                            .data(data.nodes);    
                        node
                            .enter()
                            .append("g")
                            .attr("class", "node")
                            .call(node_drag);

                       // console.log("test");
                        var cldr;
                        //CIRCLE
                        var n = node.each(function(d){
                            if ((d.type === "role") || (d.type === "group")) {
                                d.fixed = true;
                            } 
                            //console.log(d);
                            var elm = d3.select(this)

                            if (d.hide !== "true") {
                               //console.log(d.index);
                               /* elm
                                    .attr('style', 'display:block');*/

                                if (d.gateway === 1) {
                                    elm
                                        .append('svg:path')
                                        .attr('transform', 'translate(-18,-18)')
                                        .attr('d', 'M18,0C8.059,0,0,8.06,0,18.001C0,27.941,8.059,36,18,36c9.94,0,18-8.059,18-17.999C36,8.06,27.94,0,18,0z')
                                        .attr('fill', '#67AAB5');
                                    elm
                                        .append('svg:path')
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
                                } else if (d.type === "user") {
                                    //console.log(d);
                                    elm
                                            .attr('height', '23')
                                            .attr('width', '23')
                                        .append('svg:path')
                                            .attr('transform', 'translate(-11,-11)')
                                            .attr('d', 'M22,22.5h-3.4c0,0,0-3.5,0-3.5c0-0.5-0.4-1.1-0.9-1.1'+
                                            'c-0.5,0-1,0.5-1,1.1c0,0,0,3.5,0,3.5H5.3c0,0,0-3.3,0-3.5c0-0.5-0.4-1.1-1-1.1c-0.5,0-1,0.5-1,1.1c0,0.1,0,3.5,0,3.5H0'+
                                            'c0,0,0-5.3,0-6.2c0-2.7,2.2-4.8,4.9-4.8c0.2,0,12,0,12.2,0c2.6,0,4.7,1.9,4.9,4.4L22,22.5z M11.1,0C8.4,0,6.2,2.2,6.2,4.9'+
                                            's2.2,4.9,4.9,4.9c2.7,0,4.9-2.2,4.9-4.9S13.8,0,11.1,0z')
                                            .style('fill-rule', '#evenodd')
                                            .style('clip-rule', '#evenodd')
                                            .style('fill', function(d, i) { return  color(d.group, d.type);} );
                                } else {
                                    elm
                                        .append("svg:circle")
                                        .attr("r", function (d) {return logslider(d["width"]); })
                                       // .attr("connections", $scope.requery(d))
                                        .attr("fill", function(d, i) { return  color(d.group, d.type); })
                                       // .style("stroke-width", "1.5px")
                                       // .style("stroke", "#fff")
                                }
                                if (d.type === "user") {
                                    elm
                                        .on('mouseover', function(d){
                                            elm.style('cursor', 'pointer')
                                        })
                                        .on('click', function (d){
                                            cldr = $scope.requery(d);   
                                           // $scope.update();
                                           return click(cldr);   
                                        });
                                        // .on("click", function (d){
                                        //     var link = {user: d.name};
                                        //     if ($location.$$search.start && $location.$$search.end) {
                                        //         link.start = $location.$$search.start;
                                        //         link.end = $location.$$search.end;
                                        //     }
                                        //     $scope.$apply($location.path('user_local').search(link));
                                        // });
                                } else if (d.type === "coi") {
                                    elm
                                        .on('mouseover', function(d){
                                            elm.style('cursor', 'pointer')
                                        })
                                        .on('click', function (d){
                                            cldr = $scope.requery(d);   
                                           // $scope.update();
                                           return click(cldr);
                                        })
                                        .on('mouseover', $scope.tip.show)
                                        .on('mouseout', $scope.tip.hide);
                                } else {
                                    elm
                                        .on('mouseover', function(d){
                                            elm.style('cursor', 'pointer')
                                        })
                                        .on('mouseout', "")
                                        .on('click', function (d){
                                            cldr = $scope.requery(d);   
                                           // $scope.update();
                                           return click(cldr);
                                        });
                                }
                            }else{
                                // console.log(d.hide);
                                /*elm
                                    .attr('style', 'display:none');*/
                            }
                        })
                        //TEXT
                        node.append("text")
                            .text(function(d, i) { return d.name })
                            .attr("x",    function(d, i) { return circleWidth + 5; })
                            .attr("y",            function(d, i) { return circleWidth + 0 })
                            // .attr("font-family",  "Bree Serif")
                            // .attr("fill",         function(d, i) {  return  palette.paleryellow;  })
                            .attr("font-size",    function(d, i) {  return  "1em"; })
                            .attr("text-anchor",  function(d, i) { return  "beginning"; })  
                        // node.transition()
                        //     .attr("r", function(d) { return 10; });
                        node.exit().remove();
                    };
                    $scope.update();

                    function tick() {
                        node[0].x = width;
                        node[0].y = height;
                        var value = 40; 

                        node.attr("cx", function(d) { 
                                return d.x = Math.max(value, Math.min(width - value, d.x)); 
                            })
                            .attr("cy", function(d) { 
                                return d.y = Math.max(value, Math.min(height - (value*5.6), d.y)); });

                        link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });


                        node.attr("transform", function(d, i) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                    }


                    //LEGEND

                    var legend_color = function(legend_item) {
                        if (legend_item === "Stealth Role") { 
                            return palette.pink;
                        } else if (legend_item === "AD Group") { 
                            return palette.purple;
                        } else if (legend_item === "Stealth COI") { 
                            return palette.green;
                        } else if (legend_item === "User with one COI") { //IP node with 1 COI group
                            return palette.blue;
                        } else if (legend_item === "User with two COIs") { //IP node with 2 COI groups
                            return palette.gray;
                        } else if (legend_item === "User with three COIs") { //etc...
                            return palette.yellow;
                        } else if (legend_item === "User with four COIs") {
                            return palette.orange;
                        } else {
                            return palette.red;
                        }
                    }

                    var circle_legend_data = ["Stealth Role", "AD Group", "Stealth COI"];
                    var circle_legend = vis.selectAll(".circle_legend")
                        .data(circle_legend_data)
                        .enter().append("g")
                        .attr("class", "circle_legend")
                        .attr("transform", function(d, i) { return "translate(11," + (i+5.5) * 24 + ")"; });

                    circle_legend.append("circle")
                        .attr("r", function (d) {return logslider(d["width"]) - 7; })
                        .style("fill", function(d) { return legend_color(d) });

                    circle_legend.append("text")
                        .attr("x",15)
                        .attr("y", -1)
                        .attr("dy", ".35em")
                        .text(function(d) { return d; });

                    var legend_data = ["User with one COI", "User with two COIs", 
                        "User with three COIs", "User with four COIs", "User with five or more COIs"];

                    var legend = vis.selectAll(".legend")
                        .data(legend_data)
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(2," + (i+1) * 20 + ")"; });

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
                        .data(["Cleartext COI"])
                        .enter().append("g")
                        .attr("class", "gateway_legend")
                        .attr("transform", function(d, i) { return "translate(0," + (i+1) * 20 + ")"; });

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

angular.module('mean.pages').directive('numbersOnly', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           // this next if is necessary for when using ng-required on your input. 
           // In such cases, when a letter is typed first, this parser will be called
           // again, and the 2nd time, the value will be undefined
           if (inputValue == undefined) return '' 
           var transformedInput = inputValue.replace(/[^0-9+.]/g, ''); 
           if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }         
           return transformedInput;         
       });
     }
   };
});

angular.module('mean.pages').directive('makeChordChart', ['$timeout', '$rootScope', '$http', function ($timeout, $rootScope, $http) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('chordChart', function (event, data) {


                // var infoDiv = d3.select('#chordchartinfo').append('table');

                // $scope.appendInfo = function(data, type) { 
                //     infoDiv.selectAll('tr').remove();

                //     var divInfo = '';
                //     if (type === "linkBetween") {
                //         var uniqueNodes = $scope.forcedata.uniqueNodes;
                //         var uniqueUsers = $scope.forcedata.uniqueUsers;
                //         var unique = [];
                //         var source = data.source.name;
                //         var target = data.target.name;             
                        
                //         for (var i in uniqueNodes[source]) {
                //             for (var j in uniqueNodes[target]) {
                //                 if (i === j) { 
                //                     unique.push(i);
                //                 }
                //             }         
                //         }
                //         for (var x=0; x<unique.length; x++) {
                //             var divInfo = '';
                //             divInfo += '<div><strong>'+unique[x]+'</strong></div>';
                //             for (var k in uniqueUsers) {
                //                 if (k === unique[x]) {
                //                     for (var z in uniqueUsers[k]) {
                //                         divInfo += '<div>'+z+'</div>';
                //                     }
                //                 }
                //             }
                //             var row = infoDiv.append('tr');
                //             row
                //                 .append('td')
                //                 .html(divInfo);
                //         }
                //     } else if (type === "rules"){
                //             var divInfo = '';
                //             divInfo += '<div><strong>Rules: </strong><br />';
                //             var rules = "";
                //             for (var i = 0; i < data.rules.length; i++) {
                //                 if (data.rules[i].rule !== "-"){
                //                     var ruleString = data.rules[i].rule.replace(/Except/g , "<br />Except");
                //                     divInfo += data.rules[i].order  + "<br />" + " " + ruleString + "<br />";
                //                 } else {
                //                     divInfo += "none <br />";
                //                 }                                    
                //             }
                //             var row = infoDiv.append('tr');
                //                 row
                //                     .append('td')
                //                     .html(divInfo);
                //     } else {
                //         for (var i in data) {
                //             if (typeof data[i] === 'object') {
                //                 var divInfo = '';
                //                 for (var e in data[i]) {
                //                     divInfo += '<div><strong>'+e+': </strong>'+data[i][e]+'</div>';
                //                 }
                //                 var row = infoDiv.append('tr');
                //                     row
                //                         .append('td')
                //                         .html(divInfo);
                //             } else {
                //                 var row = infoDiv.append('tr');
                //                     row
                //                         .append('td')
                //                         .html('<strong>'+dictionary(i)+'</strong>');
                //                     row
                //                         .append('td')
                //                         .text(data[i]);
                //             }
                //         }                            
                //     }  
                // }

                console.log(data.nodes)
                console.log(data.links)

                var matrix = [];
                for (var i = 0; i < data.nodes.length; i++) {
                    var row = [];
                    for (var j = 0; j < data.nodes.length; j++) {
                        row.push(0)
                    }
                    matrix.push(row);
                }

                for (var i = 0; i < data.links.length; i++) {
                    matrix[data.links[i].source][data.links[i].target] = data.links[i].value;
                    matrix[data.links[i].target][data.links[i].source] = data.links[i].value;
                }
                console.log(matrix);


                // var matrix = [
                //   [11975,  5871, 8916, 2868, 5000],
                //   [ 1951, 10048, 2060, 6171, 5000],
                //   [ 8010, 16145, 8090, 8045, 5000],
                //   [ 8010, 16145, 8090, 8045, 5000],
                //   [ 5000,   990,  940, 6907, 5000]
                // ];
                // var matrix = [
                //     [ 0, 1, 1, 0, 0],
                //     [ 1, 0, 6, 0, 1],
                //     [ 1, 6, 0, 0, 0],
                //     [ 0, 0, 0, 1, 0],
                //     [ 0, 1, 0, 0, 0]
                // ];

                var chord = d3.layout.chord()
                    .padding(.05)
                    .sortSubgroups(d3.descending)
                    .matrix(matrix);

                var width = 960,
                    height = 900,
                    innerRadius = Math.min(width, height) * .31,
                    outerRadius = innerRadius * 1.1;

                var fill = d3.scale.ordinal()
                    .domain(d3.range(10))
                    .range(["#000000", "#FFDD89", "#957244", "#F26223", "#0f0", "#f0f", "#00f"]);

                var svg = d3.select("#chordchart").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                var g = svg.selectAll(".group")
                      .data(chord.groups)
                    .enter().append("g")
                      .attr("class", "group");

                g.append("path")
                    .style("fill", function(d) { return fill(d.index); })
                    .style("stroke", function(d) { return fill(d.index); })
                    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
                    .on("mouseover", fade(.1))
                    .on("mouseout", fade(1))
                    // .on('click', function(d){
                    //     $scope.appendInfo(data.links, 'linkBetween');
                    //     //console.log("test")
                    // });


                g.append("text")
                    .attr("class", "chordlabel")
                    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
                    .attr("dy", ".35em")
                    .attr("transform", function(d) {
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                            + "translate(" + (outerRadius + 26) + ")"
                            + (d.angle > Math.PI ? "rotate(180)" : "");
                    })
                    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                    .text(function(d) { return data.nodes[d.index].name; });

                var ticks = svg.append("g").selectAll("g")
                        .data(chord.groups)
                    .enter().append("g").selectAll("g")
                        .data(groupTicks)
                    .enter().append("g")
                        .attr("transform", function(d) {
                            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                            + "translate(" + outerRadius + ",0)";
                        });

                ticks.append("line")
                    .attr("x1", 1)
                    .attr("y1", 0)
                    .attr("x2", 5)
                    .attr("y2", 0)
                    .style("stroke", "#000");

                ticks.append("text")
                    .attr("x", 8)
                    .attr("dy", ".35em")
                    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
                    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                    .text(function(d) { return d.label; });                

                svg.append("g")
                    .attr("class", "chord")
                  .selectAll("path")
                    .data(chord.chords)
                  .enter().append("path")
                    .attr("d", d3.svg.chord().radius(innerRadius))
                    .style("fill", function(d) { return fill(d.target.index); })
                    .style("opacity", 1);

                // Returns an array of tick angles and labels, given a group.
                function groupTicks(d) {
                  var k = (d.endAngle - d.startAngle) / d.value;
                  return d3.range(0, d.value, 1).map(function(v, i) {
                    return {
                      angle: v * k + d.startAngle,
                      //label: i % 5 ? null : v / 1000 + "k"
                      label: v
                    };
                  });
                }

                // Returns an event handler for fading a given chord group.
                function fade(opacity) {
                  return function(g, i) {
                    svg.selectAll(".chord path")
                        .filter(function(d) { return d.source.index != i && d.target.index != i; })
                      .transition()
                        .style("opacity", opacity);
                  };
                }







            }); 
        }
    };
}]);
