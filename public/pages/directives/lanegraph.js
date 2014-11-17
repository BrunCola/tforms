'use strict';

angular.module('mean.pages').directive('laneGraph', ['$timeout', '$location', 'appIcon', '$rootScope', 'timeFormat', '$http', 'laneRowSymbols', function ($timeout, $location, appIcon, $rootScope, timeFormat, $http, laneRowSymbols) {
    return {
        templateUrl : 'public/pages/views/ioc_notifications/ioc_events_drilldown_control.html',
        transclude : true,
        link: function ($scope, element, attrs) {
            $scope.$on('laneGraph', function() {
                $scope.$broadcast('spinnerHide');
                $.fn.scrollTo = function( target, options, callback ){
                    if ((typeof options == 'function') && (arguments.length == 2)) { callback = options; options = target; }
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
                ///////////////////////
                /////  VARIABLES  /////
                ///////////////////////
                var itemsDimension = $scope.crossfilterData.dimension(function(d){ return d.time });
                var items = itemsDimension.top(Infinity);
                // set our in-to-deep variable
                $scope.inTooDeep = {
                    areWe: false,
                    min: null,
                    max: null
                };
                // toggle for turning on/off unit multiselecting
                $scope.pattern = {
                    searching: false,
                    selected: {
                        length: 0
                    },
                    // last elm clicked, for throwing in object after an item is clicked when and our button is toggled
                    last: null,
                    lastXY: null
                }
                var queryThreshhold = 3600; // one hour in seconds
                var navArray = [], currentNavPos = 0;
                var addRemBtnDimensions = [32,18];

                ///////////////////////
                /////  DIV SETUP  /////
                ///////////////////////
                var graphRow = d3.select(element[0]).append('div').attr('class', 'row-fluid');
                var leftSide = graphRow.append('div').attr('class', 'span8').append('div').attr('id', 'box').append('div').attr('class', 'box-content');
                var rightSide = graphRow.append('div').attr('class', 'span4').append('div').attr('id', 'box').append('div').attr('class', 'box-content');

                var laneLength = $scope.lanes.length;
                var lWidth = leftSide.node().offsetWidth;
                var m = [5, 15, 15, 130], //top right bottom left
                    w = lWidth - m[1] - m[3],
                    h = 470 - m[0] - m[2],
                    miniHeight = 0,
                    mainHeight = h - miniHeight - 50;
                // put it in scope for use in view
                $scope.height = h;

                // right side header
                rightSide.append('div')
                    .classed('lanegraphtitle', true)
                    .append('form')
                        .html('Auto Expand')
                        .attr('action', null)
                        .attr('id', 'autoExpand')
                            .append('input')
                                .attr('type', 'checkbox')
                                .attr('id', 'autoexpand')
                                .attr('name', 'autoexpand')
                                .attr('value', 'autoexpand')
                                .attr('checked', true);
                var infoHeight = h;
                var infoDiv = rightSide.append('div').classed('divScroll', true).style('height', infoHeight+'px').style('overflow', 'scroll');
                
                // current time div
                var currentTimeSlice = leftSide.append('div').attr('class', 'timeslice');
                var currentTime = currentTimeSlice.append('div').style('float', 'left');
                // enhanced view alert
                $scope.alert = currentTimeSlice.append('div').attr('class', 'laneAlert').html('Enhanced drill-down view');

                //////////////////////////
                /////  D3 VIZ SETUP  /////
                //////////////////////////
                //scales
                var x = d3.time.scale()
                    .domain([new Date($scope.start), new Date($scope.end)])
                    .range([0, w]);
                var x1 = d3.time.scale()
                    .domain([new Date($scope.start), new Date($scope.end)])
                    .range([0, w]);
                var y1 = d3.scale.linear()
                    .domain([0, laneLength])
                    .range([30, mainHeight]);

                var chart = leftSide
                    .append("svg")
                    .attr("width", w + m[1] + m[3])
                    .attr("height", h + m[0] + m[2])
                    .on("dblclick", draw)
                    .attr("class", "chart");

                var main = chart.append("g")
                    .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
                    .attr("width", w)
                    .attr("height", mainHeight)
                    .attr("class", "main");

                var xAxis = d3.svg.axis()
                    .scale(x1)
                    .orient('bottom')
                     // .tickFormat(d3.time.format('%H:%M'))
                    .tickSize(0)
                    .tickPadding(8);
                
                var xAxisBrush = chart.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + m[3] + "," + (mainHeight+9) + ")")
                    .call(xAxis);

                //main lanes and texts
                main.append("g").selectAll(".laneLines")
                    .data($scope.lanes)
                    .enter().append("line")
                    .attr('stroke-width', '1')
                    .attr('stroke-opacity', '0.7')
                    .attr("x1", 0)
                    .attr("y1", function(d, i) { return y1(i);})
                    .attr("x2", w)
                    .attr("y2", function(d, i) {return y1(i);})
                    .attr("stroke", function(d) {
                        return rowColors(d);
                    });

                main.append("g").selectAll(".laneText")
                    .data($scope.lanes)
                    .enter().append("text")
                    .text(function(d) {return d;})
                    .attr("x", -m[1] *3)
                    .attr("y", function(d, i) {return y1(i);})
                    .attr("dy", ".5ex")
                    .attr("text-anchor", "end");

                // icons to the left of lanes, this is our icon placeholder group
                var iconBox = main.selectAll(".laneLines")
                    .data($scope.lanes)
                    .enter()
                    .append('g')
                    .attr('transform', function(d, i) { return 'translate('+(-m[1]*2.4)+','+(y1(i) -m[1])+') scale(0.8)'});

                // here's the rectangle
                var squares = iconBox.append('rect')
                    .attr('width', 38)
                    .attr('height', 38)
                    .style('fill', 'none')
                    .attr('stroke-width', 1)
                    .attr('stroke', '#606060');

                // placing the row icons
                var rowIcons = iconBox.each(function(d){
                    var color1 = rowColors(d);
                    var color2 = "#3f3f3f";
                    var elm = d3.select(this)
                    if (d === 'IOC') {
                        elm.append('polygon')
                            .attr('points', '7,15 14,6 0,6')
                            .attr('transform', 'translate(8,4) scale(1.6)')
                            .attr('fill', '#fff')
                            .style('opacity', '0.4');
                    };
                    laneRowSymbols(d, elm, color1, color2);
                });

                var lineStory = main.append("g")
                    .attr("class", "storyLine");

                var clickLine = main.append("g")
                    .attr("class", "clickLine");

                // GRAPH BLUR FILTER
                var blurFilter = chart
                    .append('filter')
                    .attr('id', 'blur-effect-1')
                    .append('feGaussianBlur')
                var blur = blurFilter.attr('class', 'graphBlur')
                    .attr('stdDeviation', 0);
                var load = chart.append('g')
                    .style('display', 'none')
                    .attr('transform', 'translate('+((lWidth/2)-20)+','+((infoHeight/2)-80)+')')
                // loading svg
                load.append('svg')
                    .attr('version', 1.1)
                    .attr('id', 'loader-1')
                    .attr('x', '0px')
                    .attr('y', '0px')
                    .attr('width', '40px')
                    .attr('height', '40px')
                    .attr('viewBox', '0 0 50 50')
                    .attr('style', 'enable-background:new 0 0 50 50;')
                    .attr('xml:space', 'preserve')
                // spinner
                load.append('path')
                    .attr('fill', '#FF6700')
                    .attr('d', 'M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z')
                    .append('animateTransform')
                        .attr('attributeType', 'xml')
                        .attr('attributeName', 'transform')
                        .attr('type', 'rotate')
                        .attr('from', '0 25 25')
                        .attr('to', '360 25 25')
                        .attr('dur', '0.6s')
                        .attr('repeatCount', 'indefinite');

                var brush = d3.svg.brush()
                    .x(x1)
                    .on("brushend", navCrtl);
                main.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", 1)
                    .attr("height", mainHeight);

                var itemRects = main.append("g")
                    .attr("clip-path", "url(#clip)");
                
                // nav
                var buttonHolder = leftSide.append('div').attr('class', 'buttonHolder');
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
                            navCrtl('nav');
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
                            navCrtl('nav');
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

                var saveToggle = buttonHolder
                    .append('button')
                    .html('Create pattern')
                    .attr('class', 'saveToggle')
                    .on('click', function(){
                        if ($scope.pattern.searching === false) {
                            d3.select(this).html('Analyze pattern');
                            // set searching to true
                            $scope.pattern.searching = true;
                            // change class (so we know its on)
                        } else {
                            d3.select(this).html('Create pattern');
                            // make a call to save restults
                            // clear our object & set it back to false
                            analize();
                            $scope.pattern.searching = false;
                            $scope.pattern.selected = {
                                length: 0
                            };
                        }
                        if ($scope.pattern.last !== null) {
                            laneInfoAppend($scope.pattern.last.data, $scope.pattern.last.element);
                        }
                    });

                ///////////////////////////////
                /////  GENERAL FUNCTIONS  /////
                ///////////////////////////////
                // loading actions
                function loading(action) {
                    if (action === 'start') {
                        load.style('display', 'block');
                        main.select('.brush').style('display', 'none');
                        blurFilter
                            .transition()
                            .duration(500)
                            .attr('stdDeviation', 3);
                        main
                            .style('filter', 'url(#blur-effect-1)');
                    } else {
                        load.style('display', 'none');
                        main.select('.brush').style('display', 'block');
                        blurFilter
                            .transition()
                            .duration(2000)
                            .attr('stdDeviation', 0);
                        main.style('filter', null)
                    }
                }
                function rowColors(type) {
                    switch(type){
                        case 'IOC':
                            return "#CCCCCC";
                        case 'IOC Severity':
                            return "#FF172F";
                        case 'Conn':
                            return "#CF4E77";
                        case 'Stealth':
                            return "#D34A2B";
                        case 'Stealth_drop':
                            return "#0080CE";
                        case 'Applications':
                            return "#B77A33";
                        case 'DNS':
                            return "#A39D39";
                        case 'HTTP':
                            return "#8CC63F";
                        case 'SSL':
                            return "#6BD36D";
                        case 'Email':
                            return "#49E19B";
                        case 'File':
                            return "#28D4B1";
                        case 'Endpoint':
                            return "#00C6C7";
                        default:
                            return "#666";
                    }
                }
                function highlightSameNodes(uid, id, previousElm) {
                    var pData = false;
                    if (previousElm) {
                        pData = previousElm.data();
                    }
                    itemRects.selectAll('g').each(function(d){
                        // select nodes that match
                        var elm = d3.select(this).select('.hover-square');
                        if ((d.conn_uids === uid) && (d.id !== id)) {
                            d.hover = true;
                            hoverPoint(elm, 'mouseover');
                        }
                        // deselect previous nodes (if any)
                        if (pData) {
                            // if any nodes match our previous time andwe're on a different time segment
                            if ((pData[0].conn_uids === d.conn_uids) && (pData[0].conn_uids !== uid)) {
                                d.hover = false;
                                hoverPoint(elm, 'mouseout');
                            }
                        }
                    })
                }
                function hoverPoint(elm, action) {
                    if (action === 'mouseover') {
                        elm
                            .attr('transform', 'scale(2.4) translate(-3, -5) ')
                            .attr('stroke', '#fff')
                            .attr('stroke-width', '1');
                    } else if (action === 'mouseout') {
                        elm 
                            .transition()
                            .duration(550)
                            .attr('transform', 'scale(1)')
                            .attr('stroke', 'none')
                            .attr('stroke-width', '0');
                    }
                }
                function changeIcon(element, data, previousElm) {
                    // call filter funtion to highlight all nodes with the same time
                    highlightSameNodes(data.conn_uids, data.id, previousElm);
                    var color, select;
                    if (previousElm) {
                        previousElm.select('.eventFocus').remove();
                    }
                    if (data.id in $scope.pattern.selected) {
                        // if id is in our select object, retain select status
                        select = true;
                    } else {
                        // otherwise remove it
                        select = false;
                    }
                    if ((data.id in $scope.pattern.selected) && ($scope.pattern.lastXY !== null)) {
                        // lineStory.selectAll('line').remove();
                        var linesLinked = lineStory.selectAll(".storyLines").data([""]);
                        // draw line links
                        if (previousElm !== null) {
                            linesLinked.enter()
                                .append("line")
                                .attr("x1", $scope.pattern.lastXY.x+7)
                                .attr("y1", $scope.pattern.lastXY.y)
                                .attr("x2", x1(data.dd)+7)
                                .attr("y2", y1(data.lane))
                                .attr('stroke-width', 1)
                                .attr("stroke", "#fff");      
                        }
                    }

                    element.classed('node-'+data.id, true);
                    element = element.append('g');                
                    element.attr('transform', 'translate(-11, -9)');
                    if ($('.node-'+data.id+' .eventStory')[0]) {
                        $('.node-'+data.id+' .eventStory')[0].remove();
                    }
                    if ($('.node-'+data.id+' .eventFocus')[0]) {
                        $('.node-'+data.id+' .eventFocus')[0].remove();
                    } 
                    if (select) {
                        element.classed('eventStory', true);
                    } else if (!(data.id in $scope.pattern.selected)){
                        element.classed('eventFocus', true);
                    }
                    if (data.type.search("ioc") !== -1) {
                        element.classed('IOC', true);
                        element.append('svg:polygon')
                            .attr('transform', 'scale(2) translate(2, 0)')
                            .attr('points', '7,15 14,6 0,6')
                            .attr('fill', rowColors("IOC"))
                        element.append('svg:polygon')
                            .attr('transform', 'translate(0, 2)')
                            .attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
                            .attr('fill', "#595A5C");
                        element.append('rect')
                            .attr('transform', 'translate(0, 2)')
                            .attr('x', 16.376)
                            .attr('y', 22.045)
                            .attr('fill', "#595A5C")
                            .attr('width', 2.838)
                            .attr('height', 2.448);
                        return;
                    } else {
                        var color,color1,color2;
                        element.append('rect')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('stroke-width', 1)
                            .attr('stroke', '#fff')
                            .attr('fill', function(d){
                                if (data.type === "IOC Severity") {
                                    switch (d.ioc_severity) {
                                        case 1:
                                            color = '#377FC7';
                                            break;
                                        case 2:
                                            color = '#F5D800';
                                            break;
                                        case 3:
                                            color = '#F88B12';
                                            break;
                                        case 4:
                                            color = '#DD122A';
                                            break;
                                        default:
                                            color = '#6FBF9B';
                                    }
                                } else { 
                                    color = rowColors(data.type);
                                }
                                color2 = "#3f3f3f";
                                color1 = color;
                                if(select){
                                    color1 = "#3f3f3f";
                                    color2 = color;
                                }
                                return color2;
                            })
                            .attr('width', 36)
                            .attr('height', 36);
                            laneRowSymbols(data.type, element, color1, color2);
                    }
                }
                function analize() {
                    var compareObj = $scope.pattern.selected;
                    if (compareObj.length > 0) {
                        loading('start');
                        // construct queries
                        $http({method: 'POST', url: '/ioc_notifications/ioc_events_drilldown/patterns', data: compareObj}).
                            success(function(data, status, headers, config) {
                                // send info to pattern pane
                                patternPane(data);
                                // call clear points function
                                itemRects.selectAll(".eventStory").remove();
                                lineStory.selectAll('line').remove();
                                // turn off loading
                                loading('end');
                                // broadcast right pane overlay
                            })
                    } else {
                        // call clear points function
                        // turn off loading
                        loading('end');
                    }
                }
                function addSearch(point, data) {
                    var thisNode = itemRects.select('.node-'+point.id);
                    if (!(point.id in $scope.pattern.selected)) {         
                        // add empty obect with point id in search
                        $scope.pattern.selected[point.id] = {};
                        $scope.pattern.selected.length++;
                        // insert point information (for redrawing later)
                        $scope.pattern.selected[point.id].point = point;
                        // create search object for our selected data
                        $scope.pattern.selected[point.id].search = {
                            length: 0
                        };
                        // insert our selected data with name as key
                        $scope.pattern.selected[point.id].search[data.name] = data;
                        $scope.pattern.selected[point.id].search.length++;
                        // add class to point
                        changeIcon(thisNode, point);
                        // add current x and y points to last object (after changeicon function!)
                        $scope.pattern.lastXY = {};
                        $scope.pattern.lastXY.x = x1(point.dd);
                        $scope.pattern.lastXY.y = y1(point.lane);    
                        $scope.pattern.lastXY.id = point.id;
                    } else {
                        // if data is not in point object, add it
                        if (!(data.name in $scope.pattern.selected[point.id].search)) {
                            $scope.pattern.selected[point.id].search[data.name] = data;
                            $scope.pattern.selected[point.id].search.length++;    
                        } else {
                        // remove data if it already exists
                            delete $scope.pattern.selected[point.id].search[data.name];
                            $scope.pattern.selected[point.id].search.length--;
                        }
                        // remove point if its empty after changes
                        if ($scope.pattern.selected[point.id].search.length === 0) {
                            delete $scope.pattern.selected[point.id];
                            $scope.pattern.selected.length--;
                            // reset our last x/y coordinate object
                            $scope.pattern.lastXY = null;
                        }
                    }
                    // update style of point if there is no selected data in it
                    if (!(point.id in $scope.pattern.selected)) {
                        changeIcon(thisNode, point);
                    }
                }
                // logic for add/remove buttons in sidebar (when patterns are on)
                function addRemoveBtn(row, data, elm) {
                    elm.select('svg').empty(); // this will redraw all on every click (not very efficient, but we'll fix this later)
                    function addBtn() {
                        elm
                            .append('rect')
                            .attr('width', addRemBtnDimensions[0])
                            .attr('height', addRemBtnDimensions[1])
                            .style('fill', '#8cc63f')
                        elm
                            .append('path')
                            .attr('d', 'M5.7,0v4.4H10v1.2H5.7V10H4.3V5.6H0V4.4h4.3V0H5.7z')
                            .style('fill', '#fff')
                            .attr('transform', 'translate(10,4)')
                    }
                    function removeBtn(){
                        elm
                            .append('rect')
                            .attr('width', addRemBtnDimensions[0])
                            .attr('height', addRemBtnDimensions[1])
                            .style('fill', '#cc0000');
                        elm
                            .append('polygon')
                            .attr('points', '5.7,0 5.7,4.4 10,4.4 10,5.6 5.7,5.6 5.7,10 4.3,10 4.3,5.6 0,5.6 0,4.4 4.3,4.4 4.3,0 ')
                            .style('fill', '#fff')
                            .attr('transform', 'rotate(45, 5, 18)');
                    }
                    if (!(row.pattern)){return};
                    if (data.id in $scope.pattern.selected) {
                        if (row.name in $scope.pattern.selected[data.id].search) {
                            return removeBtn();
                        } else {
                            return addBtn();
                        }
                    } else {
                        return addBtn();
                    }
                }
                // logic for appending row information in sidebar
                function laneInfoAppend(data, element) {
                    element.select('.infoDivExpanded').selectAll('li').remove();
                    var line = element
                        .select('.infoDivExpanded')
                        .selectAll('li')
                        .data(data.expand)
                        .enter().append('li')
                        .style('line-height', 2.4)
                        .html(function(d){
                            if (d.name === 'Time') {
                                return '<strong>'+d.name+':</strong> '+timeFormat(d.value, 'laneGraphExpanded')+'';      
                            } else {
                                return '<strong>'+d.name+':</strong> '+d.value+'';
                            }
                        });
                    if ($scope.pattern.searching) {
                        line.each(function(d){
                            var elm = d3.select(this)
                                .append('div')
                                .style('float', 'right')
                                .append('svg')
                                .attr('width', addRemBtnDimensions[0])
                                .attr('height', addRemBtnDimensions[1]);
                            addRemoveBtn(d, data, elm);
                            elm.on('click', function(d){
                                addSearch(data, d);
                                addRemoveBtn(d, data, elm);
                            })
                        })
                    }
                }
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
                function navCrtl(action) {
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
                        loading('start');
                        requery(minExtent, maxExtent, function(data){
                            loading('end');
                            data.reverse();
                            plot(data, minExtent, maxExtent);
                        })
                    } else {
                        // reset if not within threshold
                        $scope.inTooDeep.areWe = false;
                        var data = items.filter(function(d) { if((d.dd < maxExtent) && (d.dd > minExtent)) {return true};}).reverse();
                        $scope.alert.style('display', 'none');
                        plot(data, minExtent, maxExtent);
                    }
                }
                function scrollSide(id) {
                    var elm = $('li#'+id);
                    var ept  = elm.position().top;
                    var eppt = elm.parent().position().top;
                    var offset = ept - eppt;
                    var totalHeight = $('.divScroll')[0].scrollHeight;
                    var windowHeight = $('.divScroll').height();
                    if (offset>(totalHeight-windowHeight)) {
                        offset = totalHeight-windowHeight;
                    }
                    $('.divScroll').scrollTo(offset);
                }
                function plot(data, min, max) {
                    // default squares and rectangles
                    $scope.point = function(element, type, name, id) {
                        element.classed('node-'+id, true);
                        element = element.append('g');
                        element.classed('eventSquare', true);
                        if (type.search("ioc") !== -1) {
                            element.classed('IOC', true);
                            element.append('svg:polygon')
                                .attr('points', '7,15 14,6 0,6')
                                .attr('fill', rowColors("IOC"))
                                .style('opacity', '0.4')
                                .on('mouseover', function(){
                                    d3.select(this)
                                    .attr('transform', 'scale(2.4) translate(-4, -5)');
                                })
                                .on('mouseout', function(){
                                    d3.select(this)
                                    .attr('transform', 'scale(1)');
                                }); 
                            return;
                        } else { 
                            element.append('rect')
                                .classed('hover-square', true)
                                .attr('x', 0)
                                .attr('y', 3)
                                .attr('fill', function(d){
                                    var color;
                                    if (type === "IOC Severity") {
                                        if (d.ioc_severity === 1) {
                                            color = '#377FC7'; 
                                        } else if (d.ioc_severity === 2) {
                                            color = '#F5D800'; 
                                        } else if (d.ioc_severity === 3) {
                                            color = '#F88B12'; 
                                        } else if (d.ioc_severity === 4) {
                                            color = '#DD122A'; 
                                        } else {
                                            color = '#6FBF9B';
                                        }
                                    } else { 
                                        color = rowColors(type);
                                    }
                                    return color;
                                })
                                .attr('width', 12)
                                .attr('height', 12)
                                .style('opacity', '0.6')
                                .on('mouseover', function(d){
                                    var elm = d3.select(this);
                                    hoverPoint(elm, 'mouseover');
                                })
                                .on('mouseout', function(d){
                                    var elm = d3.select(this);
                                    if (d.hover !== true){
                                        hoverPoint(elm, 'mouseout');
                                    }
                                });
                        }
                    }
                    if (moment(max).unix() !== moment(min).unix()) {
                        // node selecting
                        var previousBar = null, previousElm = null;
                        // bar selecting
                        var isOpen = null;
                        var previousX = 0, previousY = 0;
                        //////////////////
                        /// LANE NODES ///
                        ////////////////// 
                        // update time slice above chart
                        currentTime.html('Current Time Slice: <strong>'+moment(min).format('MMMM D, YYYY HH:MM A')+'</strong> - <strong>'+moment(max).format('MMMM D, YYYY HH:MM A')+'</strong>')
                        // create transition effect of slider
                        main.select('g.brush .extent')
                            .transition()
                            .duration(150)
                            .attr('width', w)
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
                                .attr('transform', 'translate('+x1(d.dd)+','+(y1(d.lane)-10)+')')
                                .on("mouseover", function(d){
                                    elm.style('cursor', 'pointer');
                                })
                                .on("click", function(d){
                                    ///////////////////////////
                                    /////// SIDE SCROLL ///////
                                    ///////////////////////////
                                    var sideSelected = d3.select('.scroll-'+d.id);
                                    // set last object before otehr functions run
                                    $scope.pattern.last = {
                                        element: sideSelected,
                                        data: d
                                    }
                                    // this closes the last expanded block if there is one
                                    if ((previousBar !== null) && (previousBar.attr('class') !== sideSelected.attr('class'))) {
                                        previousBar.select('.infoDivExpanded').style('display', 'none');
                                        previousBar.classed('laneactive', false);
                                    }
                                    if ($('#autoexpand').is(':checked')){
                                        if (isOpen === d.id) {
                                            sideSelected.select('.infoDivExpanded').style('display', 'none');
                                            isOpen = null;
                                        } else {
                                            sideSelected.select('.infoDivExpanded').style('display', 'block');
                                            isOpen = d.id;
                                            // append different info if searching is enabled (i.e. checkboxes)
                                            laneInfoAppend(d, sideSelected);
                                        }
                                    }
                                     // set class for active description
                                    sideSelected.classed('laneactive', true);
                                    // scroll to position
                                    scrollSide(d.id);
                                    previousBar = sideSelected;
                                    ///////////////////////////
                                    //////// THIS NODE ////////
                                    ///////////////////////////
                                    clickLine.selectAll('line').remove();
                                    var selectedNode = clickLine.selectAll(".clickLine").data(['']);
                                    // vertical line
                                    selectedNode.enter()
                                        .append("line")
                                            .attr("x1", x1(d.dd)+7)
                                            .attr("y1", m[0])
                                            .attr("x2", x1(d.dd)+7)
                                            .attr("y2", mainHeight)
                                            .attr('stroke-width', '1')
                                            .attr("stroke", "#FFF");
                                    changeIcon(elm, d, previousElm);
                                    previousElm = elm;
                                })
                                .on("mouseout", function(d){
                                    elm.style('cursor', 'pointer');
                                })
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
                                    .attr('class', 'scroll-'+d.id+' laneInfo')
                                    .html(function(d){
                                        return "<div class='lanegraphlist'><strong>"+timeFormat(d.time, 'laneGraphPreview')+':</strong> '+d.info+"</div>";
                                    })
                                    .on('click', function(){// select corresponding point
                                        var thisNode = itemRects.select('.node-'+d.id);
                                        if ((previousBar !== null) && (previousBar.attr('class') !== elm.attr('class'))) {
                                            previousBar.select('.infoDivExpanded').style('display', 'none');
                                            previousBar.classed('laneactive', false);
                                            changeIcon(thisNode, d, thisNode);
                                        }
                                        elm.classed('laneactive', true);
                                        $scope.pattern.last = {
                                            element: elm,
                                            data: d
                                        }
                                        previousBar = elm;
                                        previousElm = thisNode;
                                    })
                                    // append expand buttons to list elements
                                    .append('div')
                                    .on('click', function(){
                                        scrollSide(d.id);
                                        if ((previousBar !== null) && (previousBar.attr('class') !== elm.attr('class'))) {
                                            previousBar.select('.infoDivExpanded').style('display', 'none');
                                            previousBar.classed('laneactive', false);
                                        }
                                        if (isOpen === d.id) {
                                            elm.select('.infoDivExpanded').style('display', 'none');
                                            isOpen = null;
                                        } else {
                                            elm.select('.infoDivExpanded').style('display', 'block');
                                            previousBar = elm;
                                            isOpen = d.id;
                                            // elm.select('.infoDivExpanded').html(laneInfoAppend(d.expand));
                                            laneInfoAppend(d, elm);
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
                    }                   
                }
                function requery(min, max, callback) {
                    var minUnix = moment(min).unix();
                    var maxUnix = moment(max).unix();
                    if (($scope.inTooDeep.min === minUnix) && ($scope.inTooDeep.max === maxUnix)) {
                        $scope.inTooDeep.areWe = true;
                        // $scope.inTooDeep.min = minUnix;
                        // $scope.inTooDeep.max = maxUnix;
                    }
                    if (($scope.inTooDeep.areWe === true) && (minUnix >= $scope.inTooDeep.min) && (maxUnix <= $scope.inTooDeep.max)) {
                        var deepItems = $scope.deepItems.filter(function(d) { if((d.dd < max) && (d.dd > min)) {return true};});
                        callback(deepItems);
                        $scope.alert.style('display', 'block');
                    } else {
                        //  set $scope.inTooDeep
                        $scope.inTooDeep = {
                            areWe: true,
                            min: minUnix,
                            max: maxUnix
                        };
                        //  grab more from api
                        var query = '/ioc_notifications/ioc_events_drilldown?start='+minUnix+'&end='+maxUnix+'&lan_zone='+$location.$$search.lan_zone+'&lan_ip='+$location.$$search.lan_ip+'&remote_ip='+$location.$$search.remote_ip+'&ioc='+$location.$$search.ioc+'&ioc_attrID='+$location.$$search.ioc_attrID+'&type=drill'+'&lan_user='+$location.$$search.lan_user;
                        $http({method: 'GET', url: query}).
                            success(function(data) {
                                $scope.crossfilterDeep = crossfilter();
                                var id = 0;
                                data.laneGraph.data.forEach(function(parent) {
                                    parent.forEach(function(child) {
                                        child.dd = timeFormat(child.time, 'strdDateObj');
                                        child.id = id;
                                        id++;
                                    })
                                    $scope.crossfilterDeep.add(parent);
                                });
                                var itemsDimension = $scope.crossfilterDeep.dimension(function(d){ return d.time });
                                $scope.deepItems = itemsDimension.top(Infinity);
                                callback($scope.deepItems);
                                $scope.alert.style('display', 'block');
                            });
                    }
                }

                ////////////////////////////////
                /////  IN-SCOPE FUNCTIONS  /////
                ////////////////////////////////
                $scope.patternPane = false;
                function compare(data) {
                    var totalPoints = data.length;
                    if (totalPoints < 2) { return false } // return if there aren't enough points to compare
                    function equals(object, object2) {
                        //For the first loop, we only check for types
                        for (var propName in object) {
                            if (propName !== '$$hashKey') { // ignore angular's inserted id key
                                // checks if they share the same keys/properties
                                if (object.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                                    return false;
                                }
                                //Check instance type
                                else if (typeof object[propName] != typeof object2[propName]) {
                                    return false;
                                }
                            }
                        }
                        //Now a deeper check using other objects property names
                        for (var propName in object2) {
                            if (propName !== '$$hashKey') { // ignore angular's inserted id key
                                //We must check instances anyway, there may be a property that only exists in object2
                                    //I wonder, if remembering the checked values from the first loop would be faster or not 
                                if (object.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                                    return false;
                                }
                                else if (typeof object[propName] != typeof object2[propName]) {
                                    return false;
                                }
                                //If the property is inherited, do not check any more (it must be equal if both objects inherit it)
                                if (!object.hasOwnProperty(propName)) continue;
                                //Now the detail check and recursion
                                //object returns the script back to the array comparing
                                if (object[propName] instanceof Array && object2[propName] instanceof Array) {
                                    // recurse into the nested arrays
                                    if (!object[propName].equals(object2[propName])) return false;
                                }
                                else if (object[propName] instanceof Object && object2[propName] instanceof Object) {
                                    // recurse into another objects
                                    if (!object[propName].equals(object2[propName])) return false;
                                }
                                //Normal value comparison for strings and numbers
                                else if (object[propName] != object2[propName]) {
                                    return false;
                                }
                            }
                        }
                        // return true if everything passed
                        return true;
                    }
                    function checkMatch(checkOne, checkTwo) {
                        var matched = [];
                        for (var r in checkOne) {
                            var thisMatched = checkTwo.filter(function(d){ if (equals(checkOne[r], d)) { return true; } });
                            // push every item of each array returned to a single larger array of matched items
                            for (var m in thisMatched) {
                                matched.push(thisMatched[m]);
                            }
                        }
                        if (matched.length > 0) { return matched } else { return false }
                    }   
                    for (var i = 0; i < totalPoints; i++) { // each one of these is a seperate query / point with its own array of objects
                        var matched = [];
                        if (i === 0) { // run if first array
                            var thisPoint = data[i].result;
                            var nextPoint = data[i+1].result;
                            var check = checkMatch(thisPoint, nextPoint);
                            if (check) {
                                // set our matched results
                                matched = check;
                            } else {
                                // return if the first check didn't return results
                                return false;
                            }
                        } else if ((matched.length > 0) && (i !== 1)) { // continue if the first loop matched, but skip the second 'i' since the we already tested it
                            var thisPoint = data[i].result;
                            var check = checkMatch(matched, thisPoint);
                            if (check) {
                                matched = check;
                            } else {
                                return false;
                            }
                        }
                        if (matched.length > 0) { return matched } else { return false }
                    }
                }
                function patternPane(data) {
                    if ($scope.patternPane) { $scope.patternPane = false; return }
                    // loop through and add a checked flag for each point (for use in finding commonalities)
                    data.forEach(function(d){
                        d.point.checked = true;
                    })
                    $scope.patternPane = true;
                    $scope.points = data;
                    if (data.length === 1) {
                        $scope.matched = data[0].result;
                    } else {
                        $scope.matched = compare(data);
                    }
                }
                $scope.checkboxChange = function() {
                    // whenever a checkbox is checked, re-compare our existing points
                    var points = $scope.points.filter(function(d){ return d.point.checked });
                    if (points.length === 1) {
                        // if there is only one return, just display its results without comparing
                        $scope.matched = points[0].result;
                    } else {
                        // otherwise just attempt to compare .. it will still return null if points.length is 0
                        $scope.matched = compare(points);
                    }
                }
                $scope.closePatternBox = function() {
                    $scope.patternPane = false;
                }
                // begin execution
                draw();
            });
        }
    };
}]);

angular.module('mean.pages').directive('appendRowIcon', ['laneRowSymbols', function (laneRowSymbols) {
    return {
        link: function($scope, element, attrs) {
            function rowColors(type) {
                switch(type){
                    case 'IOC':
                        return "#CCCCCC";
                    case 'IOC Severity':
                        return "#FF172F";
                    case 'Conn':
                        return "#CF4E77";
                    case 'Stealth':
                        return "#D34A2B";
                    case 'Stealth_drop':
                        return "#0080CE";
                    case 'Applications':
                        return "#B77A33";
                    case 'DNS':
                        return "#A39D39";
                    case 'HTTP':
                        return "#8CC63F";
                    case 'SSL':
                        return "#6BD36D";
                    case 'Email':
                        return "#49E19B";
                    case 'File':
                        return "#28D4B1";
                    case 'Endpoint':
                        return "#00C6C7";
                    default:
                        return "#666";
                }
            }
            var elm = d3.select(element[0])
                .append('svg')
                .style('vertical-align', 'middle')
                .attr('width', 38)
                .attr('height', 38);
            var type = attrs.type;
            var color1 = rowColors(type);
            var color2 = "#e6e6e6";

            var color,color1,color2;
            elm.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('fill', function(d){
                    if (type !== "IOC Severity") {
                        color = rowColors(type);
                    }
                    color1 = "#e6e6e6";
                        color2 = color;
                    return color2;
                })
                .attr('width', 36)
                .attr('height', 36);
                laneRowSymbols(type, elm, color1, color2);
        }
    };
}]);

