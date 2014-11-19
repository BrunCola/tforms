'use strict';

angular.module('mean.pages').directive('makeFloorPlan', ['$timeout', '$rootScope', '$http', '$location', 'searchFilter', function ($timeout, $rootScope, $http, $location, searchFilter) {
    return {
        link: function ($scope, element, attrs) {
            //$scope.$on('floorPlan', function (event) {
                setTimeout(function () {

                    // watch global search for changes.. then filter
                    var searchFired = false;
                    $rootScope.$watch('search', function(){
                        if (searchFired === true) {
                            searchFilter($scope.searchDimension, $rootScope.search);
                            $scope.$broadcast('searchUsers',$scope.searchDimension.top(Infinity));
                        }
                        searchFired = true;
                    })

                    var lastUserRequeried = -1;
                    var wait = (function () {
                        var timers = {};
                        return function (callback, ms, uniqueId) {
                            if (!uniqueId) {
                                uniqueId = "filterWait"; //Don't call this twice without a uniqueId
                            }
                            if (timers[uniqueId]) {
                                clearTimeout (timers[uniqueId]);
                            }
                            timers[uniqueId] = setTimeout(callback, ms);
                        };
                    })();
                    ///////////////////////////
                    ///  INITIAL VARIABLES  ///
                    ///////////////////////////
                    var floor_path = $scope.floor.path;
                    var scale = $scope.floor.scale;
                    var imageRatio = $scope.floor.image_width/$scope.floor.image_height;
                    var data = $scope.data.users;
                    var floorName = attrs.floorName;
                    var userScale = 1;
                    var lineCount = 0;
                    if (($scope.floor.user_scale !== undefined) && ($scope.floor.user_scale !== null) && (angular.isNumber($scope.floor.user_scale))) {
                        userScale = $scope.floor.user_scale;
                    } 

                    //var elementWidth = ($('#floorplanspan')[0].offsetWidth-25);
                    var elementWidth = 959;
                    var elementHeight = (elementWidth/imageRatio);
                    element.width(elementWidth);
                    element.height(elementHeight);
                    $scope.userList = data;

                    ///////////////////////////
                    ///  DIV/ELEMENT SETUP  ///
                    ///////////////////////////
                    var userDivWrapper = d3.select("#localListWrapper").style('height', elementHeight+50+'px').style('overflow', 'auto');
                    var userDiv = d3.select("#listlocalusers").attr("width","100%");
                    var infoDiv = d3.select('#localuserinformation').append('table').style('overflow', 'auto');
                    var floorDiv = d3.select(element[0]);
                    var floorPlanDiv = d3.select("#floorplan");

                    var windowScale = $scope.standardWidth/element.outerWidth();

                    var hideListDiv = d3.select('#listlocalusersspan');
                    var expandDiv = d3.select('#floorplanspan');
                    var buttonDiv = d3.select('#triggerbuttons');
                    var scaleButtonDiv = $('#scalebuttons');

                    var margin = {top: -5, right: -5, bottom: -5, left: -5};

                    var zoom = d3.behavior.zoom()
                        .scaleExtent([0.1, 5])
                        //.translate([0,0])
                        .translate([0,0])
                        .scale(scale)
                        .on("zoom", zoomed);

                    var drag = d3.behavior.drag()
                        .origin(function(d) { return d; })
                        .on("dragstart", dragstarted)
                        .on("drag", dragged)
                        .on("dragend", dragended);

                    var svg = floorDiv.append("svg")             
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
                            .call(zoom);

                    var container = svg.append("g")
                        .attr("class", "bin")
                        .attr("drop", "handleDrop")
                        .attr("id", "floorContainer")
                        .style("pointer-events", "all")
                        .attr("transform", "translate(0,0)scale("+scale+")");

                    svg.on("dblclick.zoom", null);

                    container.append("svg")  
                        .attr("class", "floorimage")
                        .append("image")
                        .attr("id", "svgFloorPlan")
                        .attr("class", "svgFloor")
                        .attr("height", elementHeight)                    
                        .attr("width", elementWidth)
                        .attr("xlink:href", floor_path)
                        .attr("type", "image/svg+xml");

                    var endpointConn = container.append("svg")
                    .attr("class", "endpointConn");

                    // -- to hide <input> when changing custom username
                    container.on('click', function(e){
                        if(d3.event.toElement.id == d3.select('.svgFloor')[0][0].id){ 
                            $('.usernametext').each(function(e){
                                this.classList.remove('ng-hide');
                            });
                            $('.usernameform').each(function(e){
                                this.classList.add('ng-hide');
                            });
                        }
                    })

                     // -- hide/show userlist                    
                    var hideDiv = $('.hidelocalusers')
                        .on("click", function () {
                            if (hideListDiv.attr("class") === "floorHide") {
                                expandDiv.style('width','60%');
                                floorDiv.style('width',elementWidth+"px");
                                floorDiv.style('height',elementHeight+"px");
                                hideDiv.html("&#9668; &#9668; &#9668;");
                                setTimeout(function () {
                                    hideListDiv.classed('floorHide', false);
                                }, 0);
                            }else{
                                floorDiv.style('width',elementWidth*1.25+"px");
                                floorDiv.style('height',elementHeight*1.25+"px");
                                expandDiv.style('width','75%'); 
                                hideDiv.html("&#9658; &#9658; &#9658;");
                                setTimeout(function () {
                                    hideListDiv.classed('floorHide', true);
                                }, 0);
                            }
                        })
                        .attr("style","padding-top:"+ (elementHeight/2)+'px')
                        .html("&#9668; &#9668; &#9668;");


                    /////////////////////////////
                    ///  DROPPABLE BEHAVIOUR  ///
                    /////////////////////////////
                    // -- used for when a user is being dragged from userlist to floor
                    var containerTag = container[0][0];
                    containerTag.droppable = false;
                    containerTag.addEventListener(
                        'dragover',
                        function(e) {
                            e.dataTransfer.dropEffect = 'move';
                            // allows us to drop
                            if (e.preventDefault) e.preventDefault();
                            $(this).addClass('over');
                            return false;
                        },
                        false
                    );
                    containerTag.addEventListener(
                        'dragenter',
                        function(e) {
                            $(this).addClass('over');
                            return false;
                        },
                        false
                    );
                    containerTag.addEventListener(
                        'dragleave',
                        function(e) {
                            $(this).removeClass('over');
                            return false;
                        },
                        false
                    );
                    // -- handles when a user is dropped from userlist to floorplan
                    containerTag.addEventListener('drop', function(e) {
                        var floorName = d3.select(containerTag).attr('floor-name');
                        // Stops some browsers from redirecting.
                        if (e.stopPropagation) e.stopPropagation();

                        // call the drop passed drop function
                        var destinationId = $(this).attr('id');
                        var itemId = e.dataTransfer.getData("Text");
                        var item = $(document).find('#'+itemId);
                        var itemData = item[0]['__data__'];

                        if (destinationId === 'floorContainer'){
                            var divPos = {
                                // left: e.layerX/scale,
                                // top: e.layerY/scale
                                left: (e.pageX - $(containerTag).offset().left)/scale,
                                top: (e.pageY - $(containerTag).offset().top)/scale
                            };
                            $(this).append(item[0]);

                            itemData.x = divPos.left;
                            itemData.y = divPos.top;
                            itemData.map = attrs.floorName;

                            $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: divPos.left, y_coord: divPos.top, map_name: attrs.floorName, lan_ip: itemData.lan_ip, lan_zone: itemData.lan_zone}});
                            plot(data, attrs.floorName); 
                            d3.select('.user-'+itemId).classed("selected", true);
                        } 
                        return false;
                        },
                        false
                    );          

                    ///////////////////
                    ///  FUNCTIONS  /// 
                    ///////////////////
                    // -- zoom and movement behaviours of the floor
                    function zoomed() {
                        if (d3.event.scale < 0.5) {
                            zoom.translate([0,0]).scale(1);
                            container.attr("transform", "translate(0,0)scale(1)");
                            $rootScope.toggleZoom = false;
                            $scope.$apply();
                        } else { 
                            scale = d3.event.scale;
                            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                        }
                    }
                    // -- handles the beginging of a user being dragged
                    function dragstarted(d) {

                        d3.event.sourceEvent.stopPropagation();
                        d3.select(this).classed("dragging", true);
                        userDiv.selectAll('button').each(function(d){
                            var elm = d3.select(this);
                            $(elm[0]).removeClass('selected');
                        })
                        floorDiv.selectAll('button').each(function(d){
                            var elm = d3.select(this);
                            $(elm[0]).removeClass('selected');
                        })
                    }
                    // -- handles during a user is dragged
                    function dragged(d) {
                       /* if ( (d3.mouse($("#floorplan")[0])[0]) < 0 || (d3.mouse($("#floorplan")[0])[0]) > 790 || (d3.mouse($("#floorplan")[0])[1]) < 0 || (d3.mouse($("#floorplan")[0])[1]) > 580 ) {
                            //console.log((d3.mouse($("#floorplan")[0])[0]) + " - " +(d3.mouse($("#floorplan")[0])[1]));
                            // var me = d3.event.sourceEvent;
                            // console.log(me);
                            // var destinationId = $(this).attr('id');
                            // console.log(destinationId);
                            // var itemId = me.dataTransfer.getData("Text");
                            // console.log(itemId);
                            // var item = $(document).find('#'+itemId);
                            // console.log(item);
                            // var itemData = item[0]['__data__'];
                            // console.log(itemData);
                            //d3.event.stopPropagation();
                        }else{
                        }*/
                        d.x = d3.event.x;
                        d.y = d3.event.y;
                        d3.select(this).attr("transform", "scale("+userScale+")translate("+(d.x/userScale) + "," + (d.y/userScale) +")");
                    }
                    // -- handles the end of when a user is dragged
                    function dragended(d) {
                        d3.select('.user-'+d.id).classed("selected", true);
                        $scope.requery(d, 'flooruser');
                        lastUserRequeried = d.id;
                        $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: setAdjustedCoor(d.x), y_coord: setAdjustedCoor(d.y), map_name: floorName, lan_ip: d.lan_ip, lan_zone: d.lan_zone}});
                        d3.select(this).classed("dragging", false);
                    }
                    // -- updates username
                    function doneEditing(elm, item, value) {
                        $scope.change_customuser(item, value);
                        $(elm[0]).find('.usernametext').html(value);
                    }
                    // -- gets the correct coordinates for a user depending on the window scale
                    function getAdjustedCoor(coord) {
                        return coord/windowScale;
                    }
                    // -- gets the correct coordinates for a user depending on the window scale
                    function setAdjustedCoor(coord) {
                        return coord*windowScale;
                    }

                    // -- draws connections between hosts
                    function drawConnections (elm, user, connections, color) {
                        var conns = endpointConn.selectAll(".endpointConns").data([""]);
                        for (var c in connections) {
                            if ( connections[c].map === user.map ) {                                         
                                conns.enter()
                                    .append("line")
                                    .attr("x1", user.x+((elm.clientWidth/2)*userScale))
                                    .attr("y1", user.y+((elm.clientHeight/2)*userScale)+lineCount)
                                    .attr("x2", connections[c].x+((elm.clientWidth/2)*userScale))
                                    .attr("y2", connections[c].y+((elm.clientHeight/2)*userScale)+lineCount)
                                    .attr('stroke-width', 1)
                                    .attr("stroke", color);
                            } else {
                                conns.enter()
                                    .append("line")
                                    .attr("x1", user.x+((elm.clientWidth/2)*userScale))
                                    .attr("y1", user.y+((elm.clientHeight/2)*userScale)+lineCount)
                                    .attr("x2", 0)
                                    .attr("y2", 0+lineCount)
                                    .attr('stroke-width', 1)
                                    .attr("stroke", color);
                            }                     
                        }  
                        lineCount +=2;
                    }

                    // -- displays users in userlist and floor plans
                    function plot(data, floor) {
                        // set order of array
                        data = data.sort(function(a, b){ return a.id-b.id });
                        ////////////////////
                        ///  LIST USERS  ///
                        ////////////////////
                        // MAKE LIST ELEMENTS
                        var count = -1;
                        var nodeHeight = 32;
                        userDiv.selectAll('g').remove();
                        userDiv.selectAll('g').data(data.filter(function(d){if (d.map == null){ return true; }})).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("id", function(d){
                                return d.id;
                            })
                            .append('svg:foreignObject')
                                .style("padding-top", function(d){
                                    count++;
                                    return count*nodeHeight+"px";
                                })
                                .attr("height", (count+1)*nodeHeight+"px")
                                // /.attr('height', "30px")
                                .attr('width', "100%")
                                .attr("class", function(d){
                                    return 'userTrans-'+d.id;
                                })
                            .append('xhtml:button').each(function(d){
                                var iconColour = '#29ABE2'; 
                                var name = d.lan_machine;
                                if (d.custom_user != null){
                                    name = d.custom_user;
                                }
                                if (name === ""){
                                    name = d.lan_ip;
                                }
                                if (name === ""){
                                    name = d.lan_mac;
                                }
                                //if ((d.x === 0) && (d.y === 0)) {
                                    var id = d.id;
                                    var elm = d3.select(this);
                                    var elel = elm[0];
                                    elm
                                        // append id to li from data object
                                        .attr('id', id)
                                        .classed('user-'+id, true)
                                        .classed('localuserlist', true)
                                        .on('dblclick', function(e){
                                            $('.usernametext').each(function(e){
                                                this.classList.remove('ng-hide');
                                            });
                                            $('.usernameform').each(function(e){
                                                this.classList.add('ng-hide');
                                            });

                                            var iconText = $(this).find('.usernametext')[0];
                                            var iconInput = $(this).find('.usernameform')[0];
                                            iconText.classList.add('ng-hide');
                                            iconInput.classList.remove('ng-hide');
                                        })
                                        .on('click', function(e){
                                            userDiv.selectAll('button').each(function(d){
                                                var elm = d3.select(this);
                                                $(elm[0]).removeClass('selected');
                                            })
                                            floorDiv.selectAll('button').each(function(d){
                                                var elm = d3.select(this);
                                                $(elm[0]).removeClass('selected');
                                            })
                                            el.classList.add('selected');
                                            $scope.requery(d, 'flooruser');
                                            lastUserRequeried = d.id;
                                        });
                                    var element = elm
                                            .append('div')
                                                .attr('class', 'localuserlisticon')
                                                .append('svg');
                                     element
                                            .attr('height', '25')
                                            .attr('width', '43')
                                        switch (d.lan_type){
                                            case 'endpoint':
                                                 element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            case 'server':
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '15,18 14,18 14,19 11,19 11,22 18,22 18,19 15,19') 
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 19)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 5)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,13H5v4h19V13z M8,16H6v-2h2V16z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,7H5v4h19V7z M8,10H6V8h2V10z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,1H5v4h19V1z M8,4H6V2h2V4z');
                                                break;
                                            case 'mobile':
                                                element.append('svg:path')
                                                    .attr("class", "userColor")
                                                    .attr('d', 'M8,1v22h14V1H8z M15,22.3c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5C16.5,21.6,15.8,22.3,15,22.3z M20,18H10V3h10V18z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            default:
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                    } 

                                    if (d.stealth === 1) {
                                        element.append('g').append('svg:path')
                                            .attr('transform', 'translate(26,0)')
                                            .attr('d', 'M14.1,1.9C11.2,2,9.6,0,9.6,0c0,0-1.3,1.9-4.5,1.9c0,3.2,0.6,5.4,2,7.4C7.2,9.5,8,11,9.6,11c1.7,0,2.4-1.5,2.6-1.8C13.8,7,14.1,4.4,14.1,1.9z')
                                            .style('fill', "#000000");
                                    }           
                                    var machIcon = element.append('g').attr('transform', 'translate(26,12)'); 

                                    switch (d.machine_icon){                              
                                            case 'win':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M6,0.6c1-0.4,3.1-1.2,5,0.4c-0.3,0.8-0.9,3.4-1.3,4.5c-1.6-1.2-3.8-0.9-5-0.3C5,4.2,6,0.6,6,0.6z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#D66C27');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M4.5,5.9c1-0.4,3.1-1.2,5,0.4C9.3,7,8.6,9.6,8.2,10.7c-1.6-1.2-3.8-0.9-5-0.2C3.5,9.4,4.5,5.9,4.5,5.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#0390C8');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M15.3,6.3c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.2C16.3,2.7,15.3,6.3,15.3,6.3z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#87B340');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.9,11.4c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.3C14.9,7.9,13.9,11.4,13.9,11.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FCCE32');
                                                break;
                                            case 'os':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.7,1.9c0.4-0.5,0.7-1.2,0.6-1.9c-0.7,0-1.4,0.5-1.9,1C10,1.5,9.7,2.2,9.8,2.9C10.5,2.9,11.3,2.5,11.7,1.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.7,5.4c0.2-0.6,0.6-1.1,1.2-1.4c-0.6-0.8-1.5-1.2-2.4-1.2c-1.1,0-1.6,0.5-2.3,0.5c-0.8,0-1.4-0.5-2.4-0.5c-0.9,0-1.9,0.6-2.6,1.5C5,4.7,4.9,5.1,4.8,5.6C4.6,7,4.9,8.8,6,10.4C6.5,11.1,7.2,12,8.1,12c0.8,0,1-0.5,2.1-0.5c1.1,0,1.3,0.5,2.1,0.5c0.9,0,1.6-1,2.2-1.7c0.4-0.6,0.5-0.8,0.8-1.5C13.8,8.3,13.2,6.7,13.7,5.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break;
                                            case 'win':
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.4,0c0.5,0,1.3,0.4,1.4,1c0.1,0.3,0,0.7,0,1.1c0,0.4,0,0.8,0,1.2c0.1,0.7,0.6,1.1,0.9,1.7c0.2,0.3,0.3,0.6,0.4,0.9c0.1,0.4,0.2,0.7,0.2,1.1c0.1,0.4,0.1,0.7,0.1,1.1c0,0.2,0,0.3,0,0.5c0,0.2-0.1,0.3-0.1,0.5c0,0.2,0,0.3,0.2,0.3c0.2,0,0.3,0,0.5,0c0.3,0,0.7,0.2,0.6,0.5c-0.4,0.5-0.8,1.2-1.3,1.6c-0.2,0.2-0.4,0.5-0.7,0.5c-0.3,0.1-0.7,0.1-0.9-0.1c-0.1-0.1-0.2-0.2-0.2-0.3c0-0.1-0.1-0.1-0.1-0.2c0-0.1,0-0.1-0.1-0.1c-0.4,0-0.8,0-1.2,0c-0.4,0-0.7-0.1-1.1-0.2c-0.1-0.1-0.3-0.1-0.4-0.2c-0.1-0.1-0.2,0.3-0.3,0.3c-0.1,0.2-0.3,0.5-0.6,0.5c-0.1,0-0.3,0-0.4,0c-0.2-0.1-0.3-0.2-0.5-0.3c-0.3-0.2-0.6-0.4-0.9-0.6c-0.3-0.2-0.7-0.5-0.7-0.8c0.1-0.3,0.2-0.4,0.5-0.4c0.1,0,0.3,0,0.3-0.1c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.3c0.1-0.3,0.5-0.1,0.7,0c0.1-0.1,0.2-0.2,0.2-0.3C7,8.4,7.1,8.4,7.1,8.2C6.9,6.7,7.8,5.3,8.5,4c0.1-0.2,0.2-0.4,0.3-0.6c0.1-0.1,0.1-0.4,0.1-0.6c0-0.5,0-1,0-1.4c0-0.4,0.1-0.7,0.4-1C9.6,0.2,10,0,10.4,0z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#231F20');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11,3.4c0.1,0.2,0.1,0.5,0.2,0.7c0.1,0.2,0.2,0.4,0.3,0.7c0.2,0.5,0.5,0.9,0.6,1.4c0.2,0.5,0.3,0.9,0.2,1.4c-0.1,0.2-0.1,0.5-0.2,0.7c0,0.1-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.2-0.1,0.4c-0.2,0-0.3-0.2-0.5-0.1c-0.2,0-0.2,0.4-0.2,0.5c0,0.3,0,0.5,0,0.8c0,0.1,0,0.1,0,0.2c-0.1,0-0.1,0.1-0.2,0.1c-0.1,0-0.2,0.1-0.3,0.1c-0.5,0.1-1,0.1-1.5,0c-0.1,0-0.2-0.1-0.3-0.1c-0.2-0.1-0.2-0.1-0.2-0.2c0-0.2-0.2-0.6-0.3-0.8c-0.2-0.5-0.4-1-0.6-1.6c0-0.1-0.1-0.2-0.1-0.3c0-0.1,0-0.2,0-0.3c0.1-0.3,0.2-0.5,0.3-0.8C8,6,8.2,5.8,8.3,5.6c0.1-0.2,0.1-0.5,0.2-0.7c0.1-0.2,0.2-0.4,0.3-0.7C9,4,9.1,3.7,9.2,3.5c0.3,0.3,0.5,0.3,0.9,0.3c0.2,0,0.3-0.1,0.5-0.1C10.6,3.6,10.9,3.4,11,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.8C8.9,1.8,8.9,1.7,8.9,1.8C8.9,1.7,8.9,1.8,8.9,1.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M7.3,8.5c0.1,0.1,0.2,0.3,0.3,0.4c0.1,0.2,0.2,0.5,0.2,0.7C7.9,9.9,8,10.4,8,10.8c0,0.4-0.3,0.6-0.6,0.6c-0.2,0-0.4-0.1-0.6-0.2c-0.2-0.1-0.4-0.2-0.6-0.4c-0.3-0.2-0.8-0.5-0.9-0.9C5.2,9.8,5.4,9.6,5.6,9.6c0.2,0,0.3,0,0.4-0.2c0.1-0.1,0-0.3,0-0.4c0.1-0.2,0.3-0.1,0.5,0c0.1,0,0.1,0.1,0.2,0c0.1-0.1,0.1-0.2,0.2-0.3C7,8.6,7.3,8.3,7.3,8.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.8,8.8c0.1,0,0.1,0.1,0.2,0.1c0,0.1,0,0.2,0,0.3c0,0.2,0.3,0.3,0.5,0.4C12.9,9.7,13,9.3,13.2,9c0.1,0,0.1,0.3,0.1,0.4c0.1,0.2,0.3,0.1,0.4,0.1c0.3-0.1,0.9,0,0.7,0.5c-0.2,0.3-0.5,0.6-0.7,0.9c-0.1,0.1-0.2,0.3-0.4,0.4c-0.1,0.1-0.3,0.2-0.4,0.3c-0.3,0.2-0.6,0.4-1,0.3c-0.5-0.1-0.5-0.6-0.6-1c-0.1-0.4-0.1-0.9-0.1-1.3c0-0.2,0-0.4,0.1-0.6C11.4,8.8,11.6,8.7,11.8,8.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '10.9')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '9.3')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.1,2.5c0.2,0,0.3,0.2,0.4,0.2c0.2,0.1,0.4,0,0.4,0.2c0.1,0.2-0.1,0.3-0.3,0.4c-0.2,0.1-0.3,0.2-0.6,0.2s-0.4,0-0.6-0.1C9.4,3.3,9.3,3.2,9.3,3c0-0.2,0.2-0.2,0.4-0.3C9.7,2.7,9.9,2.4,10.1,2.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                break;
                                            default:                                               
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M9,8.1l0-0.4C8.9,6.9,9.2,6.1,9.9,5.2c0.7-0.8,1-1.4,1-2.1c0-0.8-0.5-1.3-1.4-1.3C9,1.8,8.4,2,8,2.3L7.7,1.3C8.2,1,9,0.7,9.8,0.7c1.7,0,2.5,1.1,2.5,2.2c0,1-0.6,1.8-1.3,2.6c-0.7,0.8-0.9,1.4-0.9,2.2l0,0.4H9z M8.7,10.2c0-0.6,0.4-0.9,0.9-0.9c0.5,0,0.9,0.4,0.9,0.9c0,0.5-0.3,0.9-0.9,0.9C9.1,11.2,8.7,10.8,8.7,10.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break; 
                                    } 
                                    
                                    var elm2 = elm.append('div')
                                        .attr('class', 'localuserlisttext');
                                    elm2.append('span')
                                        .attr('class', 'usernametext')
                                        .html(name+"")
                                    elm2.append('form')
                                        .attr('class', 'ng-hide usernameform')
                                        .append('input')
                                            .html(name)
                                            .attr('type', 'text')
                                            .attr('value', name+"")
                                            .on('blur', function(e){
                                                doneEditing(elm, e, this.value)
                                            })
                                            //.html(name+"");
        
                                    var el = elel[0];

                                     var elm2 = $(this);
                                    // console.log(el)
                                     //console.log(elm2[0])


                                    el.draggable = true;
                                    el.addEventListener(
                                        'dragstart',
                                        function(e) {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('Text', this.id);
                                            this.classList.add('drag');
                                            return false;
                                        },
                                        false
                                    );

                                    el.addEventListener(
                                        'dragend',
                                        function(e) {
                                            $scope.requery(d, 'flooruser');
                                            lastUserRequeried = d.id;
                                            this.classList.remove('drag');
                                            return false;
                                        },
                                        false
                                    );
                               // }
                            });
                        userDiv.style('height', (count+1)*nodeHeight+'px');

                        // Draw users on floor
                        container.selectAll('g').remove();
                        container.selectAll('g').data(data.filter(function(d){if (d.map === floorName){ return true; }})).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("id", function(d){
                                return d.id;
                            })
                            .on('click', function(d) {

                            })
                            .append('svg:foreignObject')
                                .attr('height', "65px")
                                .attr('width', "150px")
                                //.attr('class', "dragging")
                                .attr("transform", function(d){
                                    if (!d.setFloor) {
                                        d.x = getAdjustedCoor(d.x);
                                        d.y = getAdjustedCoor(d.y);
                                        d.setFloor = true; 
                                    }        
                                    return "scale("+userScale+")translate("+(d.x/userScale)+","+(d.y/userScale)+")"
                                })
                                .call(drag)
                            .append('xhtml:button')
                                .each(function(d){
                                if ((d.x > 0) || (d.y > 0)) {                                
                                    var name = d.lan_machine;
                                    if (d.custom_user != null){
                                        name = d.custom_user;
                                    }
                                    if (name === ""){
                                        name = d.lan_ip;
                                    }
                                    if (name === ""){
                                        name = d.lan_mac;
                                    }
                                    var iconColour = getIconColour(d);
                                    var id = d.id;
                                    var elm = d3.select(this);
                                    var elel = elm[0];
                                    var el = elel[0];
                                    var element = elm.append("div").attr('class', 'localuserlisticon').append("svg");

                                    elm
                                        //.attr('id', id)
                                        .classed('user-'+id, true)
                                        .on('dblclick', function(e){
                                            $('.usernametext').each(function(e){
                                                this.classList.remove('ng-hide');
                                            });
                                            $('.usernameform').each(function(e){
                                                this.classList.add('ng-hide');
                                            });

                                            var iconText = $(this).find('.usernametext')[0];
                                            var iconInput = $(this).find('.usernameform')[0];
                                            iconText.classList.add('ng-hide');
                                            iconInput.classList.remove('ng-hide');
                                        })

                                        .on('click', function(e){
                                            if(d3.event.toElement.value === undefined){
                                                $('.usernametext').each(function(e){
                                                    this.classList.remove('ng-hide');
                                                });
                                                $('.usernameform').each(function(e){
                                                    this.classList.add('ng-hide');
                                                });
                                            }
                                            userDiv.selectAll('button').each(function(d){
                                                var elmbut = d3.select(this);
                                                $(elmbut[0]).removeClass('selected');
                                            })
                                            floorDiv.selectAll('button').each(function(d){
                                                var elmbut = d3.select(this);
                                                $(elmbut[0]).removeClass('selected');
                                            })
                                            el.classList.add('selected');                                   
   
                                            $scope.requery(d, 'flooruser');
                                            lastUserRequeried = d.id;

                                            $scope.getConnections(d); 
                                            endpointConn.selectAll('line').remove();

                                            wait(function(){
                                                lineCount = 0;
                                                drawConnections(elm[0][0], $scope.selectedUser, $scope.connectionIn, "#34D4FF");
                                                drawConnections(elm[0][0], $scope.selectedUser, $scope.connectionOut, "#009426");
                                                drawConnections(elm[0][0], $scope.selectedUser, $scope.connStealthIn, "#C40600");
                                                drawConnections(elm[0][0], $scope.selectedUser, $scope.connStealthOut, "#EE00FF");                                                 
                                            }, 400);
                                            // draw line links          
                                        });
                                        element
                                            .attr('height', '25')
                                            .attr('width', '43')
                                        switch (d.lan_type){
                                            case 'endpoint':
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            case 'server':
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '15,18 14,18 14,19 11,19 11,22 18,22 18,19 15,19') 
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 19)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 5)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,13H5v4h19V13z M8,16H6v-2h2V16z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,7H5v4h19V7z M8,10H6V8h2V10z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,1H5v4h19V1z M8,4H6V2h2V4z');
                                                break;
                                            case 'mobile':
                                                element.append('svg:path')
                                                    .attr("class", "userColor")
                                                    .attr('d', 'M8,1v22h14V1H8z M15,22.3c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5C16.5,21.6,15.8,22.3,15,22.3z M20,18H10V3h10V18z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            default:
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                    } 

                                    if (d.stealth === 1) {
                                        element.append('svg:path')
                                            .attr('transform', 'translate(26,0)')
                                            .attr('d', 'M14.1,1.9C11.2,2,9.6,0,9.6,0c0,0-1.3,1.9-4.5,1.9c0,3.2,0.6,5.4,2,7.4C7.2,9.5,8,11,9.6,11c1.7,0,2.4-1.5,2.6-1.8C13.8,7,14.1,4.4,14.1,1.9z')
                                            .style('fill', "#000000");
                                    }           
                                    var machIcon = element.append('g').attr('transform', 'translate(26,12)'); 

                                    switch (d.machine_icon){                              
                                            case 'win':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M6,0.6c1-0.4,3.1-1.2,5,0.4c-0.3,0.8-0.9,3.4-1.3,4.5c-1.6-1.2-3.8-0.9-5-0.3C5,4.2,6,0.6,6,0.6z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#D66C27');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M4.5,5.9c1-0.4,3.1-1.2,5,0.4C9.3,7,8.6,9.6,8.2,10.7c-1.6-1.2-3.8-0.9-5-0.2C3.5,9.4,4.5,5.9,4.5,5.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#0390C8');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M15.3,6.3c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.2C16.3,2.7,15.3,6.3,15.3,6.3z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#87B340');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.9,11.4c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.3C14.9,7.9,13.9,11.4,13.9,11.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FCCE32');
                                                break;
                                            case 'os':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.7,1.9c0.4-0.5,0.7-1.2,0.6-1.9c-0.7,0-1.4,0.5-1.9,1C10,1.5,9.7,2.2,9.8,2.9C10.5,2.9,11.3,2.5,11.7,1.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.7,5.4c0.2-0.6,0.6-1.1,1.2-1.4c-0.6-0.8-1.5-1.2-2.4-1.2c-1.1,0-1.6,0.5-2.3,0.5c-0.8,0-1.4-0.5-2.4-0.5c-0.9,0-1.9,0.6-2.6,1.5C5,4.7,4.9,5.1,4.8,5.6C4.6,7,4.9,8.8,6,10.4C6.5,11.1,7.2,12,8.1,12c0.8,0,1-0.5,2.1-0.5c1.1,0,1.3,0.5,2.1,0.5c0.9,0,1.6-1,2.2-1.7c0.4-0.6,0.5-0.8,0.8-1.5C13.8,8.3,13.2,6.7,13.7,5.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break;
                                            case 'linux':
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.4,0c0.5,0,1.3,0.4,1.4,1c0.1,0.3,0,0.7,0,1.1c0,0.4,0,0.8,0,1.2c0.1,0.7,0.6,1.1,0.9,1.7c0.2,0.3,0.3,0.6,0.4,0.9c0.1,0.4,0.2,0.7,0.2,1.1c0.1,0.4,0.1,0.7,0.1,1.1c0,0.2,0,0.3,0,0.5c0,0.2-0.1,0.3-0.1,0.5c0,0.2,0,0.3,0.2,0.3c0.2,0,0.3,0,0.5,0c0.3,0,0.7,0.2,0.6,0.5c-0.4,0.5-0.8,1.2-1.3,1.6c-0.2,0.2-0.4,0.5-0.7,0.5c-0.3,0.1-0.7,0.1-0.9-0.1c-0.1-0.1-0.2-0.2-0.2-0.3c0-0.1-0.1-0.1-0.1-0.2c0-0.1,0-0.1-0.1-0.1c-0.4,0-0.8,0-1.2,0c-0.4,0-0.7-0.1-1.1-0.2c-0.1-0.1-0.3-0.1-0.4-0.2c-0.1-0.1-0.2,0.3-0.3,0.3c-0.1,0.2-0.3,0.5-0.6,0.5c-0.1,0-0.3,0-0.4,0c-0.2-0.1-0.3-0.2-0.5-0.3c-0.3-0.2-0.6-0.4-0.9-0.6c-0.3-0.2-0.7-0.5-0.7-0.8c0.1-0.3,0.2-0.4,0.5-0.4c0.1,0,0.3,0,0.3-0.1c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.3c0.1-0.3,0.5-0.1,0.7,0c0.1-0.1,0.2-0.2,0.2-0.3C7,8.4,7.1,8.4,7.1,8.2C6.9,6.7,7.8,5.3,8.5,4c0.1-0.2,0.2-0.4,0.3-0.6c0.1-0.1,0.1-0.4,0.1-0.6c0-0.5,0-1,0-1.4c0-0.4,0.1-0.7,0.4-1C9.6,0.2,10,0,10.4,0z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#231F20');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11,3.4c0.1,0.2,0.1,0.5,0.2,0.7c0.1,0.2,0.2,0.4,0.3,0.7c0.2,0.5,0.5,0.9,0.6,1.4c0.2,0.5,0.3,0.9,0.2,1.4c-0.1,0.2-0.1,0.5-0.2,0.7c0,0.1-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.2-0.1,0.4c-0.2,0-0.3-0.2-0.5-0.1c-0.2,0-0.2,0.4-0.2,0.5c0,0.3,0,0.5,0,0.8c0,0.1,0,0.1,0,0.2c-0.1,0-0.1,0.1-0.2,0.1c-0.1,0-0.2,0.1-0.3,0.1c-0.5,0.1-1,0.1-1.5,0c-0.1,0-0.2-0.1-0.3-0.1c-0.2-0.1-0.2-0.1-0.2-0.2c0-0.2-0.2-0.6-0.3-0.8c-0.2-0.5-0.4-1-0.6-1.6c0-0.1-0.1-0.2-0.1-0.3c0-0.1,0-0.2,0-0.3c0.1-0.3,0.2-0.5,0.3-0.8C8,6,8.2,5.8,8.3,5.6c0.1-0.2,0.1-0.5,0.2-0.7c0.1-0.2,0.2-0.4,0.3-0.7C9,4,9.1,3.7,9.2,3.5c0.3,0.3,0.5,0.3,0.9,0.3c0.2,0,0.3-0.1,0.5-0.1C10.6,3.6,10.9,3.4,11,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.8C8.9,1.8,8.9,1.7,8.9,1.8C8.9,1.7,8.9,1.8,8.9,1.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M7.3,8.5c0.1,0.1,0.2,0.3,0.3,0.4c0.1,0.2,0.2,0.5,0.2,0.7C7.9,9.9,8,10.4,8,10.8c0,0.4-0.3,0.6-0.6,0.6c-0.2,0-0.4-0.1-0.6-0.2c-0.2-0.1-0.4-0.2-0.6-0.4c-0.3-0.2-0.8-0.5-0.9-0.9C5.2,9.8,5.4,9.6,5.6,9.6c0.2,0,0.3,0,0.4-0.2c0.1-0.1,0-0.3,0-0.4c0.1-0.2,0.3-0.1,0.5,0c0.1,0,0.1,0.1,0.2,0c0.1-0.1,0.1-0.2,0.2-0.3C7,8.6,7.3,8.3,7.3,8.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.8,8.8c0.1,0,0.1,0.1,0.2,0.1c0,0.1,0,0.2,0,0.3c0,0.2,0.3,0.3,0.5,0.4C12.9,9.7,13,9.3,13.2,9c0.1,0,0.1,0.3,0.1,0.4c0.1,0.2,0.3,0.1,0.4,0.1c0.3-0.1,0.9,0,0.7,0.5c-0.2,0.3-0.5,0.6-0.7,0.9c-0.1,0.1-0.2,0.3-0.4,0.4c-0.1,0.1-0.3,0.2-0.4,0.3c-0.3,0.2-0.6,0.4-1,0.3c-0.5-0.1-0.5-0.6-0.6-1c-0.1-0.4-0.1-0.9-0.1-1.3c0-0.2,0-0.4,0.1-0.6C11.4,8.8,11.6,8.7,11.8,8.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '10.9')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '9.3')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.1,2.5c0.2,0,0.3,0.2,0.4,0.2c0.2,0.1,0.4,0,0.4,0.2c0.1,0.2-0.1,0.3-0.3,0.4c-0.2,0.1-0.3,0.2-0.6,0.2s-0.4,0-0.6-0.1C9.4,3.3,9.3,3.2,9.3,3c0-0.2,0.2-0.2,0.4-0.3C9.7,2.7,9.9,2.4,10.1,2.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                break;
                                            default:                                        
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M9,8.1l0-0.4C8.9,6.9,9.2,6.1,9.9,5.2c0.7-0.8,1-1.4,1-2.1c0-0.8-0.5-1.3-1.4-1.3C9,1.8,8.4,2,8,2.3L7.7,1.3C8.2,1,9,0.7,9.8,0.7c1.7,0,2.5,1.1,2.5,2.2c0,1-0.6,1.8-1.3,2.6c-0.7,0.8-0.9,1.4-0.9,2.2l0,0.4H9z M8.7,10.2c0-0.6,0.4-0.9,0.9-0.9c0.5,0,0.9,0.4,0.9,0.9c0,0.5-0.3,0.9-0.9,0.9C9.1,11.2,8.7,10.8,8.7,10.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break; 
                                    } 
                                    var elm2 = elm.append('div')
                                        .attr('class', 'localuserlisttext');
                                    elm2.append('span')
                                        .attr('class', 'usernametext')
                                        .html(name+"")
                                    elm2.append('form')
                                        .attr('class', 'ng-hide usernameform')
                                        .append('input')
                                            .html(name)
                                            .attr('type', 'text')
                                            .attr('value', name+"")
                                            .on('blur', function(e){
                                                doneEditing(elm, e, this.value)
                                            });

                                    // el.draggable = true;

                                    // el.addEventListener(
                                    //     'dragstart',
                                    //     function(e) {
                                    //         e.dataTransfer.effectAllowed = 'move';
                                    //         e.dataTransfer.setData('Text', this.id);
                                    //         //this.classList.add('drag');
                                    //         return false;
                                    //     },
                                    //     false
                                    // );

                                    // el.addEventListener(
                                    //     'dragend',
                                    //     function(e) {
                                    //         //this.classList.remove('drag');
                                    //         $scope.requery(d, 'flooruser');
                                    //         lastUserRequeried = d.id;
                                    //         return false;
                                    //     },
                                    //     false
                                    // );
                                }
                            });                            
                    }  
     //This function determines the colour of the endpoint based on what type 
                    //of trigger has been activated
                    function getIconColour(endpoint, args, type) {
                        if(args != undefined) {
                            var colour = '#29ABE2';//the default
                            args.forEach(function(d){
                                if(d.lan_ip == endpoint.lan_ip && d.lan_zone == endpoint.lan_zone) {
                                    //change to switch when more buttons are added
                                    if (type === 'iocusers') {
                                        colour = '#FF0000'; //CHANGE
                                    } else if(type === 'activeusers') {
                                        colour = '#00FF00'; //CHANGE
                                    } else if(type === 'activestealthusers') {
                                        colour = '#666666'; //CHANGE
                                    } else {
                                        colour = '#29ABE2'; //the default
                                    }  
                                    return;                                                          
                                }                        
                            });

                            return colour;
                        } else {
                            return '#29ABE2';
                        }
                    }

                    //The following function handles a trigger button being pressed, iterating over the endpoint
                    //icons and changing the colour of the ones matching the trigger filter
                    function handleTrigger(data, type) {
                        d3.selectAll('button').each(function(d){
                            if(d != undefined) {
                                var id = d.id;
                                var elm = d3.select(this);
                                var elel = elm[0];
                                var el = elel[0];

                                var element = elm.select('div').select('svg');

                                element.selectAll('.userColor').style('fill', getIconColour(d, data, type));
                            }
                        });
                    }

                    /////////////////
                    ///  BUTTONS  ///
                    /////////////////
                    buttonDiv.selectAll('button').remove();
                    buttonDiv.append('button')
                        .html('Users with IOC')
                        .attr('class', 'pure-button epbRed')
                        .on('click', function(){
                            var query = '/local_events/endpoint_map?type=floorquery';
                            var triggerData;
                            var triggerType;
                            $http({method: 'GET', url: query+'&typeinfo=iocusers'}).
                                success(function(result) {
                                    handleTrigger(result, "iocusers");
                                });
                        });
                    buttonDiv.append('button')
                        .html('Active Users')
                        .attr('class', 'pure-button epbGreen')
                        .on('click', function(){
                            var query = '/local_events/endpoint_map?type=floorquery';
                            if ($location.$$search.start && $location.$$search.end) {
                                query = query +'&start='+$location.$$search.start+'&end='+$location.$$search.end; 
                            }
                            $http({method: 'GET', url: query+'&typeinfo=activeusers'}).
                                success(function(result) {
                                    handleTrigger(result, "activeusers");
                                });

                        });
                    buttonDiv.append('button')
                        .html('Active Stealth Users')
                        .attr('class', 'pure-button epbGrey')
                        .on('click', function(){
                            var query = '/local_events/endpoint_map?type=floorquery';
                            if ($location.$$search.start && $location.$$search.end) {
                                query = query +'&start='+$location.$$search.start+'&end='+$location.$$search.end; 
                            }
                            $http({method: 'GET', url: query+'&typeinfo=activestealthusers'}).
                                success(function(result) {
                                    handleTrigger(result, "activestealthusers");
                                });

                        });

                    scaleButtonDiv.append('button')
                        .html('Save Scale')
                        .attr('class', 'pure-button')
                        .on('click', function (d) {
                            if ($scope.floor.active) {
                                $http({method: 'POST', url: '/local_events/endpoint_map?type=saveFloorScale', data: {scale: scale,floor: $scope.floor}});
                            }
                        });

                    // buttonDiv.append('button')
                    //     .html('Reset Users')
                    //     .attr('class', 'pure-button epbGrey')
                    //     .on('click', function(){
                    //         $scope.data.users.filter(function(d){
                    //             if( d.map !== null){
                    //                 console.log(d.map)
                    //                 console.log(d.x)
                    //                 console.log(d.y)
                    //                 console.log(" ")
                    //             } 
                    //         });
                    //     });

                       /* buttonDiv.append('button')
                            .html('Zoom In')
                            .attr('class', 'resetButton')
                            .on('click',function(){
                            //if (zm.scale()< maxScale) {
                                $scope.global.floorScale = $scope.global.floorScale*1.0762401247837972;
                                currFloorX = 38*currFloorX;
                                currFloorY = 28*currFloorY;
                                var coords = [currFloorX, currFloorY];
                                console.log($scope.global.floorScale);
                                zoomer(coords, $scope.global.floorScale);
                            //}
                        });
                        buttonDiv.append('button')
                            .html('Zoom Out')
                            .attr('class', 'resetButton')
                            .on('click',function(){
                                $scope.global.floorScale = $scope.global.floorScale*0.9291606742509133;
                                currFloorX = 38*currFloorX;
                                currFloorY = 28*currFloorY;
                                var coords = [currFloorX, currFloorY];                           
                                zoomer(coords, $scope.global.floorScale);
                        });
                        buttonDiv.append('button')
                            .html('Reset Zoom')
                            .attr('class', 'resetButton')
                            .on('click',function(){
                            $scope.global.floorScale = 1;
                            zoomer([0,0], $scope.global.floorScale);
                        });*/

                    
                    //////////////////////////
                    ///  $SCOPE FUNCTIONS  ///
                    //////////////////////////

                    $rootScope.removeLines = function () {
                        endpointConn.selectAll('line').remove();
                    }

                    // -- redraws the floor (used when user is deleted from floorplan)
                    $rootScope.redrawFloor = function () {
                        var currentUser = d3.select('.selected');
                        currentUser
                            .attr("class", "localuserlist")
                            .attr('draggable', "true");
                        currentUser.data()[0].map = null;
                        currentUser.remove();
                        $(userDiv[0][0]).append(currentUser[0][0]);
                        plot(data,floorName);
                    }
                    // -- sets selected class for CSS (controller calls this when coming from ioc_events_drilldown(page2))
                    $scope.$on('setSelected', function (event, selected) { 
                        d3.select('.user-'+selected.id).classed("selected", true);
                    })

                    ////////////////
                    ///  SEARCH  ///
                    ////////////////
                    // -- display users after
                    // $scope.$on('searchUsers', function (event, filteredData){
                    //     plot(filteredData, floorName);
                    //     wait(function(){
                    //         if (filteredData.length > 0) {
                    //             if (lastUserRequeried !== filteredData[0].id) {
                    //                 $scope.floors.filter(function(d){ if ((filteredData[0].map === d.asset_name)) { d.active = true; }});
                    //                 $scope.requery(filteredData[0], 'flooruser');
                    //                 lastUserRequeried = filteredData[0].id;
                    //             } 
                    //             d3.select('.user-'+filteredData[0].id).classed("selected", true);
                    //         } else {
                    //             // remove the info pane
                    //             lastUserRequeried = -1;
                    //             $scope.requery("clear", 'flooruser');   
                    //         }
                    //     }, 500, "filtertWait");
                    // })
                    plot(data, floorName);

            }, 0);
        }
    };
}]);

angular.module('mean.pages').directive('makeAllFloorPlan', ['$timeout', '$rootScope', '$http', '$location', 'searchFilter', function ($timeout, $rootScope, $http, $location, searchFilter) {
    return {
        link: function ($scope, element, attrs) {
            //$scope.$on('floorPlan', function (event) {
                setTimeout(function () {

                    // watch global search for changes.. then filter
                    var searchFired = false;
                    $rootScope.$watch('search', function(){
                        if (searchFired === true) {
                            searchFilter($scope.searchDimension, $rootScope.search);
                            $scope.$broadcast('searchUsers',$scope.searchDimension.top(Infinity));
                        }
                        searchFired = true;
                    })

                    var lastUserRequeried = -1;
                    var wait = (function () { 
                        var timers = {};
                        return function (callback, ms, uniqueId) {
                            if (!uniqueId) {
                                uniqueId = "filterWait"; //Don't call this twice without a uniqueId
                            }
                            if (timers[uniqueId]) {
                                clearTimeout (timers[uniqueId]);
                            }
                            timers[uniqueId] = setTimeout(callback, ms);
                        };
                    })();
                    ///////////////////////////
                    ///  INITIAL VARIABLES  ///
                    ///////////////////////////
                    var floors = $scope.building.floors;
                    var imageRatio = 1.33333333333;
                    var data = $scope.data.users;
                    var scale = 1;

                    // var elementWidth = ($('#allfloorplanspan')[0].offsetWidth-25);
                    // var elementHeight = (($('#allfloorplanspan')[0].offsetWidth-25)/imageRatio);
                    var elementWidth = 959;
                    var elementHeight = (elementWidth/imageRatio);
                    element.width(elementWidth);
                    element.height(elementHeight);
                    $scope.userList = data;

                    ///////////////////////////
                    ///  DIV/ELEMENT SETUP  ///
                    ///////////////////////////
                    var userDivWrapper = d3.select("#localListWrapper").style('height', elementHeight+50+'px').style('overflow', 'auto');
                    var userDiv = d3.select("#listlocalusers").attr("width","100%");
                    var infoDiv = d3.select('#alllocaluserinformation').append('table').style('overflow', 'auto');
                    var floorDiv = d3.select(element[0]);

                    var windowScale = $scope.standardWidth/element.outerWidth();

                    var hideListDiv = d3.select('#listlocalusersspan');
                    var expandDiv = d3.select('#allfloorplanspan');
                    var buttonDiv = d3.select('#triggerbuttons');
                    var scaleButtonDiv = $('#scalebuttons');

                    var margin = {top: -5, right: -5, bottom: -5, left: -5};

                    var zoom = d3.behavior.zoom()
                        .scaleExtent([0.1, 5])
                        //.translate([0,0])
                        .translate([0,0])
                        .scale(scale)
                        .on("zoom", zoomed);

                    var drag = d3.behavior.drag()
                        .origin(function(d) { return d; })
                        .on("dragstart", dragstarted)
                        .on("drag", dragged)
                        .on("dragend", dragended);

                    var svg = floorDiv.append("svg")             
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
                            .call(zoom);

                    var container = svg.append("g")
                        .attr("class", "bin")
                        .attr("drop", "handleDrop")
                        .attr("id", "floorContainer")
                        .style("pointer-events", "all")
                        .attr("transform", "translate(0,0)scale("+scale+")");

                    svg.on("dblclick.zoom", null);

                    container.append("svg")  
                        .attr("class", "floorimage")
                        .append("image")
                        .attr("id", "svgFloorPlan")
                        .attr("class", "svgFloor")
                        .attr("height", elementHeight)                    
                        .attr("width", elementWidth)
                        .attr("xlink:href", " ")
                        .attr("type", "image/svg+xml");     

                    var endpointConn = container.append("svg")
                    .attr("class", "endpointConn");

                    // -- to hide <input> when changing custom username
                    container.on('click', function(e){
                        if(d3.event.toElement.id == d3.select('.svgFloor')[0][0].id){
                            $scope.requery("clear"); 
                        }
                    })

                     // -- hide/show userlist                    
                    var hideDiv = $('.hidelocalusers')
                        .on("click", function () {
                            if (hideListDiv.attr("class") === "floorHide") {
                                expandDiv.style('width','60%');
                                floorDiv.style('width',elementWidth+"px");
                                floorDiv.style('height',elementHeight+"px");
                                hideDiv.html("&#9668; &#9668; &#9668;");
                                setTimeout(function () {
                                    hideListDiv.classed('floorHide', false);
                                }, 0);
                            }else{
                                floorDiv.style('width',elementWidth*1.25+"px");
                                floorDiv.style('height',elementHeight*1.25+"px");
                                expandDiv.style('width','75%'); 
                                hideDiv.html("&#9658; &#9658; &#9658;");
                                setTimeout(function () {
                                    hideListDiv.classed('floorHide', true);
                                }, 0);
                            }
                        })
                        .attr("style","padding-top:"+ (elementHeight/2)+'px')
                        .html("&#9668; &#9668; &#9668;");

                    ///////////////////
                    ///  FUNCTIONS  ///
                    ///////////////////
                    // -- zoom and movement behaviours of the floor
                    function zoomed() {
                            scale = d3.event.scale;
                            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                   
                    }
                    // -- handles the beginging of a user being dragged
                    function dragstarted(d) {
                        d3.event.sourceEvent.stopPropagation();
                        d3.select(this).classed("dragging", true);
                        container.selectAll('g').each(function(){
                            d3.select(this).classed("selected", false);
                        })
                        d3.select(this).classed("selected", true);
                    }
                    // -- handles during a user is dragged
                    function dragged(d) {
                        d.x = d3.event.x;
                        d.y = d3.event.y;
                        d3.select(this).attr("transform", "translate("+d.x + "," + d.y +")");
                    }
                    // -- handles the end of when a user is dragged
                    function dragended(d) {
                        $http({method: 'POST', url: '/local_events/endpoint_map?type=editFloorPos', data: {x: d.x, y: d.y, map_name: d.asset_name}});
                        d3.select(this).classed("dragging", false);
                        $scope.drawFloorConns("#23FF1C");
                    }
                    // -- updates username
                    function doneEditing(elm, item, value) {
                        $scope.change_customuser(item, value);
                        $(elm[0]).find('.usernametext').html(value);
                    }

                    // -- displays users in userlist and floor plans
                    function plot(data, floors) {
                        // set order of array
                        data = data.sort(function(a, b){ return a.id-b.id });
                        ////////////////////
                        ///  LIST USERS  ///
                        ////////////////////
                        // MAKE LIST ELEMENTS
                        var count = -1;
                        var nodeHeight = 32;
                        userDiv.selectAll('g').remove();
                        userDiv.selectAll('g').data(data.filter(function(d){if (d.map == null){ return true; }})).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("id", function(d){
                                return d.id;
                            })
                            .append('svg:foreignObject')
                                .style("padding-top", function(d){
                                    count++;
                                    return count*nodeHeight+"px";
                                })
                                .attr("height", (count+1)*nodeHeight+"px")
                                // /.attr('height', "30px")
                                .attr('width', "100%")
                                .attr("class", function(d){
                                    return 'userTrans-'+d.id;
                                })
                            .append('xhtml:button').each(function(d){
                                var iconColour = '#29ABE2'; 
                                var name = d.lan_machine;
                                if (d.custom_user != null){
                                    name = d.custom_user;
                                }
                                if (name === ""){
                                    name = d.lan_ip;
                                }
                                if (name === ""){
                                    name = d.lan_mac;
                                }
                                //if ((d.x === 0) && (d.y === 0)) {
                                    var id = d.id;
                                    var elm = d3.select(this);
                                    var elel = elm[0];
                                    elm
                                        // append id to li from data object
                                        .attr('id', id)
                                        .classed('user-'+id, true)
                                        .classed('localuserlist', true)
                                        .on('dblclick', function(e){
                                            $('.usernametext').each(function(e){
                                                this.classList.remove('ng-hide');
                                            });
                                            $('.usernameform').each(function(e){
                                                this.classList.add('ng-hide');
                                            });

                                            var iconText = $(this).find('.usernametext')[0];
                                            var iconInput = $(this).find('.usernameform')[0];
                                            iconText.classList.add('ng-hide');
                                            iconInput.classList.remove('ng-hide');
                                        })
                                        .on('click', function(e){
                                            userDiv.selectAll('button').each(function(d){
                                                var elm = d3.select(this);
                                                $(elm[0]).removeClass('selected');
                                            })
                                            floorDiv.selectAll('button').each(function(d){
                                                var elm = d3.select(this);
                                                $(elm[0]).removeClass('selected');
                                            })
                                            el.classList.add('selected');
                                            lastUserRequeried = d.id;
                                        });
                                    var element = elm
                                            .append('div')
                                                .attr('class', 'localuserlisticon')
                                                .append('svg');
                                     element
                                            .attr('height', '25')
                                            .attr('width', '43')
                                        switch (d.lan_type){
                                            case 'endpoint':
                                                 element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            case 'server':
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '15,18 14,18 14,19 11,19 11,22 18,22 18,19 15,19') 
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 19)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 5)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,13H5v4h19V13z M8,16H6v-2h2V16z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,7H5v4h19V7z M8,10H6V8h2V10z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,1H5v4h19V1z M8,4H6V2h2V4z');
                                                break;
                                            case 'mobile':
                                                element.append('svg:path')
                                                    .attr("class", "userColor")
                                                    .attr('d', 'M8,1v22h14V1H8z M15,22.3c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5C16.5,21.6,15.8,22.3,15,22.3z M20,18H10V3h10V18z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            default:
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                    } 

                                    if (d.stealth === 1) {
                                        element.append('g').append('svg:path')
                                            .attr('transform', 'translate(26,0)')
                                            .attr('d', 'M14.1,1.9C11.2,2,9.6,0,9.6,0c0,0-1.3,1.9-4.5,1.9c0,3.2,0.6,5.4,2,7.4C7.2,9.5,8,11,9.6,11c1.7,0,2.4-1.5,2.6-1.8C13.8,7,14.1,4.4,14.1,1.9z')
                                            .style('fill', "#000000");
                                    }           
                                    var machIcon = element.append('g').attr('transform', 'translate(26,12)'); 

                                    switch (d.machine_icon){                              
                                            case 'win':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M6,0.6c1-0.4,3.1-1.2,5,0.4c-0.3,0.8-0.9,3.4-1.3,4.5c-1.6-1.2-3.8-0.9-5-0.3C5,4.2,6,0.6,6,0.6z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#D66C27');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M4.5,5.9c1-0.4,3.1-1.2,5,0.4C9.3,7,8.6,9.6,8.2,10.7c-1.6-1.2-3.8-0.9-5-0.2C3.5,9.4,4.5,5.9,4.5,5.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#0390C8');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M15.3,6.3c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.2C16.3,2.7,15.3,6.3,15.3,6.3z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#87B340');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.9,11.4c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.3C14.9,7.9,13.9,11.4,13.9,11.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FCCE32');
                                                break;
                                            case 'os':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.7,1.9c0.4-0.5,0.7-1.2,0.6-1.9c-0.7,0-1.4,0.5-1.9,1C10,1.5,9.7,2.2,9.8,2.9C10.5,2.9,11.3,2.5,11.7,1.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.7,5.4c0.2-0.6,0.6-1.1,1.2-1.4c-0.6-0.8-1.5-1.2-2.4-1.2c-1.1,0-1.6,0.5-2.3,0.5c-0.8,0-1.4-0.5-2.4-0.5c-0.9,0-1.9,0.6-2.6,1.5C5,4.7,4.9,5.1,4.8,5.6C4.6,7,4.9,8.8,6,10.4C6.5,11.1,7.2,12,8.1,12c0.8,0,1-0.5,2.1-0.5c1.1,0,1.3,0.5,2.1,0.5c0.9,0,1.6-1,2.2-1.7c0.4-0.6,0.5-0.8,0.8-1.5C13.8,8.3,13.2,6.7,13.7,5.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break;
                                            case 'win':
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.4,0c0.5,0,1.3,0.4,1.4,1c0.1,0.3,0,0.7,0,1.1c0,0.4,0,0.8,0,1.2c0.1,0.7,0.6,1.1,0.9,1.7c0.2,0.3,0.3,0.6,0.4,0.9c0.1,0.4,0.2,0.7,0.2,1.1c0.1,0.4,0.1,0.7,0.1,1.1c0,0.2,0,0.3,0,0.5c0,0.2-0.1,0.3-0.1,0.5c0,0.2,0,0.3,0.2,0.3c0.2,0,0.3,0,0.5,0c0.3,0,0.7,0.2,0.6,0.5c-0.4,0.5-0.8,1.2-1.3,1.6c-0.2,0.2-0.4,0.5-0.7,0.5c-0.3,0.1-0.7,0.1-0.9-0.1c-0.1-0.1-0.2-0.2-0.2-0.3c0-0.1-0.1-0.1-0.1-0.2c0-0.1,0-0.1-0.1-0.1c-0.4,0-0.8,0-1.2,0c-0.4,0-0.7-0.1-1.1-0.2c-0.1-0.1-0.3-0.1-0.4-0.2c-0.1-0.1-0.2,0.3-0.3,0.3c-0.1,0.2-0.3,0.5-0.6,0.5c-0.1,0-0.3,0-0.4,0c-0.2-0.1-0.3-0.2-0.5-0.3c-0.3-0.2-0.6-0.4-0.9-0.6c-0.3-0.2-0.7-0.5-0.7-0.8c0.1-0.3,0.2-0.4,0.5-0.4c0.1,0,0.3,0,0.3-0.1c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.3c0.1-0.3,0.5-0.1,0.7,0c0.1-0.1,0.2-0.2,0.2-0.3C7,8.4,7.1,8.4,7.1,8.2C6.9,6.7,7.8,5.3,8.5,4c0.1-0.2,0.2-0.4,0.3-0.6c0.1-0.1,0.1-0.4,0.1-0.6c0-0.5,0-1,0-1.4c0-0.4,0.1-0.7,0.4-1C9.6,0.2,10,0,10.4,0z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#231F20');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11,3.4c0.1,0.2,0.1,0.5,0.2,0.7c0.1,0.2,0.2,0.4,0.3,0.7c0.2,0.5,0.5,0.9,0.6,1.4c0.2,0.5,0.3,0.9,0.2,1.4c-0.1,0.2-0.1,0.5-0.2,0.7c0,0.1-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.2-0.1,0.4c-0.2,0-0.3-0.2-0.5-0.1c-0.2,0-0.2,0.4-0.2,0.5c0,0.3,0,0.5,0,0.8c0,0.1,0,0.1,0,0.2c-0.1,0-0.1,0.1-0.2,0.1c-0.1,0-0.2,0.1-0.3,0.1c-0.5,0.1-1,0.1-1.5,0c-0.1,0-0.2-0.1-0.3-0.1c-0.2-0.1-0.2-0.1-0.2-0.2c0-0.2-0.2-0.6-0.3-0.8c-0.2-0.5-0.4-1-0.6-1.6c0-0.1-0.1-0.2-0.1-0.3c0-0.1,0-0.2,0-0.3c0.1-0.3,0.2-0.5,0.3-0.8C8,6,8.2,5.8,8.3,5.6c0.1-0.2,0.1-0.5,0.2-0.7c0.1-0.2,0.2-0.4,0.3-0.7C9,4,9.1,3.7,9.2,3.5c0.3,0.3,0.5,0.3,0.9,0.3c0.2,0,0.3-0.1,0.5-0.1C10.6,3.6,10.9,3.4,11,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.8C8.9,1.8,8.9,1.7,8.9,1.8C8.9,1.7,8.9,1.8,8.9,1.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M7.3,8.5c0.1,0.1,0.2,0.3,0.3,0.4c0.1,0.2,0.2,0.5,0.2,0.7C7.9,9.9,8,10.4,8,10.8c0,0.4-0.3,0.6-0.6,0.6c-0.2,0-0.4-0.1-0.6-0.2c-0.2-0.1-0.4-0.2-0.6-0.4c-0.3-0.2-0.8-0.5-0.9-0.9C5.2,9.8,5.4,9.6,5.6,9.6c0.2,0,0.3,0,0.4-0.2c0.1-0.1,0-0.3,0-0.4c0.1-0.2,0.3-0.1,0.5,0c0.1,0,0.1,0.1,0.2,0c0.1-0.1,0.1-0.2,0.2-0.3C7,8.6,7.3,8.3,7.3,8.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.8,8.8c0.1,0,0.1,0.1,0.2,0.1c0,0.1,0,0.2,0,0.3c0,0.2,0.3,0.3,0.5,0.4C12.9,9.7,13,9.3,13.2,9c0.1,0,0.1,0.3,0.1,0.4c0.1,0.2,0.3,0.1,0.4,0.1c0.3-0.1,0.9,0,0.7,0.5c-0.2,0.3-0.5,0.6-0.7,0.9c-0.1,0.1-0.2,0.3-0.4,0.4c-0.1,0.1-0.3,0.2-0.4,0.3c-0.3,0.2-0.6,0.4-1,0.3c-0.5-0.1-0.5-0.6-0.6-1c-0.1-0.4-0.1-0.9-0.1-1.3c0-0.2,0-0.4,0.1-0.6C11.4,8.8,11.6,8.7,11.8,8.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '10.9')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '9.3')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.1,2.5c0.2,0,0.3,0.2,0.4,0.2c0.2,0.1,0.4,0,0.4,0.2c0.1,0.2-0.1,0.3-0.3,0.4c-0.2,0.1-0.3,0.2-0.6,0.2s-0.4,0-0.6-0.1C9.4,3.3,9.3,3.2,9.3,3c0-0.2,0.2-0.2,0.4-0.3C9.7,2.7,9.9,2.4,10.1,2.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                break;
                                            default:                                               
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M9,8.1l0-0.4C8.9,6.9,9.2,6.1,9.9,5.2c0.7-0.8,1-1.4,1-2.1c0-0.8-0.5-1.3-1.4-1.3C9,1.8,8.4,2,8,2.3L7.7,1.3C8.2,1,9,0.7,9.8,0.7c1.7,0,2.5,1.1,2.5,2.2c0,1-0.6,1.8-1.3,2.6c-0.7,0.8-0.9,1.4-0.9,2.2l0,0.4H9z M8.7,10.2c0-0.6,0.4-0.9,0.9-0.9c0.5,0,0.9,0.4,0.9,0.9c0,0.5-0.3,0.9-0.9,0.9C9.1,11.2,8.7,10.8,8.7,10.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break; 
                                    } 
                                    
                                    var elm2 = elm.append('div')
                                        .attr('class', 'localuserlisttext');
                                    elm2.append('span')
                                        .attr('class', 'usernametext')
                                        .html(name+"")
                                    elm2.append('form')
                                        .attr('class', 'ng-hide usernameform')
                                        .append('input')
                                            .html(name)
                                            .attr('type', 'text')
                                            .attr('value', name+"")
                                            .on('blur', function(e){
                                                doneEditing(elm, e, this.value)
                                            })
                                            //.html(name+"");
        
                                    var el = elel[0];

                                     var elm2 = $(this);
                                    // console.log(el)
                                     //console.log(elm2[0])


                                    el.draggable = true;
                                    el.addEventListener(
                                        'dragstart',
                                        function(e) {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('Text', this.id);
                                            this.classList.add('drag');
                                            return false;
                                        },
                                        false
                                    );

                                    el.addEventListener(
                                        'dragend',
                                        function(e) {
                                            $scope.requery(d, 'flooruser');
                                            lastUserRequeried = d.id;
                                            this.classList.remove('drag');
                                            return false;
                                        },
                                        false
                                    );
                               // }
                            });
                        userDiv.style('height', (count+1)*nodeHeight+'px');

                        // Draw users on floor
                        var floorcount = -1;
                        // container.selectAll('g').remove();
                        container.selectAll('g').data(floors.filter(function(d){return true; })).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("transform", function(d){ 
                                return "translate("+d.x+","+d.y+")"
                            })
                            .call(drag)
                            .append('svg:foreignObject')
                                .attr('width', (elementWidth/3)+"px")
                                .attr('height', (elementHeight/3)+"px")
                            .append('xhtml:div').each(function(d){    
                                var userCount = 0;               
                                
                                var elm = d3.select(this);

                                data.filter(function(user){
                                    if (d.id == user.map) {
                                        userCount++;
                                    }
                                });

                                elm
                                    .style("border", "solid 1px #000")
                                    .style("background", "#fff")
                                    .style("border-radius", "8px")
                                    .style("text-align", "center")
                                    .html("<h4>"+d.custom_name + "</h4><strong>" + userCount + " Hosts </strong>")
                                    .on('dblclick', function(e){
                                        d.active = true;
                                        $rootScope.toggleZoom = true;
                                        $scope.$apply();
                                    })
                                    .on('click', function(e){
                                        $scope.requery(d, 'listusers'); 
                                        // $scope.removeLines();
                                    })
                                    .on('mouseover', function(e){
                                        d3.select(this).style("cursor","pointer")
                                    });  

                                var elel = elm[0];
                                var el = elel[0];

                                /////////////////////////////
                                ///  DROPPABLE BEHAVIOUR  ///
                                /////////////////////////////
                                // -- used for when a user is being dragged from userlist to floor
                                // var containerTag = container[0][0];
                                // containerTag.droppable = true;
                                // containerTag.addEventListener(
                                //     'dragover',
                                //     function(e) {
                                //         e.dataTransfer.dropEffect = 'move';
                                //         // allows us to drop
                                //         if (e.preventDefault) e.preventDefault();
                                //         $(this).addClass('over');
                                //         return false;
                                //     },
                                //     false
                                // );
                                // containerTag.addEventListener(
                                //     'dragenter',
                                //     function(e) {
                                //         $(this).addClass('over');
                                //         return false;
                                //     },
                                //     false
                                // );
                                // containerTag.addEventListener(
                                //     'dragleave',
                                //     function(e) {
                                //         $(this).removeClass('over');
                                //         return false;
                                //     },
                                //     false
                                // );
                                // // -- handles when a user is dropped from userlist to floorplan
                                // containerTag.addEventListener('drop', function(e) {
                                //     var floorName = d3.select(containerTag).attr('floor-name');
                                //     // Stops some browsers from redirecting.
                                //     if (e.stopPropagation) e.stopPropagation();

                                //     // call the drop passed drop function
                                //     var destinationId = $(this).attr('id');
                                //     var itemId = e.dataTransfer.getData("Text");
                                //     var item = $(document).find('#'+itemId);
                                //     var itemData = item[0]['__data__'];

                                //     if (destinationId === 'floorContainer'){
                                //         var divPos = {
                                //             // left: e.layerX/scale,
                                //             // top: e.layerY/scale
                                //             left: (e.pageX - $(containerTag).offset().left)/scale,
                                //             top: (e.pageY - $(containerTag).offset().top)/scale
                                //         };
                                //         $(this).append(item[0]);

                                //         itemData.x = divPos.left;
                                //         itemData.y = divPos.top;
                                //         scale = d3.event.scale = 1;
                                //         d3.event.translate = (0,0);
                                //         itemData.map = attrs.floorName;

                                //         $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: divPos.left, y_coord: divPos.top, map_name: attrs.floorName, lan_ip: itemData.lan_ip, lan_zone: itemData.lan_zone}});
                                //         plot(data, attrs.fluserScaleoorName); 
                                //         d3.select('.user-'+itemId).classed("selected", true);
                                //     } 
                                //     return false;
                                //     },
                                //     false
                                // );          


                            });                            
                    }  
     //This function determines the colour of the endpoint based on what type 
                    //of trigger has been activated
                    function getIconColour(endpoint, args, type) {
                        if(args != undefined) {
                            var colour = '#29ABE2';//the default
                            args.forEach(function(d){
                                if(d.lan_ip == endpoint.lan_ip && d.lan_zone == endpoint.lan_zone) {
                                    //change to switch when more buttons are added
                                    if (type === 'iocusers') {
                                        colour = '#FF0000'; //CHANGE
                                    } else if(type === 'activeusers') {
                                        colour = '#00FF00'; //CHANGE
                                    } else if(type === 'activestealthusers') {
                                        colour = '#666666'; //CHANGE
                                    } else {
                                        colour = '#29ABE2'; //the default
                                    }  
                                    return;                                                          
                                }                        
                            });

                            return colour;
                        } else {
                            return '#29ABE2';
                        }
                    }

                    //The following function handles a trigger button being pressed, iterating over the endpoint
                    //icons and changing the colour of the ones matching the trigger filter
                    function handleTrigger(data, type) {
                        d3.selectAll('button').each(function(d){
                            if(d != undefined) {
                                var id = d.id;
                                var elm = d3.select(this);
                                var elel = elm[0];
                                var el = elel[0];

                                var element = elm.select('div').select('svg');

                                element.selectAll('.userColor').style('fill', getIconColour(d, data, type));
                            }
                        });
                    }

                    /////////////////
                    ///  BUTTONS  ///
                    /////////////////


                    //////////////////////////
                    ///  $SCOPE FUNCTIONS  ///
                    //////////////////////////

                    $rootScope.removeLines = function () {
                        $scope.selectedUser = "";
                        $scope.floorConns = "";
                        endpointConn.selectAll('line').remove();
                    }

                    // -- draws connections between floors
                    $rootScope.drawFloorConns = function (color) {
                        // if (($scope.floorConns !== undefined) && ($scope.selectedUser !== undefined)) {
                        //     endpointConn.selectAll('line').remove();
                        //     var conns = endpointConn.selectAll(".endpointConns").data([""]);
                        //     wait(function(){
                        //         var count = 0;
                        //         var floor1 = $scope.floors.filter(function(fl){ 
                        //             if (($scope.selectedUser.map === fl.asset_name)){
                        //                 return true;
                        //             }
                        //         });
                        //         for (var c in $scope.floorConns) {
                        //             var floor2 = $scope.floors.filter(function(fl){ 
                        //                 if (($scope.floorConns[c].map === fl.asset_name)){
                        //                     return true;
                        //                 }
                        //             });
                        //             if (floor2[0] !== undefined) {
                        //                  conns.enter()
                        //                     .append("line")
                        //                     .attr("x1", floor1[0].x+(elementWidth/6))
                        //                     .attr("y1", floor1[0].y+30+count)
                        //                     .attr("x2", floor2[0].x+(elementWidth/6))
                        //                     .attr("y2", floor2[0].y+30+count)
                        //                     .attr('stroke-width', 1)
                        //                     .attr("stroke", color);
                        //                     count++;
                        //                 // if (count<9) {
                        //                 //     count++;
                        //                 // }
                        //             } else {
                        //                  conns.enter()
                        //                     .append("line")
                        //                     .attr("x1", floor1[0].x+(elementWidth/6))
                        //                     .attr("y1", floor1[0].y+30+count)
                        //                     .attr("x2", 0)
                        //                     .attr("y2", 0+count)
                        //                     .attr('stroke-width', 1)
                        //                     .attr("stroke", color);
                        //                     count++;
                        //             }                              
                        //         }
                        //     }, 400);
                        // }       
                    }

                    // -- redraws the floor (used when user is deleted from floorplan)
                    $rootScope.redrawFloor = function () {
                        var currentUser = d3.select('.selected');
                        currentUser
                            .attr("class", "localuserlist")
                            .attr('draggable', "true");
                        currentUser.data()[0].map = null;
                        currentUser.remove();
                        $(userDiv[0][0]).append(currentUser[0][0]);
                        plot(data,floorName);
                    }
                    // -- sets selected class for CSS (controller calls this when coming from ioc_events_drilldown(page2))
                    $scope.$on('setSelected', function (event, selected) { 
                        d3.select('.user-'+selected.id).classed("selected", true);
                    })

                    ////////////////
                    ///  SEARCH  ///
                    ////////////////
                    // -- display users after
                    // $scope.$on('searchUsers', function (event, filteredData){
                    //     plot(filteredData, floors);
                    //     wait(function(){
                    //         if (filteredData.length > 0) {
                    //             if (lastUserRequeried !== filteredData[0].id) {
                    //                 $scope.floors.filter(function(d){ if ((filteredData[0].map === d.asset_name)) { d.active = true; }});
                    //                 $scope.requery(filteredData[0], 'flooruser');
                    //                 lastUserRequeried = filteredData[0].id;
                    //             } 
                    //             d3.select('.user-'+filteredData[0].id).classed("selected", true);
                    //         } else {
                    //             // remove the info pane
                    //             lastUserRequeried = -1;
                    //             $scope.requery("clear", 'flooruser');   
                    //         }
                    //     }, 500, "filtertWait");
                    // })
                    plot(data, floors);

            }, 1000);
        }
    };
}]);

angular.module('mean.pages').directive('makeBuildingPlan', ['$timeout', '$rootScope', '$http', '$location', 'searchFilter', function ($timeout, $rootScope, $http, $location, searchFilter) {
    return {
        link: function ($scope, element, attrs) {
            //$scope.$on('floorPlan', function (event) {
                setTimeout(function () {

                    // watch global search for changes.. then filter
                    var searchFired = false;
                    $rootScope.$watch('search', function(){
                        if (searchFired === true) {
                            searchFilter($scope.searchDimension, $rootScope.search);
                            $scope.$broadcast('searchUsers',$scope.searchDimension.top(Infinity));
                        }
                        searchFired = true;
                    })

                    var lastUserRequeried = -1;
                    var wait = (function () { 
                        var timers = {};
                        return function (callback, ms, uniqueId) {
                            if (!uniqueId) {
                                uniqueId = "filterWait"; //Don't call this twice without a uniqueId
                            }
                            if (timers[uniqueId]) {
                                clearTimeout (timers[uniqueId]);
                            }
                            timers[uniqueId] = setTimeout(callback, ms);
                        };
                    })();
                    ///////////////////////////
                    ///  INITIAL VARIABLES  ///
                    ///////////////////////////
                    var buildings = $scope.buildings;
                    var imageRatio = 1.33333333333;
                    var data = $scope.data.users;
                    var scale = 1;

                    // var elementWidth = ($('#allfloorplanspan')[0].offsetWidth-25);
                    // var elementHeight = (($('#allfloorplanspan')[0].offsetWidth-25)/imageRatio);
                    var elementWidth = 959;
                    var elementHeight = (elementWidth/imageRatio);
                    element.width(elementWidth);
                    element.height(elementHeight);

                    ///////////////////////////
                    ///  DIV/ELEMENT SETUP  ///
                    ///////////////////////////
                    var userDivWrapper = d3.select("#localListWrapper").style('height', elementHeight+50+'px').style('overflow', 'auto');
                    var userDiv = d3.select("#listlocalusers").attr("width","100%");
                    var infoDiv = d3.select('#allbuildinginformation').append('table').style('overflow', 'auto');
                    var floorDiv = d3.select(element[0]);

                    var windowScale = $scope.standardWidth/element.outerWidth();

                    var hideListDiv = d3.select('#listlocalusersspan');
                    var expandDiv = d3.select('#buildingplanspan');
                    var buttonDiv = d3.select('#triggerbuttons');
                    var scaleButtonDiv = $('#scalebuttons');

                    var margin = {top: -5, right: -5, bottom: -5, left: -5};

                    var zoom = d3.behavior.zoom()
                        .scaleExtent([0.1, 5])
                        //.translate([0,0])
                        .translate([0,0])
                        .scale(scale)
                        .on("zoom", zoomed);

                    var drag = d3.behavior.drag()
                        .origin(function(d) { return d; })
                        .on("dragstart", dragstarted)
                        .on("drag", dragged)
                        .on("dragend", dragended);

                    var svg = floorDiv.append("svg")             
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
                            .call(zoom);

                    var container = svg.append("g")
                        .attr("class", "bin")
                        .attr("drop", "handleDrop")
                        .attr("id", "floorContainer")
                        .style("pointer-events", "all")
                        .attr("transform", "translate(0,0)scale("+scale+")");

                    svg.on("dblclick.zoom", null);

                    container.append("svg")  
                        .attr("class", "floorimage")
                        .append("image")
                        .attr("id", "svgFloorPlan")
                        .attr("class", "svgFloor")
                        .attr("height", elementHeight)                    
                        .attr("width", elementWidth)
                        .attr("xlink:href", " ")
                        .attr("type", "image/svg+xml");     

                    var endpointConn = container.append("svg")
                    .attr("class", "endpointConn");

                    // -- to hide <input> when changing custom username
                    container.on('click', function(e){
                        if(d3.event.toElement.id == d3.select('.svgFloor')[0][0].id){
                            $scope.requery("clear"); 
                        }
                    })

                     // -- hide/show userlist                    
                    var hideDiv = $('.hidelocalusers')
                        .on("click", function () {
                            if (hideListDiv.attr("class") === "floorHide") {
                                expandDiv.style('width','60%');
                                floorDiv.style('width',elementWidth+"px");
                                floorDiv.style('height',elementHeight+"px");
                                hideDiv.html("&#9668; &#9668; &#9668;");
                                setTimeout(function () {
                                    hideListDiv.classed('floorHide', false);
                                }, 0);
                            }else{
                                floorDiv.style('width',elementWidth*1.25+"px");
                                floorDiv.style('height',elementHeight*1.25+"px");
                                expandDiv.style('width','75%'); 
                                hideDiv.html("&#9658; &#9658; &#9658;");
                                setTimeout(function () {
                                    hideListDiv.classed('floorHide', true);
                                }, 0);
                            }
                        })
                        .attr("style","padding-top:"+ (elementHeight/2)+'px')
                        .html("&#9668; &#9668; &#9668;");

                    ///////////////////
                    ///  FUNCTIONS  ///
                    ///////////////////
                    // -- zoom and movement behaviours of the floor
                    function zoomed() {
                        // if (d3.event.scale > 3) {
                        //     zoom.translate([0,0]).scale(1);
                        //     container.attr("transform", "translate(0,0)scale(1)");
                        //     $rootScope.toggleZoom = true;
                        //     $scope.$apply();
                        // } else {
                            scale = d3.event.scale;
                            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                        // }
                    }
                    // -- handles the beginging of a user being dragged
                    function dragstarted(d) {
                        d3.event.sourceEvent.stopPropagation();
                        d3.select(this).classed("dragging", true);
                        container.selectAll('g').each(function(){
                            d3.select(this).classed("selected", false);
                        })
                        d3.select(this).classed("selected", true);
                    }
                    // -- handles during a user is dragged
                    function dragged(d) {
                        d.x = d3.event.x;
                        d.y = d3.event.y;
                        d3.select(this).attr("transform", "translate("+d.x + "," + d.y +")");
                    }
                    // -- handles the end of when a user is dragged
                    function dragended(d) {
                        $http({method: 'POST', url: '/local_events/endpoint_map?type=editFloorPos', data: {x: d.x, y: d.y, map_name: d.asset_name}});
                        d3.select(this).classed("dragging", false);
                        $scope.drawFloorConns("#23FF1C");
                    }
                    // -- updates username
                    function doneEditing(elm, item, value) {
                        $scope.change_customuser(item, value);
                        $(elm[0]).find('.usernametext').html(value);
                    }

                    // -- displays users in userlist and floor plans
                    function plot(data, bldgs) {
                        // set order of array
                        data = data.sort(function(a, b){ return a.id-b.id });
                        ////////////////////
                        ///  LIST USERS  ///
                        ////////////////////
                        // MAKE LIST ELEMENTS
                        var count = -1;
                        var nodeHeight = 32;
                        userDiv.selectAll('g').remove();
                        userDiv.selectAll('g').data(data.filter(function(d){if (d.map == null){ return true; }})).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("id", function(d){
                                return d.id;
                            })
                            .append('svg:foreignObject')
                                .style("padding-top", function(d){
                                    count++;
                                    return count*nodeHeight+"px";
                                })
                                .attr("height", (count+1)*nodeHeight+"px")
                                // /.attr('height', "30px")
                                .attr('width', "100%")
                                .attr("class", function(d){
                                    return 'userTrans-'+d.id;
                                })
                            .append('xhtml:button').each(function(d){
                                var iconColour = '#29ABE2'; 
                                var name = d.lan_machine;
                                if (d.custom_user != null){
                                    name = d.custom_user;
                                }
                                if (name === ""){
                                    name = d.lan_ip;
                                }
                                if (name === ""){
                                    name = d.lan_mac;
                                }
                                //if ((d.x === 0) && (d.y === 0)) {
                                    var id = d.id;
                                    var elm = d3.select(this);
                                    var elel = elm[0];
                                    elm
                                        // append id to li from data object
                                        .attr('id', id)
                                        .classed('user-'+id, true)
                                        .classed('localuserlist', true)
                                        .on('dblclick', function(e){
                                            $('.usernametext').each(function(e){
                                                this.classList.remove('ng-hide');
                                            });
                                            $('.usernameform').each(function(e){
                                                this.classList.add('ng-hide');
                                            });

                                            var iconText = $(this).find('.usernametext')[0];
                                            var iconInput = $(this).find('.usernameform')[0];
                                            iconText.classList.add('ng-hide');
                                            iconInput.classList.remove('ng-hide');
                                        })
                                        .on('click', function(e){
                                            userDiv.selectAll('button').each(function(d){
                                                var elm = d3.select(this);
                                                $(elm[0]).removeClass('selected');
                                            })
                                            floorDiv.selectAll('button').each(function(d){
                                                var elm = d3.select(this);
                                                $(elm[0]).removeClass('selected');
                                            })
                                            el.classList.add('selected');
                                            lastUserRequeried = d.id;
                                        });
                                    var element = elm
                                            .append('div')
                                                .attr('class', 'localuserlisticon')
                                                .append('svg');
                                     element
                                            .attr('height', '25')
                                            .attr('width', '43')
                                        switch (d.lan_type){
                                            case 'endpoint':
                                                 element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            case 'server':
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '15,18 14,18 14,19 11,19 11,22 18,22 18,19 15,19') 
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 19)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('rect')
                                                    .attr("class", "userColor")
                                                    .attr('x', 5)
                                                    .attr('y', 20)
                                                    .attr('width', 5)
                                                    .attr('height', 1)
                                                    .style('fill', iconColour);
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,13H5v4h19V13z M8,16H6v-2h2V16z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,7H5v4h19V7z M8,10H6V8h2V10z');
                                                element.append('path')
                                                    .attr("class", "userColor")
                                                    .style('fill', iconColour)
                                                    .attr("class", "serverBox")
                                                    .attr('d', 'M24,1H5v4h19V1z M8,4H6V2h2V4z');
                                                break;
                                            case 'mobile':
                                                element.append('svg:path')
                                                    .attr("class", "userColor")
                                                    .attr('d', 'M8,1v22h14V1H8z M15,22.3c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5C16.5,21.6,15.8,22.3,15,22.3z M20,18H10V3h10V18z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                            default:
                                                element.append('svg:polygon')
                                                    .attr("class", "userColor")
                                                    .attr('points', '2,0.9 28,0.9 28,17.9 19.3,17.9 20.8,22.9 9.6,22.9 10.9,17.9 2,17.9')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', iconColour);
                                                break;
                                    } 

                                    if (d.stealth === 1) {
                                        element.append('g').append('svg:path')
                                            .attr('transform', 'translate(26,0)')
                                            .attr('d', 'M14.1,1.9C11.2,2,9.6,0,9.6,0c0,0-1.3,1.9-4.5,1.9c0,3.2,0.6,5.4,2,7.4C7.2,9.5,8,11,9.6,11c1.7,0,2.4-1.5,2.6-1.8C13.8,7,14.1,4.4,14.1,1.9z')
                                            .style('fill', "#000000");
                                    }           
                                    var machIcon = element.append('g').attr('transform', 'translate(26,12)'); 

                                    switch (d.machine_icon){                              
                                            case 'win':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M6,0.6c1-0.4,3.1-1.2,5,0.4c-0.3,0.8-0.9,3.4-1.3,4.5c-1.6-1.2-3.8-0.9-5-0.3C5,4.2,6,0.6,6,0.6z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#D66C27');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M4.5,5.9c1-0.4,3.1-1.2,5,0.4C9.3,7,8.6,9.6,8.2,10.7c-1.6-1.2-3.8-0.9-5-0.2C3.5,9.4,4.5,5.9,4.5,5.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#0390C8');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M15.3,6.3c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.2C16.3,2.7,15.3,6.3,15.3,6.3z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#87B340');                                             
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.9,11.4c-1,0.4-3.1,1.2-5-0.4c0.3-0.8,0.9-3.4,1.3-4.5c1.6,1.2,3.8,0.9,5,0.3C14.9,7.9,13.9,11.4,13.9,11.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FCCE32');
                                                break;
                                            case 'os':                                              
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.7,1.9c0.4-0.5,0.7-1.2,0.6-1.9c-0.7,0-1.4,0.5-1.9,1C10,1.5,9.7,2.2,9.8,2.9C10.5,2.9,11.3,2.5,11.7,1.9z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M13.7,5.4c0.2-0.6,0.6-1.1,1.2-1.4c-0.6-0.8-1.5-1.2-2.4-1.2c-1.1,0-1.6,0.5-2.3,0.5c-0.8,0-1.4-0.5-2.4-0.5c-0.9,0-1.9,0.6-2.6,1.5C5,4.7,4.9,5.1,4.8,5.6C4.6,7,4.9,8.8,6,10.4C6.5,11.1,7.2,12,8.1,12c0.8,0,1-0.5,2.1-0.5c1.1,0,1.3,0.5,2.1,0.5c0.9,0,1.6-1,2.2-1.7c0.4-0.6,0.5-0.8,0.8-1.5C13.8,8.3,13.2,6.7,13.7,5.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break;
                                            case 'win':
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.4,0c0.5,0,1.3,0.4,1.4,1c0.1,0.3,0,0.7,0,1.1c0,0.4,0,0.8,0,1.2c0.1,0.7,0.6,1.1,0.9,1.7c0.2,0.3,0.3,0.6,0.4,0.9c0.1,0.4,0.2,0.7,0.2,1.1c0.1,0.4,0.1,0.7,0.1,1.1c0,0.2,0,0.3,0,0.5c0,0.2-0.1,0.3-0.1,0.5c0,0.2,0,0.3,0.2,0.3c0.2,0,0.3,0,0.5,0c0.3,0,0.7,0.2,0.6,0.5c-0.4,0.5-0.8,1.2-1.3,1.6c-0.2,0.2-0.4,0.5-0.7,0.5c-0.3,0.1-0.7,0.1-0.9-0.1c-0.1-0.1-0.2-0.2-0.2-0.3c0-0.1-0.1-0.1-0.1-0.2c0-0.1,0-0.1-0.1-0.1c-0.4,0-0.8,0-1.2,0c-0.4,0-0.7-0.1-1.1-0.2c-0.1-0.1-0.3-0.1-0.4-0.2c-0.1-0.1-0.2,0.3-0.3,0.3c-0.1,0.2-0.3,0.5-0.6,0.5c-0.1,0-0.3,0-0.4,0c-0.2-0.1-0.3-0.2-0.5-0.3c-0.3-0.2-0.6-0.4-0.9-0.6c-0.3-0.2-0.7-0.5-0.7-0.8c0.1-0.3,0.2-0.4,0.5-0.4c0.1,0,0.3,0,0.3-0.1c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.3c0.1-0.3,0.5-0.1,0.7,0c0.1-0.1,0.2-0.2,0.2-0.3C7,8.4,7.1,8.4,7.1,8.2C6.9,6.7,7.8,5.3,8.5,4c0.1-0.2,0.2-0.4,0.3-0.6c0.1-0.1,0.1-0.4,0.1-0.6c0-0.5,0-1,0-1.4c0-0.4,0.1-0.7,0.4-1C9.6,0.2,10,0,10.4,0z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#231F20');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11,3.4c0.1,0.2,0.1,0.5,0.2,0.7c0.1,0.2,0.2,0.4,0.3,0.7c0.2,0.5,0.5,0.9,0.6,1.4c0.2,0.5,0.3,0.9,0.2,1.4c-0.1,0.2-0.1,0.5-0.2,0.7c0,0.1-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.2-0.1,0.4c-0.2,0-0.3-0.2-0.5-0.1c-0.2,0-0.2,0.4-0.2,0.5c0,0.3,0,0.5,0,0.8c0,0.1,0,0.1,0,0.2c-0.1,0-0.1,0.1-0.2,0.1c-0.1,0-0.2,0.1-0.3,0.1c-0.5,0.1-1,0.1-1.5,0c-0.1,0-0.2-0.1-0.3-0.1c-0.2-0.1-0.2-0.1-0.2-0.2c0-0.2-0.2-0.6-0.3-0.8c-0.2-0.5-0.4-1-0.6-1.6c0-0.1-0.1-0.2-0.1-0.3c0-0.1,0-0.2,0-0.3c0.1-0.3,0.2-0.5,0.3-0.8C8,6,8.2,5.8,8.3,5.6c0.1-0.2,0.1-0.5,0.2-0.7c0.1-0.2,0.2-0.4,0.3-0.7C9,4,9.1,3.7,9.2,3.5c0.3,0.3,0.5,0.3,0.9,0.3c0.2,0,0.3-0.1,0.5-0.1C10.6,3.6,10.9,3.4,11,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2C8.9,1.2,8.9,1.2,8.9,1.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,1.8C8.9,1.8,8.9,1.7,8.9,1.8C8.9,1.7,8.9,1.8,8.9,1.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4C8.9,3.4,8.9,3.4,8.9,3.4z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#C5C7C9');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M7.3,8.5c0.1,0.1,0.2,0.3,0.3,0.4c0.1,0.2,0.2,0.5,0.2,0.7C7.9,9.9,8,10.4,8,10.8c0,0.4-0.3,0.6-0.6,0.6c-0.2,0-0.4-0.1-0.6-0.2c-0.2-0.1-0.4-0.2-0.6-0.4c-0.3-0.2-0.8-0.5-0.9-0.9C5.2,9.8,5.4,9.6,5.6,9.6c0.2,0,0.3,0,0.4-0.2c0.1-0.1,0-0.3,0-0.4c0.1-0.2,0.3-0.1,0.5,0c0.1,0,0.1,0.1,0.2,0c0.1-0.1,0.1-0.2,0.2-0.3C7,8.6,7.3,8.3,7.3,8.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M11.8,8.8c0.1,0,0.1,0.1,0.2,0.1c0,0.1,0,0.2,0,0.3c0,0.2,0.3,0.3,0.5,0.4C12.9,9.7,13,9.3,13.2,9c0.1,0,0.1,0.3,0.1,0.4c0.1,0.2,0.3,0.1,0.4,0.1c0.3-0.1,0.9,0,0.7,0.5c-0.2,0.3-0.5,0.6-0.7,0.9c-0.1,0.1-0.2,0.3-0.4,0.4c-0.1,0.1-0.3,0.2-0.4,0.3c-0.3,0.2-0.6,0.4-1,0.3c-0.5-0.1-0.5-0.6-0.6-1c-0.1-0.4-0.1-0.9-0.1-1.3c0-0.2,0-0.4,0.1-0.6C11.4,8.8,11.6,8.7,11.8,8.8z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '10.9')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:ellipse')
                                                    .attr('cx', '9.3')
                                                    .attr('cy', '2.1')
                                                    .attr('rx', '0.4')
                                                    .attr('ry', '0.6')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#FFFFFF');
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M10.1,2.5c0.2,0,0.3,0.2,0.4,0.2c0.2,0.1,0.4,0,0.4,0.2c0.1,0.2-0.1,0.3-0.3,0.4c-0.2,0.1-0.3,0.2-0.6,0.2s-0.4,0-0.6-0.1C9.4,3.3,9.3,3.2,9.3,3c0-0.2,0.2-0.2,0.4-0.3C9.7,2.7,9.9,2.4,10.1,2.5z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#F5C055');
                                                break;
                                            default:                                               
                                                machIcon.append('svg:path')
                                                    .attr('d', 'M9,8.1l0-0.4C8.9,6.9,9.2,6.1,9.9,5.2c0.7-0.8,1-1.4,1-2.1c0-0.8-0.5-1.3-1.4-1.3C9,1.8,8.4,2,8,2.3L7.7,1.3C8.2,1,9,0.7,9.8,0.7c1.7,0,2.5,1.1,2.5,2.2c0,1-0.6,1.8-1.3,2.6c-0.7,0.8-0.9,1.4-0.9,2.2l0,0.4H9z M8.7,10.2c0-0.6,0.4-0.9,0.9-0.9c0.5,0,0.9,0.4,0.9,0.9c0,0.5-0.3,0.9-0.9,0.9C9.1,11.2,8.7,10.8,8.7,10.2z')
                                                    .style('fill-rule', '#evenodd')
                                                    .style('clip-rule', '#evenodd')
                                                    .style('fill', '#818385');
                                                break; 
                                    } 
                                    
                                    var elm2 = elm.append('div')
                                        .attr('class', 'localuserlisttext');
                                    elm2.append('span')
                                        .attr('class', 'usernametext')
                                        .html(name+"")
                                    elm2.append('form')
                                        .attr('class', 'ng-hide usernameform')
                                        .append('input')
                                            .html(name)
                                            .attr('type', 'text')
                                            .attr('value', name+"")
                                            .on('blur', function(e){
                                                doneEditing(elm, e, this.value)
                                            })
                                            //.html(name+"");
        
                                    var el = elel[0];

                                     var elm2 = $(this);
                                    // console.log(el)
                                     //console.log(elm2[0])


                                    el.draggable = true;
                                    el.addEventListener(
                                        'dragstart',
                                        function(e) {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('Text', this.id);
                                            this.classList.add('drag');
                                            return false;
                                        },
                                        false
                                    );

                                    el.addEventListener(
                                        'dragend',
                                        function(e) {
                                            $scope.requery(d, 'flooruser');
                                            lastUserRequeried = d.id;
                                            this.classList.remove('drag');
                                            return false;
                                        },
                                        false
                                    );
                               // }
                            });
                        userDiv.style('height', (count+1)*nodeHeight+'px');

                        // Draw users on floor
                        var floorcount = -1;
                        // container.selectAll('g').remove();
                        container.selectAll('g').data(bldgs.filter(function(d){return true; })).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("transform", function(d){ 
                                return "translate("+d.x+","+d.y+")"
                            })
                            .call(drag)
                            .append('svg:foreignObject')
                                .attr('width', (elementWidth/3)+"px")
                                .attr('height', (elementHeight/3)+"px")
                            .append('xhtml:div').each(function(d){    
                                var userCount = 0;               
                                
                                var elm = d3.select(this);

                                for (var f in d.floors) {                                   
                                    data.filter(function(user){
                                        if (d.floors[f].id == user.map) {
                                            userCount++;
                                        }
                                    });
                                }

                                elm
                                    .style("border", "solid 1px #000")
                                    .style("background", "#fff")
                                    .style("border-radius", "8px")
                                    .style("text-align", "center")
                                    .html("<h4>"+d.custom_name + "</h4><strong>" + userCount + " Hosts </strong>")
                                    .on('dblclick', function(e){
                                        for (var bld in $scope.buildings) {
                                             $scope.buildings[bld].active = false;
                                        }
                                        d.active = true;
                                        d.floors[0].active = true;

                                        $rootScope.toggleZoom = true;
                                        $scope.$apply();
                                    })
                                    .on('click', function(e){
                                        $scope.requery(d, 'listusers'); 
                                        // $scope.removeLines();
                                    })
                                    .on('mouseover', function(e){
                                        d3.select(this).style("cursor","pointer")
                                    });  

                                var elel = elm[0];
                                var el = elel[0];

                                /////////////////////////////
                                ///  DROPPABLE BEHAVIOUR  ///
                                /////////////////////////////
                                // -- used for when a user is being dragged from userlist to floor
                                // var containerTag = container[0][0];
                                // containerTag.droppable = true;
                                // containerTag.addEventListener(
                                //     'dragover',
                                //     function(e) {
                                //         e.dataTransfer.dropEffect = 'move';
                                //         // allows us to drop
                                //         if (e.preventDefault) e.preventDefault();
                                //         $(this).addClass('over');
                                //         return false;
                                //     },
                                //     false
                                // );
                                // containerTag.addEventListener(
                                //     'dragenter',
                                //     function(e) {
                                //         $(this).addClass('over');
                                //         return false;
                                //     },
                                //     false
                                // );
                                // containerTag.addEventListener(
                                //     'dragleave',
                                //     function(e) {
                                //         $(this).removeClass('over');
                                //         return false;
                                //     },
                                //     false
                                // );
                                // // -- handles when a user is dropped from userlist to floorplan
                                // containerTag.addEventListener('drop', function(e) {
                                //     var floorName = d3.select(containerTag).attr('floor-name');
                                //     // Stops some browsers from redirecting.
                                //     if (e.stopPropagation) e.stopPropagation();

                                //     // call the drop passed drop function
                                //     var destinationId = $(this).attr('id');
                                //     var itemId = e.dataTransfer.getData("Text");
                                //     var item = $(document).find('#'+itemId);
                                //     var itemData = item[0]['__data__'];

                                //     if (destinationId === 'floorContainer'){
                                //         var divPos = {
                                //             // left: e.layerX/scale,
                                //             // top: e.layerY/scale
                                //             left: (e.pageX - $(containerTag).offset().left)/scale,
                                //             top: (e.pageY - $(containerTag).offset().top)/scale
                                //         };
                                //         $(this).append(item[0]);

                                //         itemData.x = divPos.left;
                                //         itemData.y = divPos.top;
                                //         scale = d3.event.scale = 1;
                                //         d3.event.translate = (0,0);
                                //         itemData.map = attrs.floorName;

                                //         $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: divPos.left, y_coord: divPos.top, map_name: attrs.floorName, lan_ip: itemData.lan_ip, lan_zone: itemData.lan_zone}});
                                //         plot(data, attrs.fluserScaleoorName); 
                                //         d3.select('.user-'+itemId).classed("selected", true);
                                //     } 
                                //     return false;
                                //     },
                                //     false
                                // );          


                            });                            
                    }  

                    //////////////////////////
                    ///  $SCOPE FUNCTIONS  ///
                    //////////////////////////

                    $rootScope.removeLines = function () {
                        $scope.selectedUser = "";
                        $scope.floorConns = "";
                        endpointConn.selectAll('line').remove();
                    }

                    // -- draws connections between floors
                    $rootScope.drawFloorConns = function (color) {
                        // if (($scope.floorConns !== undefined) && ($scope.selectedUser !== undefined)) {
                        //     endpointConn.selectAll('line').remove();
                        //     var conns = endpointConn.selectAll(".endpointConns").data([""]);
                        //     wait(function(){
                        //         var count = 0;
                        //         var floor1 = $scope.floors.filter(function(fl){ 
                        //             if (($scope.selectedUser.map === fl.asset_name)){
                        //                 return true;
                        //             }
                        //         });
                        //         for (var c in $scope.floorConns) {
                        //             var floor2 = $scope.floors.filter(function(fl){ 
                        //                 if (($scope.floorConns[c].map === fl.asset_name)){
                        //                     return true;
                        //                 }
                        //             });
                        //             if (floor2[0] !== undefined) {
                        //                  conns.enter()
                        //                     .append("line")
                        //                     .attr("x1", floor1[0].x+(elementWidth/6))
                        //                     .attr("y1", floor1[0].y+30+count)
                        //                     .attr("x2", floor2[0].x+(elementWidth/6))
                        //                     .attr("y2", floor2[0].y+30+count)
                        //                     .attr('stroke-width', 1)
                        //                     .attr("stroke", color);
                        //                     count++;
                        //                 // if (count<9) {
                        //                 //     count++;
                        //                 // }
                        //             } else {
                        //                  conns.enter()
                        //                     .append("line")
                        //                     .attr("x1", floor1[0].x+(elementWidth/6))
                        //                     .attr("y1", floor1[0].y+30+count)
                        //                     .attr("x2", 0)
                        //                     .attr("y2", 0+count)
                        //                     .attr('stroke-width', 1)
                        //                     .attr("stroke", color);
                        //                     count++;
                        //             }                              
                        //         }
                        //     }, 400);
                        // }       
                    }

                    ////////////////
                    ///  SEARCH  ///
                    ////////////////
                    // // -- display users after
                    // $scope.$on('searchUsers', function (event, filteredData){
                    //     plot(filteredData, floors);
                    //     wait(function(){
                    //         if (filteredData.length > 0) {
                    //             if (lastUserRequeried !== filteredData[0].id) {
                    //                 $scope.floors.filter(function(d){ if ((filteredData[0].map === d.asset_name)) { d.active = true; }});
                    //                 $scope.requery(filteredData[0], 'flooruser');
                    //                 lastUserRequeried = filteredData[0].id;
                    //             } 
                    //             d3.select('.user-'+filteredData[0].id).classed("selected", true);
                    //         } else {
                    //             // remove the info pane
                    //             lastUserRequeried = -1;
                    //             $scope.requery("clear", 'flooruser');   
                    //         }
                    //     }, 500, "filtertWait");
                    // })
                    plot(data, buildings);

            }, 1000);
        }
    };
}]);

 
