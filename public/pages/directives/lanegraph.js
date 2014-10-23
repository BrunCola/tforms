'use strict';

angular.module('mean.pages').directive('laneGraph', ['$timeout', '$location', 'appIcon', '$rootScope', 'timeFormat', '$http', function ($timeout, $location, appIcon, $rootScope, timeFormat, $http) {
    return {
        // restrict: 'A',
        // scope : {
        //     title : '@'
        // },
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

                var laneLength = $scope.lanes.length;
                var width = element.width();
                var m = [5, 15, 15, 130], //top right bottom left
                    w = width - m[1] - m[3],
                    h = 470 - m[0] - m[2],
                    miniHeight = 0,
                    mainHeight = h - miniHeight - 50;
                // put it in scope for use in view
                $scope.width = element.width();
                $scope.height = h;

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
                    .range([30, mainHeight]);

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

                main.append("g").selectAll(".laneLines")
                    .data($scope.lanes)
                    .enter().append('rect')
                    .attr('x', -m[1])
                    .attr('y', function(d, i) {return y1(i) -m[0];})
                    .attr('width', '10')
                    .attr('height', '10')
                    .style('fill', '#fff');

                var lineStory = main.append("g")
                    .attr("class", "storyLine");

                var clickLine = main.append("g")
                    .attr("class", "clickLine");

                function rowColors(type) {
                    switch(type){
                        case 'IOC':
                            return "#CCCCCC";

                       /* case 'Conn_ioc':
                            return "#EFAA86";
                        case 'DNS_ioc':
                            return "#F3BD5D";
                        case 'HTTP_ioc':
                            return "#FFF2A0";
                        case 'SSL_ioc':
                            return "#D97373";
                        case 'Email_ioc': 
                            return "#F3BD5D";
                        case 'File_ioc':
                            return "#F68D55";*/

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

                function iconColors(type, element, color1, color2) {
                    switch(type){
                        case 'Conn':  
                            element.append('svg:polygon')
                                .attr('points', '24.585,6.299 24.585,9.064 11.195,9.064 11.195,14.221 24.585,14.221 24.585,16.986 31.658,11.643 ')
                                .attr('fill', color1);
                            element.append('svg:polygon')
                                .attr('points', '10.99,17.822 3.916,23.166 10.99,28.51 10.99,25.744 24.287,25.744 24.287,20.59 10.99,20.59 ')
                                .attr('fill', color1);
                            return;
                        case 'IOC Severity':    
                            element.append('svg:polygon')
                                .attr('transform', 'translate(0, 3)')
                                .attr('points', '18.155,3.067 5.133,26.932 31.178,26.932 ')
                                .attr('fill', color1);
                            element.append('svg:polygon')
                                .attr('transform', 'translate(0, 3)')
                                .attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
                                .attr('fill', color2);
                            element.append('rect')
                                .attr('transform', 'translate(0, 3)')
                                .attr('x', 16.376)
                                .attr('y', 22.045)
                                .attr('fill', color2)
                                .attr('width', 2.838)
                                .attr('height', 2.448);
                            return;
                        case 'DNS': 
                            element.append('svg:path')
                                .attr('d', 'M20.909,13.115c0-0.07,0-0.106-0.071-0.106c-0.283,0-6.022,0.813-7.935,0.956'+
                                    'c-0.036,0.955-0.071,2.053-0.071,3.009l2.267,0.106v8.707c0,0.071-0.035,0.143-0.142,0.178l-1.877,0.07'+
                                    'c-0.035,0.92-0.035,1.982-0.035,2.938c1.452,0,3.33-0.036,4.818-0.036h4.888V26l-1.949-0.07'+
                                    'C20.801,22.39,20.874,16.938,20.909,13.115z')
                                .attr('fill', color1);
                            element.append('svg:path')
                                .attr('d', 'M17.473,10.921c1.771,0,3.329-1.274,3.329-3.187c0-1.486-1.098-2.867-3.152-2.867'+
                                    'c-1.948,0-3.259,1.451-3.259,2.938C14.391,9.611,15.949,10.921,17.473,10.921z')
                                .attr('fill', color1);
                            return;
                        case 'HTTP': 
                            element.append('svg:path')
                                .attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
                                    'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
                                    'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
                                    'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
                                    'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
                                    'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
                                    'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
                                    'l0.959-3.195l-2.882-1.775L24.715,19.976z')
                                .attr('fill', color1);
                            return;
                        case 'SSL':
                            element.append('svg:path')
                                .attr('fill', color1)
                                .attr('d', 'M25.5,16.1v-2.7h0c0,0,0,0,0,0c0-4.1-3.3-7.4-7.4-7.4c-4.1,0-7.4,3.3-7.4,7.4c0,0,0,0,0,0v2.7H9.3'+
                                'v11.8h17.8V16.1H25.5z M22.9,13.7v2.4h-9.4v-2.4c0,0,0,0,0,0c0-2.6,1.5-5,4.7-5C21.3,8.8,22.9,11.1,22.9,13.7'+
                                'C22.9,13.7,22.9,13.7,22.9,13.7z');
                            return;
                        case 'Endpoint': 
                            element.append('svg:path')
                                .attr('d', 'M28.649,8.6H7.351c-0.684,0-1.238,0.554-1.238,1.238v14.363c0,0.684,0.554,1.238,1.238,1.238h7.529'+
                                    'l-1.09,3.468v0.495h8.419v-0.495l-1.09-3.468h7.529c0.684,0,1.237-0.555,1.237-1.238V9.838C29.887,9.153,29.333,8.6,28.649,8.6z'+
                                    'M28.477,22.072H7.635V10.074h20.842V22.072z')
                                .attr('fill', color1);
                            return;
                        case 'Stealth':
                            element.append('svg:path')
                                .attr('fill', color1)
                                .attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
                                    'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
                                    'C28.014,15.545,26.676,21.468,23.587,26.751z');
                            element.append('svg:path')
                                .attr('fill', '#0080CE')
                                .attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
                                    'C11.076,16.238,11.938,20.26,13.699,23.661z');
                            return;
                        case 'Stealth_drop':
                            element.append('svg:path')
                                .attr('fill', color1)
                                .attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
                                    'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
                                    'C28.014,15.545,26.676,21.468,23.587,26.751z');
                            element.append('svg:path')
                                .attr('fill', '#D8464A')
                                .attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
                                    'C11.076,16.238,11.938,20.26,13.699,23.661z');
                            return;
                        case 'Email':
                            element.append('polygon')
                                .style('fill', color1)
                                .attr('points', '18,17.3 8.7,11.6 27.3,11.6 ');
                            element.append('polygon')
                                .style('fill', color1)
                                .attr('points', '28.4,24.4 7.6,24.4 7.6,13.1 18,19.7 28.4,13.1 ');
                            return;
                        case 'File':
                            element.append('svg:path')
                                .attr('d', 'M13.702,12.807h13.189c-0.436-0.655-1.223-1.104-2.066-1.104c0,0-7.713,0-8.361,0'+
                                    'c-0.386-0.796-1.278-1.361-2.216-1.361H7.562c-1.625,0-1.968,0.938-1.839,2.025l2.104,11.42c0.146,0.797,0.791,1.461,1.594,1.735'+
                                    'c0,0,2.237-10.702,2.378-11.308C12.005,13.334,12.403,12.807,13.702,12.807z')
                                .attr('fill', color1);
                            element.append('svg:path')
                                .attr('d', 'M29.697,13.898c0,0-14.47-0.037-14.68-0.037c-1.021,0-1.435,0.647-1.562,1.289l-2.414,10.508h16.716'+
                                    'c1.146,0,2.19-0.821,2.383-1.871l1.399-7.859C31.778,14.706,31.227,13.848,29.697,13.898z')
                                .attr('fill', color1);
                            return;
                        case 'Applications': 
                            element.append('rect')
                                .attr('x', 10)
                                .attr('y', 10)
                                .attr('height', 4)
                                .attr('width', 17)
                                .style('fill', color1);
                            element.append('rect')
                                .attr('x', 10)
                                .attr('y', 16)
                                .attr('height', 4)
                                .attr('width', 17)
                                .style('fill', color1);
                            element.append('rect')
                                .attr('x', 10)
                                .attr('y', 22)
                                .attr('height', 4)
                                .attr('width', 17)
                                .style('fill', color1);
                            return;
                        default:
                            return;
                    }
                }

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
                                .attr('transform', 'scale(2) translate(-3, -5)');
                            })
                            .on('mouseout', function(){
                                d3.select(this)
                                .attr('transform', 'scale(1)');
                            }); 
                        return;
                    } else { 
                        element.append('rect')
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
                            .on('mouseover', function(){
                                d3.select(this)
                                .attr('transform', 'scale(2) translate(-3, -6) ')
                                .attr('stroke', '#fff')
                                .attr('stroke-width', '1');
                            })
                            .on('mouseout', function(){
                                d3.select(this)
                                .transition()
                                .duration(550)
                                .attr('transform', 'scale(1)')
                                .attr('stroke', 'none')
                                .attr('stroke-width', '0');
                            });
                    }
                }    

                function changeIcon(element, data, previousElm) {
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
                            iconColors(data.type, element, color1, color2);
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
               
                
                buttonHolder
                    .append('button')
                    .attr('class', 'test')
                    .html('test')
                    .on('click', function(){
                        $scope.$broadcast('patternPane');
                    });

                var saveToggle = buttonHolder
                    .append('button')
                    .html('Create pattern')
                    .attr('class', 'saveToggle')
                    .on('click', function(){
                        if ($scope.pattern.searching === false) {
                            d3.select(this).html('Analize pattern');
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
                            lineStory.selectAll('line').remove();
                        }
                        if ($scope.pattern.last !== null) {
                            laneInfoAppend($scope.pattern.last.data, $scope.pattern.last.element);
                        }
                    });
                
                function analize() {
                    // $scope.$broadcast('patternPane');
                    var compareObj = $scope.pattern.selected;
                    console.log($scope.pattern.selected)
                    if (compareObj.length > 0) {
                        loading('start');
                        // construct queries
                        $http({method: 'POST', url: '/ioc_notifications/ioc_events_drilldown/patterns', data: compareObj}).
                            success(function(data, status, headers, config) {
                                
                            })
                            // send info to pattern pane
                            // turn off loading
                            // call clear points function
                    } else {
                        // call clear points function
                    }
                }

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
                $scope.laneGraphWidth = function() {
                    return $('#lanegraph').parent()[0].clientWidth;
                }
                
                var setNewSize = function(width) {
                    chart.attr("width", width);
                    main.attr("width", width-135);                  
                }

                $(window).bind('resize', function() {
                    setTimeout(function(){
                        setNewSize($scope.laneGraphWidth());
                    }, 150);
                });

                $scope.addSearch = function(point, data) {
                    console.log(data)
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
                            $scope.pattern.length--;
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
                function addRemoveBtn(row, data) {
                    function addBtn() {
                        return 'add';
                    }
                    function removeBtn(){
                        return 'remove';
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
                        .html(function(d){
                            if (d.name === 'Time') {
                                return '<strong>'+d.name+':</strong> '+timeFormat(d.value, 'laneGraphExpanded')+'<br />';      
                            } else {
                                return '<strong>'+d.name+':</strong> '+d.value+'<br />';
                            }
                        });
                    if ($scope.pattern.searching) {
                        line.append('span')
                            .html(function(d) {
                                return addRemoveBtn(d, data);
                            })
                            .on('click', function(d){
                                $scope.addSearch(data, d);
                                d3.select(this).html(addRemoveBtn(d, data));
                            })
                    }
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

                // GRAPH BLUR FILTER
                var blurFilter = chart
                    .append('filter')
                    .attr('id', 'blur-effect-1')
                    .append('feGaussianBlur')
                var blur = blurFilter.attr('class', 'graphBlur')
                    .attr('stdDeviation', 0);
                var load = chart.append('g')
                    .style('display', 'none')
                    .attr('transform', 'translate('+((width/2)-20)+','+((infoHeight/2)-80)+')')
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
                        loading('start');
                        $scope.requery(minExtent, maxExtent, function(data){
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
                    var totalHeight = $('#lanegraphinfo')[0].scrollHeight;
                    var windowHeight = $('#lanegraphinfo').height();
                    if (offset>(totalHeight-windowHeight)) {
                        offset = totalHeight-windowHeight;
                    }
                    $('#lanegraphinfo').scrollTo(offset);
                }

                function plot(data, min, max) {
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
                            // .attr('x', function(d) {console.log(x); return x/2 })
                            .transition()
                            .duration(50)
                            .attr('width', 0);
                        // set new domain and transition x-axis
                        x1.domain([min, max]);
                        xAxisBrush.transition().duration(500).call(xAxis);
                        // remove lines from story
                        // lineStory.selectAll('line').remove();
                        // var linesLinked = lineStory.selectAll(".storyLines").data([""]);
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
                                    elm
                                        .style('cursor', 'pointer')
                                        /*.transition()
                                        .delay(150)
                                        .attr('fill-opacity', '1')
                                        .attr('stroke', 'none')
                                        .attr('transform', 'scale(1) translate(' + x1(d.dd) + ',' + (y1(d.lane)-10) + ')');*/
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
            });
        }
    };
}]);

// angular.module('mean.pages').directive('laneGraph', function() {
//     // This appends the page head (title and calendar) to all pages, so they can have their own controller
//     return {
//         restrict: 'A',
//         scope : {
//             title : '@'
//         },
//         templateUrl : 'public/pages/views/ioc_notifications/ioc_events_drilldown_control.html',
//         transclude : true
//     };
// });
