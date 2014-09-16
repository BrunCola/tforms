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
                                    if (aData.stealth && $scope.r.indexOf('stealth') !== -1) {
                                        if (aData.stealth > 0){
                                            $('td:eq('+$scope.r.indexOf("stealth")+')', nRow).html('<span style="color:#000" class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:#fff" class="fa fa-shield fa-stack-1x fa-inverse"></i></span>');
                                        }
                                    } else {
                                        $('td:eq('+$scope.r.indexOf("stealth")+')', nRow).html('');
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

//NETWORK TREE STARTS HERE

angular.module('mean.pages').directive('makeNetworkTree', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
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
                            switch(d.value) {
                                case 'Network':
                                    //RapidPHIRE logo
                                    elm.append('rect')
                                        .attr('x', -30)
                                        .attr('y', -40)
                                        .attr('height', 80)
                                        .attr('width', 80)
                                        .style('fill', '#383E4D')
                                        .style('fill-opacity', 1);

                                    elm.append('path') //chevron
                                        .attr('d', 'M1.6,21.2l13.4-10.7l13.5,10.7L14.9,5.9L1.6,21.2z')
                                        .attr('fill', '#ED1F24')
                                        .attr('transform', 'translate(-28,-35) scale(2.5,2.5)');
                                        break;

                                case 'Linux':
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
                                        'c-0.2-0.2-0.6-0.2-0.7-0.5c-0.2-0.5-0.3-1.1-0.2-1.7c0.1-0.8,0.5-0.8,1.2-0.9C27.4,7.4,28,7.4,28.5,7.6z M22.4,7.6c0.2,0.1,0.5,0.1'+
                                        ',0.6,0.3c0.2,0.4,0.2,0.8,0.3,1.3'+
                                        'c0,0.3,0,0.6-0.1,1c-0.1,0-0.4,0.4-0.5,0.2c0.3-0.8,0-2.8-1.2-2.1c-1,0.6-0.6,2.3,0.3,2.7c-0.6,0.3-0.7,0.3-1-0.3'+
                                        'c-0.2-0.6-0.4-1.1-0.3-1.7c0-0.6,0-0.8,0.6-1.2C21.6,7.6,21.9,7.6,22.4,7.6z M28.7,14.3c0.3,0.9,0.4,1.9,0.8,2.9c0.4,1,0.8,1.9,1.3,2.8'+
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
                                        'C22.9,10.6,23.9,9.4,24.7,9.6z M13.7,34.6c0.6,0.2,0.9,1.1,1.2,1.7c0.4,1,0.8,2.1,1.1,3.1'+
                                        'c0.6,1.9,1,3.9,1,6c0,1.7-1.3,2.9-3,2.9c-1,0-1.8-0.5-2.6-0.9c-1-0.5-1.8-1.1-2.7-1.7c-1.5-1.1-3.7-2.4-4.3-4.1'+
                                        'C4,40.8,5,39.9,5.9,39.9c0.7-0.2,1.5,0,1.9-0.8c0.3-0.5-0.1-1.3,0.2-1.9c0.4-0.8,1.5-0.4,2.2-0.2c0.4,0.1,0.6,0.3,0.9-0.1'+
                                        'c0.4-0.4,0.6-0.9,0.9-1.4C12.2,35.3,13.6,34.1,13.7,34.6z M31.6,36.3c0.3,0,0.6,0.3,0.9,0.3c0.1,0.5-0.1,0.9,0.1,1.4'+
                                        'c0.2,0.9,1.2,1.5,2,1.7c2,0.7,2.6-1.1,3.4-2.6c0.5,0.2,0.4,1.1,0.6,1.6c0.3,0.7,1.1,0.7,1.8,0.5c1.5-0.2,3.9-0.1,3.2,2'+
                                        'c-1,1.4-2,2.7-3.1,4c-0.6,0.5-1,1.2-1.6,1.7c-0.6,0.5-1.2,0.9-1.8,1.4c-1.4,1.1-2.7,1.8-4.5,1.3c-2-0.5-2.3-2.6-2.6-4.3'+
                                        'c-0.4-1.9-0.4-3.9-0.3-5.9c0.1-0.9,0.2-1.7,0.3-2.6C30.1,36.2,31,35.8,31.6,36.3z')
                                        .attr('transform', 'translate(-30,-25)');
                                        break;

                                case 'MacOS':
                                    elm.append('path')
                                        .style('fill', '#828487')
                                        .style('stroke-width', 0.8)
                                        .style('stroke', 'white')
                                        .attr('d', 'M28.8,13.7c0.9-1.2,1.6-2.8,1.3-4.5c-1.5,0.1-3.2,1-4.2,2.3c-0.9,1.1-1.7,2.8-1.4,4.4'+
                                        'C26.2,15.9,27.9,15,28.8,13.7z M33.2,21.7c0.4-1.3,1.4-2.4,2.7-3.2c-1.4-1.8-3.4-2.8-5.3-2.8c-2.5,0-3.5,1.2-5.2,1.2'+
                                        'c-1.8,0-3.1-1.2-5.3-1.2c-2.1,0-4.3,1.3-5.8,3.5c-0.5,0.8-0.9,1.8-1.1,2.9c-0.5,3.1,0.3,7.2,2.7,10.9c1.2,1.8,2.7,3.8,4.7,3.8'+
                                        'c1.8,0,2.3-1.2,4.8-1.2c2.4,0,2.9,1.2,4.7,1.2c2,0,3.6-2.2,4.8-4c0.8-1.3,1.1-1.9,1.8-3.3C33.5,28.2,32.2,24.6,33.2,21.7z')
                                        .attr('transform', 'translate(-40,-40) scale(1.5)');
                                        break;

                                case 'Windows':
                                elm.append('polygon')
                                    .style('fill', '#fff')
                                    .attr('points', '9,14 37,9 37,40 9,35 ')
                                    .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                    .style('fill', '#00AEEF')
                                    .attr('points', '36.1,24.4 36.1,11.9 21.7,14 21.7,24.4 ')
                                    .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                    .style('fill', '#00AEEF')
                                    .attr('points', '20.7,14.1 10.2,15.6 10.2,24.4 20.7,24.4 ')
                                    .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                    .style('fill', '#00AEEF')
                                    .attr('points', '10.2,25.4 10.2,34.3 20.7,35.9 20.7,25.4 ')
                                    .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                    .style('fill', '#00AEEF')
                                    .attr('points', '21.7,36 36.1,38.1 36.1,25.4 21.7,25.4 ')
                                    .attr('transform', 'translate(-40,-32) scale(1.2)');
                                    break;

                                case 'Windows Vista/Server 2008':
                                    elm.append('path')
                                        .style('fill', '#FFFFFF')
                                        .attr('d', 'M15.8,12.1c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                                        'C13.3,20.6,15.8,12.1,15.8,12.1z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#D76D27')
                                        .attr('d', 'M15.8,12.1c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                                        'C13.3,20.6,15.8,12.1,15.8,12.1z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#0891C9')
                                        .attr('d', 'M12.2,24.7c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                                        'C9.7,33.2,12.2,24.7,12.2,24.7z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#88B33F')
                                        .attr('d', 'M37.8,25.6c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                                        'C40.3,17.1,37.8,25.6,37.8,25.6z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#FDCF33')
                                        .attr('d', 'M34.4,37.9c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                                        'C36.8,29.4,34.4,37.9,34.4,37.9z')
                                        .attr('transform', 'translate(-30,-25)');
                                    break;

                                case 'Windows 7/Server 2008R2':
                                    elm.append('path')
                                        .style('fill', '#FFFFFF')
                                        .attr('d', 'M15.8,12.1c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                                        'C13.3,20.6,15.8,12.1,15.8,12.1z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#D76D27')
                                        .attr('d', 'M15.8,12.1c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                                        'C13.3,20.6,15.8,12.1,15.8,12.1z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#0891C9')
                                        .attr('d', 'M12.2,24.7c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                                        'C9.7,33.2,12.2,24.7,12.2,24.7z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#88B33F')
                                        .attr('d', 'M37.8,25.6c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                                        'C40.3,17.1,37.8,25.6,37.8,25.6z')
                                        .attr('transform', 'translate(-30,-25)');

                                    elm.append('path')
                                        .style('fill', '#FDCF33')
                                        .attr('d', 'M34.4,37.9c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                                        'C36.8,29.4,34.4,37.9,34.4,37.9z')
                                        .attr('transform', 'translate(-30,-25)');
                                    break;

                                case 'Windows 95':
                                    elm.append('path')
                                        .style('fill', '#000')
                                        .attr('d', 'M41.3,12v25.1c-3.5-2.2-8.2-2.6-12.4-1.8c-1.5,0.4-3,0.7-4.3,1.3V11.7'+
                                        'c4-1.7,9.2-2.4,13.5-1.1C39.3,11,40.3,11.4,41.3,12L41.3,12z')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '24.2,15.4 20.9,16.7 20.9,13.5 24.2,11.9 24.2,15.4 24.2,15.4 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '10.1,14 8.3,14.6 8.3,13.3 10.1,12.7 10.1,14 10.1,14 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '20.4,15.8 17.3,17 17.3,14.5 20.4,13.2 20.4,15.8 20.4,15.8 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '13.9,16.6 13.9,14.6 16.7,13.5 16.7,15.4 13.9,16.6 13.9,16.6 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '13.3,15.1 11,15.9 11,14.5 13.3,13.5 13.3,15.1 13.3,15.1 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '24.2,18.8 20.9,20.3 20.9,17.2 24.2,15.9 24.2,18.8 24.2,18.8 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '24.2,22.3 20.9,23.8 20.9,20.7 24.2,19.3 24.2,22.3 24.2,22.3 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '20.9,27.3 20.9,24.3 24.2,22.7 24.2,25.9 20.9,27.3 20.9,27.3 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '10.1,24.8 8.3,25.4 8.3,24.1 10.1,23.5 10.1,24.8 10.1,24.8 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '20.4,26.5 17.3,27.7 17.3,25.1 20.4,24 20.4,26.5 20.4,26.5 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '16.7,26.2 14.1,27.3 13.9,27.3 13.9,25.4 16.7,24.3 16.7,26.2 16.7,26.2 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '13.3,25.9 11,26.7 11,25.2 13.3,24.3 13.3,25.9 13.3,25.9 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '20.9,30.9 20.9,27.7 24.2,26.4 24.2,29.4 20.9,30.9 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '24.2,33 20.9,34.4 20.9,31.4 24.2,29.9 24.2,33 24.2,33 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '24.2,36.8 20.9,38.1 20.9,34.9 24.2,33.5 24.2,36.8 24.2,36.8 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '10.1,35.5 8.3,36.2 8.3,35.1 10.1,34.3 10.1,35.5 10.1,35.5 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '20.4,37.2 17.3,38.4 17.3,35.9 20.4,34.6 20.4,37.2 20.4,37.2 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '13.9,38 13.9,36 16.7,34.9 16.7,36.8 13.9,38 13.9,38 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#000')
                                        .attr('points', '13.3,36.5 11,37.3 11,35.9 13.3,34.9 13.3,36.5 13.3,36.5 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '9.9,28.3 8.6,28.9 8.6,27.7 9.9,27.2 9.9,28.3 9.9,28.3 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '20.2,30.1 17.6,31 17.6,28.8 20.2,27.8 20.2,30.1 20.2,30.1 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '16.5,29.8 14.3,30.7 14.3,28.9 16.5,28 16.5,29.8 16.5,29.8 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '13.1,29.4 11.2,30.1 11.2,28.8 13.1,28 13.1,29.4 13.1,29.4 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '9.9,32 8.6,32.5 8.6,31.4 9.9,30.9 9.9,32 9.9,32 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '20.2,31.4 20.2,33.5 17.6,34.6 17.6,32.3 20.2,31.4 20.2,31.4 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '16.5,33.3 14.3,34.1 14.3,32.3 16.5,31.5 16.5,33.3 16.5,33.3 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#118ACB')
                                        .attr('points', '13.1,32.8 11.4,33.6 11.2,32.3 13.1,31.5 13.1,32.8 13.1,32.8 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#118ACB')
                                        .attr('d', 'M24.6,33.3c1.8-0.6,3.6-1.1,5.5-1.4h0.2l-0.2-8c-1.9,0.3-3.7,1-5.5,1.8V33.3L24.6,33.3z')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '9.9,17.5 8.6,18.2 8.6,16.9 9.9,16.4 9.9,17.5 9.9,17.5 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '20.2,19.3 17.6,20.3 17.6,18.2 20.2,17 20.2,19.3 20.2,19.3 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '16.5,19 14.3,19.9 14.3,18.2 16.5,17.2 16.5,19 16.5,19 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '13.1,18.6 11.2,19.3 11.2,18 13.1,17.2 13.1,18.6 13.1,18.6 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '9.9,21.2 8.6,21.7 8.6,20.6 9.9,20.1 9.9,21.2 9.9,21.2 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '20.2,22.7 17.6,23.8 17.6,21.5 20.2,20.6 20.2,22.7 20.2,22.7 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '14.3,23.5 14.3,21.7 16.5,20.7 16.5,22.7 14.3,23.5 14.3,23.5 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '13.1,22.2 11.2,23 11.2,21.5 13.1,20.9 13.1,22.2 13.1,22.2 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('polygon')
                                        .style('fill', '#F4793B')
                                        .attr('points', '13.1,22.2 11.2,23 11.2,21.5 13.1,20.9 13.1,22.2 13.1,22.2 ')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#F4793B')
                                        .attr('d', 'M24.6,22.8c1.8-0.7,3.6-1.3,5.5-1.4v-0.2v-7.7c-1.9,0.4-3.7,1-5.5,1.8V22.8L24.6,22.8z')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#6DC067')
                                        .attr('d', 'M38.2,14.1v7.7c-1.8-0.6-3.7-0.8-5.6-0.8v-7.9 C34.5,13.1,36.5,13.3,38.2,14.1L38.2,14.1z')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#FFCB05')
                                        .attr('d', 'M38.2,24.4v7.9c-1.8-0.5-3.7-0.7-5.6-0.6v-8 C34.5,23.5,36.5,23.7,38.2,24.4L38.2,24.4z')
                                        .attr('transform', 'translate(-40,-32) scale(1.2)');

                                    break;

                                case 'Stealth':
                                    elm.append('path')
                                        .style('fill', '#828487')
                                        .style('stroke-width', 0.8)
                                        .style('stroke', 'white')
                                        .attr('d', 'M34.7,15.7c-6.5,0.2-9.8-4.7-9.8-4.7c0,0-2.8,4.7-9.8,4.7c-0.6,7.8,1.4,13.2,4.3,18.3'+
                                        'c0.2,0.3,2,4,5.6,4c3.7,0,5.3-3.7,5.7-4.3C33.9,28.1,35.3,21.8,34.7,15.7z M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1'+
                                        'c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');

                                    elm.append('path')
                                        .style('fill', '#ccc')
                                        .attr('d', 'M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                                        break;

                                case 'Stealth Dropped':
                                    elm.append('path')
                                        .style('fill', '#828487')
                                        .style('stroke-width', 0.8)
                                        .style('stroke', 'white')
                                        .attr('d', 'M34.7,15.7c-6.5,0.2-9.8-4.7-9.8-4.7c0,0-2.8,4.7-9.8,4.7c-0.6,7.8,1.4,13.2,4.3,18.3'+
                                        'c0.2,0.3,2,4,5.6,4c3.7,0,5.3-3.7,5.7-4.3C33.9,28.1,35.3,21.8,34.7,15.7z M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1'+
                                        'c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');

                                    elm.append('path')
                                        .style('fill', '#ccc')
                                        .attr('d', 'M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');

                                        elm.append('polygon')
                                        .style('fill', '#828487')
                                        .attr('points', '42.4,36.5 39.7,33.7 36.8,36.7 33.8,33.7 31.1,36.5 34,39.4 31.1,42.4 33.8,45.1 36.8,42.2'+
                                        ' 39.7,45.1 42.4,42.4 39.5,39.4 ')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                                        break;

                                case 'Connections':
                                    elm.append('path')
                                        .style('fill', '#828487')
                                        .style('stroke-width', 0.8)
                                        .style('stroke', 'white')
                                        .attr('d', 'M37.8,35.3c-1.1,0-2.1,0.7-2.5,1.7h-9v-6.5'+
                                        'c1.4-0.2,2.6-1.1,3.3-2.2c0.8,0.6,1.8,0.9,2.8,0.9c2.7,0,4.8-2.2,4.8-4.8c1.2-0.9,1.9-2.3,1.9-3.8c0-1.9-1.1-3.6-2.7-4.3'+
                                        'c-0.3-2.3-2.3-4.1-4.8-4.1c-0.4,0-0.9,0.1-1.3,0.2c-0.8-1.4-2.4-2.3-4.1-2.3c-1.5,0-2.8,0.7-3.7,1.7c-0.8-0.5-1.7-0.8-2.6-0.8'+
                                        'c-2.3,0-4.2,1.6-4.7,3.7C12.8,15,11,17,11,19.4c0,0.4,0.1,0.8,0.2,1.2c-0.3,0.7-0.5,1.4-0.5,2.2c0,2.5,1.9,4.5,4.3,4.8'+
                                        'c0.8,1.4,2.4,2.3,4.1,2.3c1.1,0,2-0.3,2.8-0.9c0.5,0.5,1.2,0.9,1.9,1.2V37h-9.1c-0.4-1-1.4-1.7-2.5-1.7c-1.5,0-2.8,1.2-2.8,2.8'+
                                        's1.2,2.8,2.8,2.8c1.2,0,2.2-0.8,2.6-1.8h20.4c0.4,1.1,1.4,1.8,2.6,1.8c1.5,0,2.8-1.2,2.8-2.8S39.3,35.3,37.8,35.3z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                                        break;

                                case 'Connections Dropped':
                                    elm.append('path')
                                        .style('fill', '#828487')
                                        .style('stroke-width', 0.8)
                                        .style('stroke', 'white')
                                        .attr('d', 'M37.8,35.3c-1.1,0-2.1,0.7-2.5,1.7h-9v-6.5'+
                                        'c1.4-0.2,2.6-1.1,3.3-2.2c0.8,0.6,1.8,0.9,2.8,0.9c2.7,0,4.8-2.2,4.8-4.8c1.2-0.9,1.9-2.3,1.9-3.8c0-1.9-1.1-3.6-2.7-4.3'+
                                        'c-0.3-2.3-2.3-4.1-4.8-4.1c-0.4,0-0.9,0.1-1.3,0.2c-0.8-1.4-2.4-2.3-4.1-2.3c-1.5,0-2.8,0.7-3.7,1.7c-0.8-0.5-1.7-0.8-2.6-0.8'+
                                        'c-2.3,0-4.2,1.6-4.7,3.7C12.8,15,11,17,11,19.4c0,0.4,0.1,0.8,0.2,1.2c-0.3,0.7-0.5,1.4-0.5,2.2c0,2.5,1.9,4.5,4.3,4.8'+
                                        'c0.8,1.4,2.4,2.3,4.1,2.3c1.1,0,2-0.3,2.8-0.9c0.5,0.5,1.2,0.9,1.9,1.2V37h-9.1c-0.4-1-1.4-1.7-2.5-1.7c-1.5,0-2.8,1.2-2.8,2.8'+
                                        's1.2,2.8,2.8,2.8c1.2,0,2.2-0.8,2.6-1.8h20.4c0.4,1.1,1.4,1.8,2.6,1.8c1.5,0,2.8-1.2,2.8-2.8S39.3,35.3,37.8,35.3z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');

                                        elm.append('polygon')
                                        .style('fill', '#828487')
                                        .attr('points', '42.4,36.5 39.7,33.7 36.8,36.7 33.8,33.7 31.1,36.5 34,39.4 31.1,42.4 33.8,45.1 36.8,42.2'+
                                        ' 39.7,45.1 42.4,42.4 39.5,39.4 ')
                                        .attr('transform', 'translate(-40,-38) scale(1.5)');
                                        break;

                                case 'Network Connections':
                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .style('stroke-width', 0.8)
                                        .style('stroke', 'white')
                                        .attr('d', 'M37.8,35.3c-1.1,0-2.1,0.7-2.5,1.7h-9v-6.5'+
                                        'c1.4-0.2,2.6-1.1,3.3-2.2c0.8,0.6,1.8,0.9,2.8,0.9c2.7,0,4.8-2.2,4.8-4.8c1.2-0.9,1.9-2.3,1.9-3.8c0-1.9-1.1-3.6-2.7-4.3'+
                                        'c-0.3-2.3-2.3-4.1-4.8-4.1c-0.4,0-0.9,0.1-1.3,0.2c-0.8-1.4-2.4-2.3-4.1-2.3c-1.5,0-2.8,0.7-3.7,1.7c-0.8-0.5-1.7-0.8-2.6-0.8'+
                                        'c-2.3,0-4.2,1.6-4.7,3.7C12.8,15,11,17,11,19.4c0,0.4,0.1,0.8,0.2,1.2c-0.3,0.7-0.5,1.4-0.5,2.2c0,2.5,1.9,4.5,4.3,4.8'+
                                        'c0.8,1.4,2.4,2.3,4.1,2.3c1.1,0,2-0.3,2.8-0.9c0.5,0.5,1.2,0.9,1.9,1.2V37h-9.1c-0.4-1-1.4-1.7-2.5-1.7c-1.5,0-2.8,1.2-2.8,2.8'+
                                        's1.2,2.8,2.8,2.8c1.2,0,2.2-0.8,2.6-1.8h20.4c0.4,1.1,1.4,1.8,2.6,1.8c1.5,0,2.8-1.2,2.8-2.8S39.3,35.3,37.8,35.3z')
                                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                                        break;

                                case 'DNS':
                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M12.3,20h3.2c1.3,0,3.1,0.1,4.3,1.7c0.7,0.9,1,2,1,3.3c0,2.8-1.5,5.1-5.2,5.1h-3.3V20z M14.4,28.3'+
                                        'h1.4c2.2,0,3-1.4,3-3.2c0-0.8-0.2-1.6-0.7-2.3c-0.4-0.5-1.1-1-2.3-1h-1.4V28.3z '+
                                        'M28.7,26.9l0-7h1.9V30h-1.8l-4.6-7l0,7h-1.9V20h1.8L28.7,26.9z'+
                                        'M34,26.9c0.1,1.4,1,1.6,1.4,1.6c0.8,0,1.4-0.6,1.4-1.3c0-0.9-0.7-1.1-2.1-1.6'+
                                        'c-0.8-0.3-2.5-0.9-2.5-2.8c0-1.9,1.7-3,3.3-3c1.3,0,3.1,0.7,3.2,2.9h-2c-0.1-0.5-0.3-1.2-1.3-1.2c-0.7,0-1.2,0.5-1.2,1.1'+
                                        'c0,0.7,0.5,0.9,2.2,1.6c1.5,0.7,2.4,1.4,2.4,2.8c0,1.6-1,3.1-3.4,3.1c-2.3,0-3.5-1.4-3.5-3.3H34z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                                        break;

                                case 'SSL':
                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M16.5,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H16.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M24.3,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H24.3z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M30.7,20.1h2.1v8.5h3.4v1.8h-5.5V20.1z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                                        break;

                                case 'SSH':
                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M14.5,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H14.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M22.5,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H22.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M28.9,30.5V20.1H31v4.2h4v-4.2h2.1v10.4H35v-4.4h-4v4.4H28.9z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                                        break;

                                case 'IRC':
                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M14,20.1h2.1v10.4H14V20.1z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M18.1,20.1h3.1c1.6,0,2.5,0.3,3.1,0.7c0.9,0.6,1.3,1.7,1.3,2.8c0,0.8-0.2,1.4-0.6,1.9'+
                                        'c-0.4,0.7-1,1-1.7,1.1l2.3,3.8h-2.2l-2.8-4.8h0.4c0.7,0,1.4,0,1.9-0.4c0.4-0.3,0.7-0.9,0.7-1.5s-0.3-1.2-0.8-1.5'+
                                        'c-0.4-0.2-0.9-0.3-1.5-0.3h-1.2v8.5h-2.1V20.1z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');

                                    elm.append('path')
                                        .style('fill', '#9D9D9D')
                                        .attr('d', 'M37.2,27c-0.6,2.1-2.6,3.7-5.1,3.7c-3.2,0-5.4-2.5-5.4-5.4c0-2.8,2.1-5.4,5.4-5.4'+
                                        'c3,0,4.7,2.2,5.1,3.7H35c-0.3-0.7-1.2-1.9-2.9-1.9c-2,0-3.3,1.7-3.3,3.5c0,1.9,1.4,3.6,3.3,3.6c1.8,0,2.7-1.5,2.9-1.8H37.2z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                                        break;

                                case 'HTTP':
                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .attr('d', 'M24,15.9v-4.4c-1,0.1-3.1,0.5-4.4,1.1c-0.5,1.3-1,2.6-1.3,4C20.1,16.2,22,16,24,15.9z'+
                                        'M16.4,14.6c-1.1,0.9-2,2-2.8,3.2c0.7-0.2,1.4-0.5,2.1-0.7C15.9,16.3,16.1,15.5,16.4,14.6z'+
                                        'M18.5,34c0.4,1.2,0.8,2.4,1.3,3.5c1.3,0.5,3.2,0.9,4.2,1v-3.9C22,34.5,20.2,34.3,18.5,34z'+
                                        'M15.9,33.4c-0.6-0.2-1.2-0.4-1.9-0.6c0.7,1,1.6,1.9,2.5,2.7C16.3,34.8,16.1,34.1,15.9,33.4z'+
                                        'M26,11.5V16c2,0.1,3.6,0.3,5.4,0.6c-0.4-1.4-0.9-2.8-1.4-4.1C28.7,11.9,28,11.6,26,11.5z'+
                                        'M34,17.1c0.9,0.2,1.8,0.5,2.7,0.8c-0.9-1.5-2.1-2.8-3.5-3.8C33.5,15.2,33.7,16.1,34,17.1z'+
                                        'M26,34.6v3.9c2-0.1,2.6-0.4,3.8-0.8c0.5-1.2,0.9-2.4,1.3-3.6C29.4,34.3,28,34.5,26,34.6z'+
                                        'M33,36c1.2-0.9,2.3-2,3.2-3.2c-0.8,0.3-1.6,0.5-2.4,0.7C33.5,34.3,33.3,35.1,33,36z'+
                                        'M38.5,25c0-2-0.2-2.6-0.5-3.8c-1.1-0.5-2.3-0.8-3.5-1.2c0.2,1.6,0.4,2.9,0.4,4.9H38.5z'+
                                        'M34.8,27c-0.1,1-0.2,2.7-0.5,4c1.2-0.4,2.3-0.7,3.4-1.2c0.3-0.9,0.6-1.8,0.7-2.8H34.8z'+
                                        'M32.6,25c0-2-0.3-3.9-0.7-5.7c-1.9-0.4-3.9-0.9-5.9-1V25H32.6z'+
                                        'M26,27v5.3c2-0.1,3.9-0.2,5.7-0.6c0.3-1.6,0.7-2.7,0.8-4.7H26z'+
                                        'M24,25v-6.8c-2,0.1-4.3,0.6-6.3,1.1c-0.3,1.8-0.5,3.7-0.5,5.7H24z'+
                                        'M17.3,27c0.1,2,0.3,3.1,0.6,4.6c1.9,0.4,4.1,0.6,6.1,0.6V27H17.3z'+
                                        'M14.9,25c0-2,0.1-3.5,0.4-5c-1,0.3-2.1,0.8-3.1,1.3c-0.4,1.2-0.6,1.8-0.7,3.8H14.9z'+
                                        'M11.6,27c0.1,1,0.4,1.9,0.8,2.9c1,0.4,2,0.8,3,1.2c-0.2-1.3-0.4-3-0.5-4H11.6z')
                                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                                        break;

                                case 'Files':
                                        elm.append('polygon')
                                        .style('fill', '#828487')
                                        .attr('points', '24.2,15 12,15 12,36 37.8,36 37.8,17.9 27.2,17.9 ')
                                        .attr('transform', 'translate(-38,-34) scale(1.3)');
                                        break;

                                case 'FTP':
                                        elm.append('polygon')
                                        .style('fill', '#828487')
                                        .attr('points', '24.2,15 12,15 12,36 37.8,36 37.8,17.9 27.2,17.9 ')
                                        .attr('transform', 'translate(-40,-38) scale(1.3)');

                                    elm.append('path')
                                        .style('fill', '#333333')
                                        .attr('d', 'M23,27.7l-3-1.9V32h-2v-6.2l-3,1.9v-2.8l4-2.6l4,2.6V27.7z'+
                                        'M34,29.1l-4,2.6l-4-2.6v-2.8l3,1.9V23h2v5.1l3-1.9V29.1z')
                                        .attr('transform', 'translate(-40,-38) scale(1.3)');
                                        break;

                                default:
                                    elm.append("rect")
                                        .attr('x', -6)
                                        .attr('y', -6)
                                        .attr('height', 12)
                                        .attr('width', 12)
                                        .style('fill-opacity', 1)
                                        .attr("id", function(d) { return d.value; })
                                        .style("fill", function(d) { return d._children ? "red" : "#000"; });
                                        break;
                            }
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

// TREECHART ENDS HERE

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
                        var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
                        scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
                            if (typeof callback == 'function') { callback.call(this); }
                        });
                    });
                }


                $scope.$broadcast('spinnerHide')

                // var lanes = $scope.crossfilterData.dimension(function(d){ return d.type }).group().reduceSum(function(d){return null}).top(Infinity).map(function(d){return d.key});
                var itemsDimension = $scope.crossfilterData.dimension(function(d){ return d.time });
                var items = itemsDimension.top(Infinity);
                $scope.inTooDeep = {
                    areWe: false,
                    min: null,
                    max: null
                };

                // var lanes = ["Chinese","Japanese","Korean"],
                var laneLength = $scope.lanes.length;
                var width = element.width();

                var m = [5, 15, 15, 120], //top right bottom left
                    w = width - m[1] - m[3],
                    h = 390 - m[0] - m[2],
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
                    // .tickFormat(d3.time.format('%a %d'))
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

                

                function colors(title) {
                    switch(title){
                        case 'http':
                            return "#67AAB5";
                        case 'ssl':
                            return "#A0BB71";
                        case 'file': // extracted files
                            return "#B572AB";
                        case 'dns': // new dns
                            return "#708EBC";
                        case 'conn': //first seen
                            return "#6FBF9B";
                        case 'conn_ioc':
                            return "#EFAA86";
                        case 'http_ioc':
                            return "#FFF2A0";
                        case 'ssl_ioc':
                            return "#D97373";
                        case 'file_ioc':
                            return "#F68D55";
                        case 'dns_ioc':
                            return "#F3BD5D";
                        case 'endpoint':
                            return "#7E9E7B";
                        case 'stealth':
                            return "#0080CE";
                        default: //endpoint events
                            return "#D8464A";
                    }
                }

                $scope.point = function(element, nickname, name) {
                    if (nickname.search("ioc") !== -1) {
                        element.attr('class', 'ioc');
                        element = element.append('g')
                            .attr('transform', 'translate(-18, -6)scale(0.8)');
                        element.append('svg:path')
                            .attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z')
                            .attr('fill', colors(nickname));
                        element.append('svg:polygon')
                            .attr('points', '18.155,3.067 5.133,26.932 31.178,26.932 ')
                            .attr('fill', '#595A5C');
                        element.append('svg:polygon')
                            .attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
                            .attr('fill', colors(nickname));
                        element.append('rect')
                            .attr('x', 16.376)
                            .attr('y', 22.045)
                            .attr('fill', colors(nickname))
                            .attr('width', 2.838)
                            .attr('height', 2.448);
                        return;
                    } else {
                        element.attr('class', nickname);
                        element = element.append('g').attr('transform', 'translate(-18, -6)scale(0.8)');
                        switch(nickname){
                            case 'secure':
                                element.append('circle')
                                    .attr('fill', function(d){
                                        if (d.ioc_count > 0) {
                                            return '#e2a23c';
                                        } else {
                                            return '#A0BB71';
                                        }
                                    })
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
                            case 'file':
                                element.append('circle')
                                    .attr('fill', function(d){
                                        if (d.ioc_count > 0) {
                                            return '#d67636';
                                        } else {
                                            return '#B572AB';
                                        }
                                    })
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
                            case 'conn':
                                element.append('circle')
                                    .attr('fill', function(d){
                                        if (d.ioc_count > 0) {
                                            return '#d19d41';
                                        } else {
                                            return '#6FBF9B';
                                        }
                                    })
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
                            case 'dns':
                                element.append('circle')
                                    .attr('fill', function(d){
                                        if (d.ioc_count > 0) {
                                            return '#bf7d39';
                                        } else {
                                            return '#708EBC';
                                        }
                                    })
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
                            case 'http':
                                element.append('circle')
                                    .attr('fill', function(d){
                                        if (d.ioc_count > 0) {
                                            return '#67AAB5';
                                        } else {
                                            return '#67AAB5';
                                        }
                                    })
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
                            case 'endpoint':
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
                            case 'stealth':
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
                            case 'stealth_drop':
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
                            case 'l7':
                                var html = appIcon(name);
                                element.append('g').attr('transform', 'scale(0.85)').html(html[0].innerHTML);
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

                var previousID = -1, previousElm = null;
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
                            // otehrwise keep reset button open
                            resetBtn.attr('disabled', null);
                        }
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

                    var minUnix = moment(minExtent).unix();
                    var maxUnix = moment(maxExtent).unix();
                    // should it requery?
                    var msDifference = maxUnix - minUnix;
                    if ((msDifference < queryThreshhold) && (msDifference !== 0)) {
                        $scope.requery(minExtent, maxExtent, function(data){
                            visItems = data;
                            plot(visItems, minExtent, maxExtent);
                        })                
                    } else {
                        // reset if not within threshold
                        $scope.inTooDeep.areWe = false;
                        visItems = items.filter(function(d) { if((d.dd < maxExtent) && (d.dd > minExtent)) {return true} ;});
                        $scope.alert.style('display', 'none');
                        plot(visItems, minExtent, maxExtent);
                    }
                }

                function plot(data, min, max) {
                    if (moment(max).unix() !== moment(min).unix()) {

                        var lastExpandedId = null, isOpen = null;

                        currentTime.html('Current Time Slice: <strong>'+moment(min).format('MMMM D, YYYY h:mm A')+'</strong> - <strong>'+moment(max).format('MMMM D, YYYY h:mm A')+'</strong>')
                        main.select('g.brush .extent')
                            .transition()
                            .duration(150)
                            .attr('width', w)
                            // .attr('x', function(d) {console.log(x); return x/2 })
                            .transition()
                            .duration(50)
                            .attr('width', 0);
                        x1.domain([min, max]);
                        xAxisBrush.transition().duration(500).call(xAxis);
                        itemRects.selectAll('g').remove();
                        var icons = itemRects.selectAll("g").data(data);
                        icons.enter().append("g").each(function(d){
                            var elm = d3.select(this);
                            elm
                                .attr('transform', 'translate('+x1(d.dd)+','+(y1(d.lane) + 10)+')')
                                .attr("class", function(d) {return "mainItem" + d.lane;})
                                .on("mouseover", function(d){
                                    elm.style('cursor', 'pointer');
                                })
                                .on("click", function(d){
                                    // this closes all expanded blocks
                                    if (lastExpandedId !== null) {
                                        $('div'+lastExpandedId+'.infoDivExpanded').hide();
                                    }
                                    if (previousElm !== null){
                                        previousElm.attr('class', null);
                                    }
                                    elm.attr('class', 'pointactive')
                                    $('#'+previousID).attr('class', null);
                                    $('#'+d.id).attr('class', 'laneactive');
                                    previousID = d.id;
                                    previousElm = elm;
                                    $('#lanegraphinfo').scrollTo(d.position);
                                });
                                // .attr("width", 5)
                                // .attr("height", function(d) {return .8 * y1(1);});
                            // generate points from point function
                            if (d.type !== 'l7') {
                                $scope.point(elm, d.type);
                            } else {
                                // push app name to point function if type is l7
                                $scope.point(elm, d.type, d.l7_proto);
                            }
                        })
                        icons.exit();

                       
                        infoDiv.selectAll('li').remove();
                        infoDiv.selectAll('li').data(data).enter()
                            .append('li').each(function(d){
                                var elm = d3.select(this);
                                elm
                                    .attr('id', function(d){return d.id })
                                    .html(function(d){
                                        d.position = ($('li#'+d.id).offset().top - $('li#'+d.id).parent().offset().top);
                                        return d.info;
                                    })
                                    .on('click', function(){
                                        // close all expanded sections
                                        if (lastExpandedId !== '#'+d.id) {
                                            $('div'+lastExpandedId+'.infoDivExpanded').hide();
                                        }
                                        if (previousElm !== null){
                                            previousElm.attr('class', null);
                                        }
                                        // clear class of previous
                                        $('#'+previousID).attr('class', null);

                                        // get this id
                                        var row = d3.select(this);
                                        var id = row.attr('id'); 
                                            row.attr('class', 'laneactive');
                                        
                                        // iterate through points
                                        itemRects.selectAll('g').each(function(d){
                                            var elm = d3.select(this);
                                            // if id's (of just clicked) match
                                            if (d.id.toString() === id.toString()) {
                                                elm.attr('class', 'pointactive');
                                                previousElm = d3.select(this);
                                            } else if (d.id.toString() === previousID.toString()){
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
                            })

                    }
                }

                // function listItems

            });
        }
    };
}]);
