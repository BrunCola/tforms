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
                    var maxLength = 200;
                // if the string is less then our max length..
                if (description.length < 200) {
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
                        $state.go($state.current.name, searchObj);
                    });
                }
            }, 0, false);
        }
    };
}]);

angular.module('mean.pages').directive('makeTable', ['$timeout', '$location', '$rootScope', 'iocIcon', 'appIcon', 'mimeIcon', 'socket', '$http', 'timeFormat', function ($timeout, $location, $rootScope, iocIcon, appIcon, mimeIcon, socket, $http, timeFormat) {
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
                                        if (aData.time && $scope.r.indexOf('time') !== -1) {
                                            $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html(timeFormat(aData.time, 'tables'));
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
                                        //  console.log('poo')
                                        //  $('html, body').animate({scrollTop:0}, 'slow');
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
                                    if(aData.stealth !== undefined){                                        
                                        if (aData.stealth && $scope.r.indexOf('stealth') !== -1) {
                                            if (aData.stealth > 0){
                                                $('td:eq('+$scope.r.indexOf("stealth")+')', nRow).html('<span style="color:#000" class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-shield fa-stack-1x fa-inverse"></i></span>');
                                            }
                                        } else {
                                            $('td:eq('+$scope.r.indexOf("stealth")+')', nRow).html('');
                                        }
                                    }
                                    if (aData.proxy_blocked !== undefined && $scope.r.indexOf('proxy_blocked') !== -1) {
                                        if (aData.proxy_blocked == 0){
                                            $('td:eq('+$scope.r.indexOf("proxy_blocked")+')', nRow).html('<span style="color:#000" class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-check fa-stack-1x fa-inverse"></i></span>');
                                        } else if(aData.proxy_blocked > 0) {
                                            $('td:eq('+$scope.r.indexOf("proxy_blocked")+')', nRow).html('<span style="color:#E71010 " class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-times fa-stack-1x fa-inverse"></i></span>');
                                        }
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
                                                        $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<div style='height:50px;max-width:120px'><button class='bPage button-secondary pure-button' value='"+links+"'>"+timeFormat(aData[$scope.e[c].mData], 'tables')+"</button><br /><span style='font-size:9px; float:right;' data-livestamp='"+aData[$scope.e[c].mData]+"'></span></div>");
                                                    } else {
                                                        $('td:eq('+$scope.r.indexOf($scope.e[c].mData)+')', nRow).html("<button class='bPage btn btn-link' type='button' value='"+links+"' href=''>"+timeFormat(aData[$scope.e[c].mData], 'tables')+"</button>");
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
                            $scope.barChart
                                .group(group, "MB To Remote")
                                .valueAccessor(function(d) {
                                    return d.value.in_bytes;
                                })
                                .stack(group, "MB From Remote", function(d){return d.value.out_bytes;})
                                .stack(group, "MB To Remote (Conn)", function(d){return d.value.in_bytes2;})
                                .stack(group, "MB From Remote (Conn)", function(d){return d.value.out_bytes2;})
                                .stack(group, "MB To Remote (Drop)", function(d){return d.value.in_bytes3;})
                                .stack(group, "MB From Remote (Drop)", function(d){return d.value.out_bytes3;})
                                .legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
                                .colors(d3.scale.ordinal().domain(["in_bytes","out_bytes","in_bytes2","out_bytes2","in_bytes3","out_bytes3"]).range(["#034142","#068587","#1A4569","#3FA8FF","#73100A","#FF3628"]));
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

angular.module('mean.pages').directive('makeCoiChart', ['$timeout', '$rootScope', 'dictionary', function ($timeout, $rootScope, dictionary) {
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
                    
                    var vis = d3.select("#forcechart")
                        .append("svg:svg")
                        .attr("class", "stage")
                        .attr("width", width)
                        .attr("height", height);

                    var force = d3.layout.force()
                        .nodes(data.nodes)
                        .links(data.links)
                        .gravity(function(d) { 
                            if (d.class === 'child') {
                               return  -0.099;
                            } else {
                               return  0.5;
                            }
                        })
                        .linkDistance(function(d) { 
                            if (d.class === 'child') {
                                return  120;
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
                        .charge(-70)
                        .size([width-50, height]);

                    var link = vis.selectAll(".link")
                        .data(data.links)
                        .enter().append('g')
                        .attr('class', 'linkgroup')
                        .append("line")
                        .attr("class", "link")
                        .style('stroke', function(d){
                            if (d.class === 'child'){
                                return '#CC0000';
                            } else {
                                return '#259286';
                            }
                        })
                        .style('stroke-opacity', '1')
                        .attr('stroke-width', function(d){
                            if (d.class === 'child'){
                                return '4';
                            } else {
                                return '70';
                            }
                        });

                    var node = vis.selectAll("circle.node")
                        .data(data.nodes)
                        .enter().append("g")
                        .attr("class", "node")
                        .call(force.drag);

                    var tableDiv = d3.select('#force-table');
                    var infoDiv = d3.select('#forcechartinfo').append('table');

                    var circleWidth = 5;
                    node.each(function(d){
                        var elm = d3.select(this).append('g').attr('transform', 'scale(0.7)');
                        switch(d.group) {
                            case 'coi':
                                //CIRCLE
                                elm.append("svg:circle")
                                    .attr("cx", function(d) { return d.x; })
                                    .attr("cy", function(d) { return d.y; })
                                    .attr("r", function (d) {return logslider(d["width"]); })
                                    // .attr("fill", function(d, i) { if (i>0) { return  color(d.group); } else { return palette.red } } )
                                    .attr("fill", '#fff')
                                    .style("stroke-width", "14px")
                                    .style("stroke", "#259286");

                                //TEXT appends name
                                elm.append("text")
                                    // .text(function(d, i) { return d.name + '(' + count(d.width) + ')'; })
                                    .text(function(d, i) { return d.name; })
                                    .attr("x", 0)
                                    // .attr("y", function(d, i) { if (i>0) { return circleWidth + 40 }    else { return 8 } })
                                    // .attr("y", function(d) { if (d.name === 'ClearText') { return circleWidth - 70 } else { return 90 } })
   

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
                                    // .attr("x", 0)
                                    // // .attr("y", function(d) { if (d.name === 'ClearText') { return circleWidth + 2 } else { return 40 } })
                                    // .attr("y", 110)
                                    .attr("fill", '#515151')
                                    // .style("font-size", function(d, i) { if (d.name === 'ClearText') { return '5em' } else { return '10em'} })
                                    .style("font-size", '5em')
                                    .attr("text-anchor", 'middle');
                                // append a rectangle on top for click events
                                text.append('rect')
                                    .attr('x', -25)
                                    .attr('y', -49)
                                    .style('fill-opacity', 0)
                                    .attr('width', 50)
                                    .attr('height', 50)
                                    .on('mouseover', function(d){
                                        d3.select(this).style('cursor', 'pointer');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'users');
                                    });

                                // ICONS
                                // right button
                                elm
                                    .append('g')
                                    .attr('transform', 'scale(0.05)')
                                    .append('g')
                                    .attr('transform', 'translate(1400, -250)')
                                    .append('path')
                                        .attr('d', 'M 3.2256306,500.60601 C 3.2256306,491.25372 43.758136,444.29477 93.297856,396.25279 C 142.83758,348.21081 190.58002,301.56316 199.39218,292.59134 C 208.20433,283.61953 199.05159,231.54121 179.05273,176.86176 C 137.62307,63.587785 133.84657,25.920941 162.44557,11.22195 C 201.53416,-8.8683761 255.17957,20.811156 300.20945,87.440355 L 345.82828,154.94098 L 431.49626,85.021183 C 487.8258,39.04656 528.03591,18.570758 548.9095,25.231984 C 590.2087,38.411479 614.04278,89.982978 582.83295,98.634538 C 547.40845,108.45442 400.79201,294.00339 401.07018,328.6626 C 401.20186,345.07435 422.03434,388.63634 447.36457,425.46705 C 465.23081,451.44496 489.24604,471.94435 479.71274,486.03505 L 428.75193,561.35761 C 418.86818,575.96632 382.36042,537.01753 339.11325,499.2103 L 263.67191,433.25848 L 180.03742,515.74309 C 134.03845,561.10962 91.093734,597.99391 84.60471,597.70816 C 78.115704,597.42239 3.2256306,509.95831 3.2256306,500.60601 z ')
                                        .attr('style', 'fill:#f60000;fill-opacity:1;stroke:none;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1')
                                    .on('mouseover', function(d){
                                        d3.select(this).style('cursor', 'pointer');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'blocked');
                                    })
                                // left button
                                elm
                                    .append('g')
                                    .attr('transform', 'scale(2)')
                                    .append('g')
                                    .attr('transform', 'translate(-242.905,-523.4064)')
                                    .append('path')
                                        .style('fill', '#000000')
                                        .attr('d', 'M 197.67968,534.31563 C 197.40468,534.31208 196.21788,532.53719 195.04234,530.37143 L 192.905,526.43368 L 193.45901,525.87968 C 193.76371,525.57497 194.58269,525.32567 195.27896,525.32567 L 196.5449,525.32567 L 197.18129,527.33076 L 197.81768,529.33584 L 202.88215,523.79451 C 205.66761,520.74678 208.88522,517.75085 210.03239,517.13691 L 212.11815,516.02064 L 207.90871,520.80282 C 205.59351,523.43302 202.45735,527.55085 200.93947,529.95355 C 199.42159,532.35625 197.95468,534.31919 197.67968,534.31563 z ')
                                    .on('mouseover', function(d){
                                        d3.select(this).style('cursor', 'pointer');
                                    })
                                    .on('click', function(d){
                                        $scope.requery(d, 'right');
                                    })
                                // elm.append('rect')
                                //     .attr('width', 50)
                                //     .attr('height', 50)
                                //     .attr('x', -110)
                                //     .attr('y', -20)
                                //     
                                switch(d.name){
                                    case 'ClearText':
                                        elm.append('path')
                                            .style('fill', '#259286')
                                            .attr('d', 'M36.8,12.2L19.6,15l4.4-12L36.8,0V12.2z M3.8,20.8l9.2-3.7l5.4-11.4L3.8,20.8z M36.8,16.5l-18.6,3.8'+
                                            'L17.5,37h19.3V16.5z M12.2,21.6l-9.8,3.6L0,37h10.3L12.2,21.6z M42.8,12.2L59.9,15l-4.6-12L42.8,0V12.2z M60.4,5.8l5.4,11.4l9.2,3.7'+
                                            'L60.4,5.8z M42.8,37h20.4L61,20.3l-18.2-3.8V37z M68.6,37h10.3l-2.4-11.8l-9.8-3.6L68.6,37z M36.8,67.2l-17.3-2.8l4.4,12l12.8,3.1'+
                                            'V67.2z M18.5,73.6l-5.4-11.4l-9.2-3.7L18.5,73.6z M36.8,42H17.5l0.7,16.8l18.6,2.1V42z M10.3,42H0l2.4,11.9l9.8,3.7L10.3,42z'+
                                            ' M42.8,79.4l12.4-3.1l4.6-12l-17.1,2.8V79.4z M75.1,58.6l-9.2,3.7l-5.4,11.4L75.1,58.6z M42.8,60.9L61,58.8L63.2,42H42.8V60.9z'+
                                            ' M66.7,57.5l9.8-3.7L78.9,42H68.6L66.7,57.5z')
                                            .attr('transform', 'translate(-25,-115) scale(0.7)')
                                            .on('mouseover', function(d){
                                                d3.select(this).style('cursor', 'pointer');
                                            })
                                            .on('click', function(d){
                                                $scope.requery(d, 'top');
                                            });
                                        break;
                                    default:
                                        elm.append('polygon')
                                            .style('fill', '#515151')
                                            .attr('points', '53,18 53,10 60,10 60,0 44,0 44,10 51,10 51,16 31,16 31,10 38,10 38,0 22,0 22,10 29,10 '+
                                            '29,16 9,16 9,10 16,10 16,0 0,0 0,10 7,10 7,18 29,18 29,26 7,26 7,35 0,35 0,45 16,45 16,35 9,35 9,28 29,28 29,35 22,35 22,45 '+
                                            '38,45 38,35 31,35 31,28 51,28 51,35 44,35 44,45 60,45 60,35 53,35 53,26 31,26 31,18 ')
                                            .attr('transform', 'translate(-25,-110) scale(0.9)')
                                            .on('mouseover', function(d){
                                                d3.select(this).style('cursor', 'pointer');
                                            })
                                            .on('click', function(d){
                                                $scope.requery(d, 'top');
                                            })
                                        break;
                                }
                            break;
                            case 'child':

                                if (d.value.type === 'Stealth COI Mismatch') {
                                    elm.append("path")
                                        .attr('d', 'M14,3.1C9.4,3.3,7,0,7,0c0,0-2,3.1-7,3.1C-0.4,8.3,2.7,18,7,18C11.2,18,14.4,7.2,14,3.1z')
                                        .attr('transform', 'translate(-25,-115) scale(0.7)')
                                        .style('fill', '#333')
                                        .attr('transform', 'translate(-8,-8) scale(1.1)')
                                } else if(d.value.type === 'outside') {
                                    elm.append("circle")
                                        .attr("cx", function(d) { return d.x; })
                                        .attr("cy", function(d) { return d.y; })
                                        .attr("r", 8)
                                        .attr("fill", '#333')
                                } else if(d.value.type === 'Non-Stealth Internal Attack') {
                                    elm.append('rect')
                                        .attr('x', function(d) { return d.x; })
                                        .attr('y', function(d) { return d.y; })
                                        .attr('height', 14)
                                        .attr('width', 14)
                                        .style('fill', '#333')
                                        .attr('transform', 'translate(-8,-8)')
                                        .style('fill-opacity', '1')
                                }
                            break;
                        }
                    });
                    
                    $scope.appendInfo = function(data, type) {
                        console.log(type)
                        infoDiv.selectAll('tr').remove();
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
                                console.log('other')
                                var row = infoDiv.append('tr');
                                    row
                                        .append('td')
                                        .html('<strong>'+dictionary(i)+'</strong>');
                                    row
                                        .append('td')
                                        .text(data[i]);
                            }
                        }
                        // switch(type) {

                        // }
                    }
                    var linktext = d3.selectAll('.linkgroup');
                    var text = linktext
                        .append('text')
                        .attr("fill", '#fff')
                        .style('font-size', '3em')
                        .attr("text-anchor", 'middle')
                        .text(function(d) { return d.value; });

                    force.on("tick", function(e) {
                        text.attr("transform", function(d, i) {
                            var x1 = d.source.x;
                            var x2 = d.target.x;
                            var y1 = d.source.y;
                            var y2 = d.target.y;
                            var x = (x1+x2)/2;
                            var y = (y1+y2)/2;
                            return "translate(" + x + "," + y + ")";
                        });
                        node.attr("transform", function(d, i) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });

                        // node[0].x = width / 2;
                        // node[0].y = height / 3;
                        node[0].fixed = true;
                        node[0].x = 20;
                        node[0].y = 30;
                        link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; })
                    });
                    force.start();
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

angular.module('mean.pages').directive('makeStealthForceChart', ['$timeout', '$rootScope', '$location', function ($timeout, $rootScope, $location) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('stealthForceChart', function (event, data, params) {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
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



                    // Toggle children on click.
                    function click(connections) {
                        //.hide()
                        // console.log(" ");
                        // console.log(" ");
                        for(var i = 0; i<connections.length; i++){
                            // console.log(data.nodes[connections[i]].index);
                           if (data.nodes[connections[i]].hide) {
                                data.nodes[connections[i]]._hide= data.nodes[connections[i]].hide;
                                data.nodes[connections[i]].hide = null;
                            } else {
                                data.nodes[connections[i]].hide = "true";
                                data.nodes[connections[i]]._hide = null;
                            }
                        }
                        // console.log(" ");
                        // console.log(" ");
                        $scope.update();
                    }



                    var circleWidth = 5;
                    var vis = d3.select("#stealthforcechart")
                        .append("svg:svg")
                        .attr("class", "stage")
                        .attr("width", width)
                        .attr("height", height);

                    // Add tooltip
                    $scope.tip = d3.tip()
                        .attr('class', 't-tip')
                        .offset([-50, -100])
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
                   
                    var force = d3.layout.force()
                        
                        .on("tick", tick)
                        .gravity(0.20)
                        .linkDistance(20)
                        .charge(-1500)
                        .size([width-50, height]);

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

                        node = vis.selectAll(".node")
                            .data(data.nodes);    
                        node
                            .enter()
                            .append("g")
                            .attr("class", "node")
                            .call(force.drag);

                       // console.log("test");
                        var cldr;
                        //CIRCLE
                        var n = node.each(function(d){
                            //console.log(d);
                            var elm = d3.select(this)

                            if(d.hide !== "true"){
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
                                elm
                                    .append("rect")
                                    .attr("width", 22)
                                    .attr("height", 22)
                                   // .attr("connections", $scope.requery(d))
                                   // .attr("connections", $scope.requery(d))
                                    .attr("x", -11)
                                    .attr("y", -11)
                                    .attr("cx", function(d) { return d.x; })
                                    .attr("cy", function(d) { return d.y; })
                                    .attr("fill", function(d, i) { return  color(d.group, d.type); })
                                    //.style("stroke-width", "1.5px");
                                    //.style("stroke", "#fff");
                                } else {
                                    elm
                                        .append("svg:circle")
                                        .attr("r", function (d) {return logslider(d["width"]); })
                                       // .attr("connections", $scope.requery(d))
                                        .attr("fill", function(d, i) { return  color(d.group, d.type); })
                                       // .style("stroke-width", "1.5px")
                                       // .style("stroke", "#fff")
                                }
                                if(d.type === "user") {
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
                        node.attr("transform", function(d, i) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });

                        link.attr("x1", function(d)   { return d.source.x; })
                            .attr("y1", function(d)   { return d.source.y; })
                            .attr("x2", function(d)   { return d.target.x; })
                            .attr("y2", function(d)   { return d.target.y; })
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
                        .attr("transform", function(d, i) { return "translate(11," + (i+5) * 23 + ")"; });

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
                        .data(["Cleartext COI"])
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

angular.module('mean.pages').directive('laneGraph', ['$timeout', '$location', 'appIcon', '$rootScope', function ($timeout, $location, appIcon, $rootScope) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('laneGraph', function() {

                $.fn.scrollTo = function( target, options, callback ){
                if (typeof options == 'function' && arguments.length == 2) { callback = options; options = target; }
                    var settings = $.extend({
                        scrollTarget  : target,
                        offsetTop     : 0,
                        duration      : 200,
                        easing        : 'swing'
                    }, options);
                    return this.each(function(){
                        var scrollPane = $(this);
                        var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
                        var scrollY = (typeof scrollTarget == "number") ? scrollTarget + scrollPane.scrollTop() : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
                        scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
                            if (typeof callback == 'function') { callback.call(this); }
                        });
                    });
                }

                $scope.$broadcast('spinnerHide')

                var itemsDimension = $scope.crossfilterData.dimension(function(d){ return d.time });
                var items = itemsDimension.top(Infinity);
                $scope.inTooDeep = {
                    areWe: false,
                    min: null,
                    max: null
                };

                var laneLength = $scope.lanes.length;
                var width = element.width();

                var m = [5, 15, 15, 120], //top right bottom left
                    w = width - m[1] - m[3],
                    h = 470 - m[0] - m[2],
                    miniHeight = 0,
                    mainHeight = h - miniHeight - 50;

                var queryThreshhold = 3600; // one hour in seconds

                //scales
                var x = d3.time.scale()
                    .domain([new Date($scope.start), new Date($scope.end)])
                    .range([0, w]);
                var x1 = d3.time.scale()
                    .domain([new Date($scope.start), new Date($scope.end)])
                    .range([0, w]);
                var y1 = d3.scale.linear()
                    .domain([0, laneLength])
                    .range([0, mainHeight]);

                // current time div
                var currentTimeSlice = d3.select("#lanegraph").append('div').attr('class', 'timeslice');
                var currentTime = currentTimeSlice.append('div').style('float', 'left');

                // enhanced view alert
                $scope.alert = currentTimeSlice.append('div')
                    .attr('class', 'laneAlert')
                    .style('background-color', '#CC0000')
                    .style('padding', '0 10px 0 10px')
                    .style('text-align', 'center')
                    .style('color', '#FFFFFF')
                    .style('float', 'right')
                    .style('display', 'none')
                    .style('width', '140px');

                $scope.alert.html('Enhanced drill-down view');

                var chart = d3.select("#lanegraph")
                    .append("svg")
                    .attr("width", w + m[1] + m[3])
                    .attr("height", h + m[0] + m[2])
                    .on("dblclick", draw)
                    .attr("class", "chart");
            
                chart.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", w)
                    .attr("height", mainHeight);

                var main = chart.append("g")
                    .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
                    .attr("width", w)
                    .attr("height", mainHeight)
                    .attr("class", "main");

                var xAxis = d3.svg.axis()
                    .scale(x1)
                    .orient('bottom')
                     .tickFormat(d3.time.format('%H:%M'))
                    .tickSize(1)
                    .tickPadding(8);
                
                var xAxisBrush = chart.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + m[3] + "," + (mainHeight+9) + ")")
                    .call(xAxis);

                //main lanes and texts
                main.append("g").selectAll(".laneLines")
                    .data($scope.lanes)
                    .enter().append("line")
                    .attr("x1", m[1])
                    .attr("y1", function(d, i) { return y1(i);})
                    .attr("x2", w)
                    .attr("y2", function(d, i) {return y1(i);})
                    .attr("stroke", "lightgray");

                main.append("g").selectAll(".laneText")
                    .data($scope.lanes)
                    .enter().append("text")
                    .text(function(d) {return d;})
                    .attr("x", -m[1])
                    .attr("y", function(d, i) {return y1(i + .5);})
                    .attr("dy", ".5ex")
                    .attr("text-anchor", "end");

                function colors(type) {
                    switch(type){
                        case 'HTTP':
                            return "#67AAB5";
                        case 'SSL':
                            return "#A0BB71";
                        case 'File': // extracted files
                            return "#B572AB";
                        case 'DNS': // new dns
                            return "#708EBC";
                        case 'Conn': //first seen
                            return "#6FBF9B";
                        case 'Conn_ioc':
                            return "#EFAA86";
                        case 'HTTP_ioc':
                            return "#FFF2A0";
                        case 'SSL_ioc':
                            return "#D97373";
                        case 'File_ioc':
                            return "#F68D55";
                        case 'DNS_ioc':
                            return "#F3BD5D";
                        case 'Endpoint':
                            return "#7E9E7B";
                        case 'Stealth':
                            return "#0080CE";
                        default:
                            return "#D8464A";
                    }
                }

                $scope.point = function(element, type, name, id) {

                    //console.log(type);
                    if (type.search("ioc") !== -1) {
                        element.attr('class', 'IOC');
                        element = element.append('g')
                            .attr('transform', 'translate(-18, -6)scale(0.8)');
                        element.append('svg:path')
                            .attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z')
                            .attr('fill', colors(type));
                        element.append('svg:polygon')
                            .attr('points', '18.155,3.067 5.133,26.932 31.178,26.932 ')
                            .attr('fill', '#595A5C');
                        element.append('svg:polygon')
                            .attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
                            .attr('fill', colors(type));
                        element.append('rect')
                            .attr('x', 16.376)
                            .attr('y', 22.045)
                            .attr('fill', colors(type))
                            .attr('width', 2.838)
                            .attr('height', 2.448);
                        return;
                    } else { 
                        element.attr('class', id);
                        element = element.append('g').attr('transform', 'translate(-18, -6)scale(0.8)');
                        switch(type){
                            case 'secure':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#A0BB71'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('d', 'M25.518,13.467h-0.002c0-0.003,0.002-0.006,0.002-0.008c0-4.064-3.297-7.359-7.359-7.359'+
                                        'c-4.064,0-7.359,3.295-7.359,7.359c0,0.002,0,0.005,0,0.008v2.674H9.291V27.9h17.785v-11.76h-1.559V13.467z')
                                    .attr('fill', '#595A5C');
                                element.append('svg:path')
                                    .attr('d', 'M18.184,8.754c-3.191,0-4.661,2.372-4.661,4.967'+
                                        'c0,0.004,0,0.006,0,0.008v2.412h9.397v-2.412c0-0.002,0-0.004,0-0.008C22.92,11.126,21.315,8.754,18.184,8.754z')
                                    .attr('fill', '#A0BB71');
                                return;
                            case 'Conn':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#6FBF9B'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:polygon')
                                    .attr('points', '24.585,6.299 24.585,9.064 11.195,9.064 11.195,14.221 24.585,14.221 24.585,16.986 31.658,11.643 ')
                                    .attr('fill', '#595A5C');
                                element.append('svg:polygon')
                                    .attr('points', '10.99,17.822 3.916,23.166 10.99,28.51 10.99,25.744 24.287,25.744 24.287,20.59 10.99,20.59 ')
                                    .attr('fill', '#595A5C');
                                return;

                            case 'IOC Severity':
                                var color;
                                element.append('circle')
                                    .attr('fill', function(d){ 
                                        if(d.ioc_severity === 1){
                                            color = '#377FC7'; 
                                        }else if(d.ioc_severity === 2){
                                            color = '#F5D800'; 
                                        }else if(d.ioc_severity === 3){
                                            color = '#F88B12'; 
                                        }else if(d.ioc_severity === 4){
                                            color = '#DD122A'; 
                                        }else{
                                            color = '#6FBF9B'; 
                                        }
                                        return color;
                                    })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z')
                                    .attr('fill', color);
                                element.append('svg:polygon')
                                    .attr('points', '18.155,3.067 5.133,26.932 31.178,26.932 ')
                                    .attr('fill', '#595A5C');
                                element.append('svg:polygon')
                                    .attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
                                    .attr('fill', color);
                                element.append('rect')
                                    .attr('x', 16.376)
                                    .attr('y', 22.045)
                                    .attr('fill', color)
                                    .attr('width', 2.838)
                                    .attr('height', 2.448);
                                return;
                            case 'DNS':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#708EBC'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('d', 'M20.909,13.115c0-0.07,0-0.106-0.071-0.106c-0.283,0-6.022,0.813-7.935,0.956'+
                                        'c-0.036,0.955-0.071,2.053-0.071,3.009l2.267,0.106v8.707c0,0.071-0.035,0.143-0.142,0.178l-1.877,0.07'+
                                        'c-0.035,0.92-0.035,1.982-0.035,2.938c1.452,0,3.33-0.036,4.818-0.036h4.888V26l-1.949-0.07'+
                                        'C20.801,22.39,20.874,16.938,20.909,13.115z')
                                    .attr('fill', '#595A5C');
                                element.append('svg:path')
                                    .attr('d', 'M17.473,10.921c1.771,0,3.329-1.274,3.329-3.187c0-1.486-1.098-2.867-3.152-2.867'+
                                        'c-1.948,0-3.259,1.451-3.259,2.938C14.391,9.611,15.949,10.921,17.473,10.921z')
                                    .attr('fill', '#595A5C');
                                return;
                            case 'HTTP':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#67AAB5'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
                                        'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
                                        'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
                                        'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
                                        'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
                                        'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
                                        'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
                                        'l0.959-3.195l-2.882-1.775L24.715,19.976z')
                                    .attr('fill', '#595A5C');
                                return;
                            case 'SSL':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#A0BB71'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('fill', '#58595B')
                                    .attr('d', 'M25.5,16.1v-2.7h0c0,0,0,0,0,0c0-4.1-3.3-7.4-7.4-7.4c-4.1,0-7.4,3.3-7.4,7.4c0,0,0,0,0,0v2.7H9.3'+
                                    'v11.8h17.8V16.1H25.5z M22.9,13.7v2.4h-9.4v-2.4c0,0,0,0,0,0c0-2.6,1.5-5,4.7-5C21.3,8.8,22.9,11.1,22.9,13.7'+
                                    'C22.9,13.7,22.9,13.7,22.9,13.7z');
                                return;
                            case 'Endpoint':
                                element.append('circle')
                                    .attr('fill', '#7E9E7B')
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('d', 'M28.649,8.6H7.351c-0.684,0-1.238,0.554-1.238,1.238v14.363c0,0.684,0.554,1.238,1.238,1.238h7.529'+
                                        'l-1.09,3.468v0.495h8.419v-0.495l-1.09-3.468h7.529c0.684,0,1.237-0.555,1.237-1.238V9.838C29.887,9.153,29.333,8.6,28.649,8.6z'+
                                        'M28.477,22.072H7.635V10.074h20.842V22.072z')
                                    .attr('fill', '#595A5C');
                                return;
                            case 'Stealth':
                                element.append('circle')
                                    .attr('fill', '#0080CE')
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('fill', '#58595B')
                                    .attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
                                        'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
                                        'C28.014,15.545,26.676,21.468,23.587,26.751z');
                                element.append('svg:path')
                                    .attr('fill', '#0080CE')
                                    .attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
                                        'C11.076,16.238,11.938,20.26,13.699,23.661z');
                                return;
                            case 'Stealth_drop':
                                element.append('circle')
                                    .attr('fill', '#D8464A')
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('fill', '#58595B')
                                    .attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
                                        'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
                                        'C28.014,15.545,26.676,21.468,23.587,26.751z');
                                element.append('svg:path')
                                    .attr('fill', '#D8464A')
                                    .attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
                                        'C11.076,16.238,11.938,20.26,13.699,23.661z');
                                return;
                            case 'Email':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#39BFC1'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('polygon')
                                    .style('fill', '#58595B')
                                    .attr('points', '18,17.3 8.7,11.6 27.3,11.6 ');
                                element.append('polygon')
                                    .style('fill', '#58595B')
                                    .attr('points', '28.4,24.4 7.6,24.4 7.6,13.1 18,19.7 28.4,13.1 ');
                                return;
                            case 'File':
                                element.append('circle')
                                    .attr('fill', function(d){ return '#B572AB'; })
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('svg:path')
                                    .attr('d', 'M13.702,12.807h13.189c-0.436-0.655-1.223-1.104-2.066-1.104c0,0-7.713,0-8.361,0'+
                                        'c-0.386-0.796-1.278-1.361-2.216-1.361H7.562c-1.625,0-1.968,0.938-1.839,2.025l2.104,11.42c0.146,0.797,0.791,1.461,1.594,1.735'+
                                        'c0,0,2.237-10.702,2.378-11.308C12.005,13.334,12.403,12.807,13.702,12.807z')
                                    .attr('fill', '#595A5C');
                                element.append('svg:path')
                                    .attr('d', 'M29.697,13.898c0,0-14.47-0.037-14.68-0.037c-1.021,0-1.435,0.647-1.562,1.289l-2.414,10.508h16.716'+
                                        'c1.146,0,2.19-0.821,2.383-1.871l1.399-7.859C31.778,14.706,31.227,13.848,29.697,13.898z')
                                    .attr('fill', '#595A5C');
                                return;
                            case 'Applications':
                                element.append('circle')
                                    .attr('fill', '#DEDEDE')
                                    .attr('cx', 18)
                                    .attr('cy', 18)
                                    .attr('r', 18);
                                element.append('rect')
                                    .attr('x', 10)
                                    .attr('y', 10)
                                    .attr('height', 4)
                                    .attr('width', 17)
                                    .style('fill', '#5E5E5E');
                                element.append('rect')
                                    .attr('x', 10)
                                    .attr('y', 16)
                                    .attr('height', 4)
                                    .attr('width', 17)
                                    .style('fill', '#5E5E5E');
                                element.append('rect')
                                    .attr('x', 10)
                                    .attr('y', 22)
                                    .attr('height', 4)
                                    .attr('width', 17)
                                    .style('fill', '#5E5E5E');
                                return;
                            default:
                                return;
                        }
                    }
                }
 
                var brush = d3.svg.brush()
                    .x(x1)
                    .on("brushend", mouseup);
                main.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", 1)
                    .attr("height", mainHeight);

                var itemRects = main.append("g")
                    .attr("clip-path", "url(#clip)");
                
                // nav
                var navArray = [], currentNavPos = 0;
                var buttonHolder = d3.select("#lanegraph").append('div').attr('class', 'buttonHolder');
                var resetBtn = buttonHolder
                    .append('button')
                    .html('Reset')
                    .attr('class', 'resetButton')
                    .on('click', function(){
                        draw();
                    });
                var prevButton = buttonHolder.append('button')
                    .html('Previous')
                    .attr('class', 'prevButton')
                    .on('click', function(){
                        if (currentNavPos > 0) {
                            nextButton.attr('disabled', null);
                            currentNavPos--;
                            mouseup('nav');
                        }
                    });
                var nextButton = buttonHolder
                    .append('button')
                    .html('Next')
                    .attr('class', 'prevButton')
                    .on('click', function(){
                        if (currentNavPos < navArray.length) {
                            prevButton.attr('disabled', null);
                            currentNavPos++;
                            mouseup('nav');
                        }
                    });
                var qMarkButton = buttonHolder
                    .append('button')
                    .html('?')
                    .attr('class', 'qMarkButton')
                    .on('click', function(){
                        $scope.description(
                            "This chart represents discrete events deemed significant to the IOC being examined "+
                            "(i.e. it is related to the 3-tuple which includes local, remote and IOC information)."+
                            "Discrete event categories available are: IOC - describing the indicator, conn - the "+
                            "raw IP connection information, applications that were used by the use, DNS queries, "+
                            "HTTP queries, SSL connections, File metadata, and Endpoint events)."+
                            "To view details of any event, click the icon in the chart and details will be "+
                            "highlighted in the table to the left.  Further information will be displayed by "+
                            "clicking the \"+\" sign for each record."+
                            "To view ALL event data in the chart, left mouse click and drag over the area to zoom."+
                            "If the zoom area covers a time slice less than 60 minutes, an \"Enhanced View\" will "+
                            "be displayed on the screen, showing every event triggered by the local endpoint within"+
                            "the time slice.  This query can take a few seconds to display, depending on the amount"+
                            "of information.  Once the enhanced view data is presented, you can continue to zoom as "+
                            "needed.",
                            "Event Timeline Navigation");
                    });

                // var timeShiftHolder = d3.select("#lanegraph").append('div').attr('class', 'timeShiftHolder');
                // var nextTime = timeShiftHolder
                //     .append('button')
                //     .html('Prev')
                //     .attr('class', 'prevButton')
                //     .on('click', function(){
                //         timeShift('prev');
                //     });
                // var prevTime = timeShiftHolder
                //     .append('button')
                //     .html('Next')
                //     .attr('class', 'navButton')
                //     .on('click', function(){
                //         timeShift('next');
                //     });

                function laneInfoAppend(d) {
                    var send = '';
                    for (var i in d) {
                        send += '<strong>'+d[i].name+':</strong> '+d[i].value+'<br />';
                    }
                    return send;
                }
                // info div
                var infoHeight = element.height();
                var infoTitle = d3.select("#lanegraphinfo").style('height', infoHeight+'px').style('overflow', 'scroll');
                var infoDiv = d3.select("#lanegraphinfo").style('height', infoHeight+'px').style('overflow', 'scroll');

                // function timeShift(cmd) {
                //     // calculate what the current time shift would be (forward or back)
                //     var minExtent = moment(navArray[currentNavPos].min).unix();
                //     var maxExtent = moment(navArray[currentNavPos].max).unix();
                //     var difference = maxExtent - minExtent;
                //     // take a fraction of difference
                //     var diff = difference * 0.90;
                //     if (cmd === 'prev') {
                //         var max = minExtent + (difference - diff);
                //         var min = max - diff;
                //     }
                //     if (cmd === 'next') {
                //         var min = maxExtent - (difference - diff);
                //         var max = min + diff;
                //     }
                //     var minFormatted = moment(min).format('MMMM D, YYYY h:mm A');
                //     var maxFormatted = moment(max).format('MMMM D, YYYY h:mm A');
                //     $scope.requery(maxFormatted, minFormatted, function(data){
                //         plot(data, maxFormatted, minFormatted);
                //         navArray.push({'min': minFormatted, 'max': maxFormatted});
                //         currentNavPos++;
                //     })                
                // }

                function draw() {
                    // reset navagation array
                    navArray = [];
                    // set current position in nav array
                    currentNavPos = 0;
                    // disable all nav buttons
                    prevButton.attr('disabled', 'disabled');
                    nextButton.attr('disabled', 'disabled');
                    resetBtn.attr('disabled', 'disabled');
                    // push current time position to nav array
                    navArray.push({'min': new Date($scope.start), 'max': new Date($scope.end)});
                    // push time slice heading t odiv
                    currentTime.html('Current Time Slice: <strong>'+$scope.start+'</strong> - <strong>'+$scope.end+'</strong>');
                    // convert min and max to date object and send to plot function
                    var min = new Date($scope.start);
                    var max = new Date($scope.end);
                    items.reverse()
                    plot(items, min, max);
                }
                draw();

                function mouseup(action) {
                    // set variables
                    var rects, labels, minExtent, maxExtent, visItems;
                    // if a nav button is pressed
                    if (action === 'nav') {
                            // get max and min (date objects) from mav array
                            minExtent = navArray[currentNavPos].min;
                            maxExtent = navArray[currentNavPos].max;
                        // disable previous button if all the way back
                        if (currentNavPos === 0) {
                            resetBtn.attr('disabled', 'disabled');
                            prevButton.attr('disabled', 'disabled');
                        // or disable next button if all the way forward 
                        } else if (currentNavPos === navArray.length-1) {
                            nextButton.attr('disabled', 'disabled');
                        } else {
                            // otherwise keep reset button open
                            resetBtn.attr('disabled', null);
                        }
                    // otherwise if item brushed
                    } else {
                        // get max and min from click/drag
                        minExtent = brush.extent()[0];
                        maxExtent = brush.extent()[1];
                        // step up nav array pos and push new values in;
                        currentNavPos++;
                        navArray.push({'min': minExtent, 'max': maxExtent});
                        prevButton.attr('disabled', null);
                        resetBtn.attr('disabled', null);
                    }
                    // convert times returned to unix
                    var minUnix = moment(minExtent).unix();
                    var maxUnix = moment(maxExtent).unix();
                    // should it requery?
                    var msDifference = maxUnix - minUnix;
                    // if difference is less than threshhold or is not a single time select (resulting in difference being 0)
                    if ((msDifference < queryThreshhold) && (msDifference !== 0)) {
                        // push to requery and then plot
                        $scope.requery(minExtent, maxExtent, function(data){
                            data.reverse();
                            plot(data, minExtent, maxExtent);
                        })
                    } else {
                        // reset if not within threshold
                        $scope.inTooDeep.areWe = false;
                        var data = items.filter(function(d) { if((d.dd < maxExtent) && (d.dd > minExtent)) {return true} ;}).reverse();
                        $scope.alert.style('display', 'none');
                        plot(data, minExtent, maxExtent);
                    }
                }

                function scrollSide(id) {
                    var elm = $('li#'+id);
                    var ept  = elm.position().top;
                    var eppt = elm.parent().position().top;
                    var offset = ept - eppt;
                    var totalHeight = $('#lanegraphinfo')[0].scrollHeight;
                    var windowHeight = $('#lanegraphinfo').height();
                    if(offset>(totalHeight-windowHeight)){
                        offset = totalHeight-windowHeight;
                    }
                    $('#lanegraphinfo').scrollTo(offset);
                }

                function plot(data, min, max) {
                    if (moment(max).unix() !== moment(min).unix()) {
                        //////////////////
                        /// LANE NODES ///
                        //////////////////
                        // set variables for info sidebar
                        var prevPos = 0;
                        var previousID = -1, previousElm = null;
                        var lastExpandedId = null, isOpen = null;
                        //console.log("plot");
                        // update time slice above chart
                        currentTime.html('Current Time Slice: <strong>'+moment(min).format('MMMM D, YYYY HH:MM A')+'</strong> - <strong>'+moment(max).format('MMMM D, YYYY HH:MM A')+'</strong>')
                        // create transition effect of slider
                        main.select('g.brush .extent')
                            .transition()
                            .duration(150)
                            .attr('width', w)
                            // .attr('x', function(d) {console.log(x); return x/2 })
                            .transition()
                            .duration(50)
                            .attr('width', 0);
                        // set new domain and transition x-axis
                        x1.domain([min, max]);
                        xAxisBrush.transition().duration(500).call(xAxis);
                        // remove existing elements (perhaps this is innificent and should be modified to just transition)
                        itemRects.selectAll('g').remove();
                        var icons = itemRects.selectAll("g").data(data);
                        // re-enter an append nodes (innificent as well)
                        icons.enter().append("g").each(function(d){
                            var elm = d3.select(this);

                            elm
                                .attr('transform', 'translate('+x1(d.dd)+','+(y1(d.lane) + 10)+')')
                                .attr("class", function(d) {return "mainItem" + d.lane;})
                                .on("mouseover", function(d){
                                    elm.style('cursor', 'pointer');
                                })
                                .on("click", function(d){

                                    itemRects.selectAll('g').each(function(d){
                                        var elm = d3.select(this);
                                        elm.attr('class', null);
                                    })
                                    // un-highlight previous box
                                    $('#'+previousID).attr('class', null);
                                    // this closes the last expanded block if there is one
                                    if (lastExpandedId !== null) {
                                        $('div'+lastExpandedId+'.infoDivExpanded').hide();
                                    }

                                    if($('#autoexpand').is(':checked')){
                                        if (isOpen === '#'+d.id) {
                                            $('#'+d.id+' .infoDivExpanded').css('display', 'none');
                                            isOpen = null;
                                        } else {
                                            $('#'+d.id+' .infoDivExpanded').css('display', 'block');
                                            lastExpandedId = '#'+d.id;
                                            isOpen = '#'+d.id;

                                            $('#'+d.id+' .infoDivExpanded').html(laneInfoAppend(d.expand));
                                        }
                                    }
                                    // deselect previous element if there is one
                                    if (previousElm !== null) {
                                        previousElm.attr('class', null);
                                    }
                                    // make current node active
                                    elm.attr('class', 'pointactive');
                                    // set class for active description
                                    $('#'+d.id).attr('class', 'laneactive');
                                    // scroll to position

                                    scrollSide(d.id);
                                    // prevPos = currPos;

                                    // set ids for cross-refrence
                                    previousID = d.id;
                                    previousElm = elm;
                                });
                                // .attr("width", 5)
                                // .attr("height", function(d) {return .8 * y1(1);});
                            // generate points from point function
                            if (d.type !== 'l7') {
                                $scope.point(elm, d.type, null, d.id);
                            } else {
                                // push app name to point function if type is l7
                                $scope.point(elm, d.type, d.l7_proto, d.id);
                            }
                        })
                        icons.exit();

                        ////////////////////
                        /// SIDEBAR LIST ///
                        ////////////////////


                        infoDiv.selectAll('li').remove();
                        infoDiv.selectAll('li').data(data).enter()
                            .append('li').each(function(d){
                                var elm = d3.select(this);
                                elm
                                    // append id to li from data object
                                    .attr('id', function(d){return d.id })
                                    .html(function(d){
                                        // set d.postion (INIFFICENT!)
                                        d.position = ($('li#'+d.id).offset().top - $('li#'+d.id).parent().offset().top);
                                        return "<div class='lanegraphlist'>"+d.info+"</div>";
                                    })
                                    .on('click', function(){

                                        scrollSide(d.id);
                                        // close last expanded sections
                                        if (lastExpandedId !== '#'+d.id) {
                                            $('div'+lastExpandedId+'.infoDivExpanded').hide();
                                        }
                                        // clear previous node
                                        if (previousElm !== null){
                                            previousElm.attr('class', null);
                                        }
                                        // clear class of previous li item
                                        $('#'+previousID).attr('class', null);

                                        // console.log(d.id)
                                        // // var thisNode = itemRects.select('g.'+d.id);
                                         
                                        // itemRects.selectAll('g').each(function(c){
                                        //     var elm = d3.select(this);
                                        //     if (c.id === d.id) {
                                        //         previousElm.attr('class', null);
                                        //         elm.attr('class', 'pointactive');
                                        //         previousElm = elm;
                                        //     }        
                                        // })

                                        // console.log(thisNode)
                                        // // todo: select the current node somehow so i can apply style to it and creat e previousNode refrence
                                        // // get this id

                                        var row = d3.select(this);
                                        var id = row.attr('id'); 
                                            row.attr('class', 'laneactive');
                                        // iterate through points
                                        itemRects.selectAll('g').each(function(d){
                                            var elm = d3.select(this);
                                            // if id's (of just clicked) match
                                            if (d.id.toString() === id.toString()) {
                                                elm.attr('class', 'pointactive');
                                                previousElm = elm;
                                            } else {
                                                elm.attr('class', null);
                                            }
                                        })

                                        // set previous id
                                        previousID = id;

                                    })
                                    // append expand buttons to list elements
                                    .append('div')
                                    .on('click', function(){
                                        if (lastExpandedId !== '#'+d.id) {
                                            $('div'+lastExpandedId+'.infoDivExpanded').hide();
                                        }
                                        if (isOpen === '#'+d.id) {
                                            elm.select('.infoDivExpanded').style('display', 'none');
                                            isOpen = null;
                                        } else {
                                            elm.select('.infoDivExpanded').style('display', 'block');
                                            lastExpandedId = '#'+d.id;
                                            isOpen = '#'+d.id;

                                            elm.select('.infoDivExpanded').html(laneInfoAppend(d.expand));
                                        }

                                    })
                                    .attr('class', 'infoDivExpandBtn')
                                    .html('+');
                                elm
                                    .append('div')
                                    .style('display', 'none')
                                    .attr('class', 'infoDivExpanded')
                                    .attr('id', d.id);
                            });
                        //infoDiv.selectAll('li')[0].reverse();
                            //[0].reverse();
                    }
                }
                
                // function listItems

            });
        }
    };
}]);
