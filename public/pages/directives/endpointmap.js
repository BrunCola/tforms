'use strict';

angular.module('mean.pages').directive('makeFloorPlan', ['$timeout', '$rootScope', '$http', '$location', 'searchFilter', function ($timeout, $rootScope, $http, $location, searchFilter) {
    return {
        link: function ($scope, element, attrs) {
            //$scope.$on('floorPlan', function (event) {
                setTimeout(function () {

                    // watch global search for changes.. then filter
                    $scope.$watch('search', function(){
                        if ($scope.searchFired === true) {
                            //console.log($scope.searchDimension.top(Infinity))
                            searchFilter($scope.searchDimension, $rootScope.search);
                            $scope.$broadcast('searchUsers',$scope.searchDimension.top(Infinity));
                        }
                        $scope.searchFired = true;
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
                    var bdname = $scope.floor.building;
                    var scale = $scope.floor.scale;
                    var imageRatio = $scope.floor.image_width/$scope.floor.image_height;
                    var data = $scope.data.users;
                    var floorName = attrs.floorName;
                    var userScale = 1;
                    var lineCount = 0;
                    if (($scope.floor.user_scale !== undefined) && ($scope.floor.user_scale !== null) && (angular.isNumber($scope.floor.user_scale))) {
                        userScale = $scope.floor.user_scale;
                    } 


                    if (($('#floorplanspan')[0].offsetWidth-25) != -25) {
                        //console.log("test")
                        $scope.elementWidth = ($('#floorplanspan')[0].offsetWidth-25)
                    }
                    //console.log($scope.elementWidth)
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
                    var buttonDiv = d3.select('#triggerbuttons'+bdname);
                    var scaleButtonDiv = $('#scalebuttons'+bdname);

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
                    .attr("class", "endpointConn")
                    .attr("connName", floorName);

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
                            .on("click", function(d){
                                $scope.requery(d, 'flooruser');
                            })
                            .append('svg:foreignObject')
                                .style("padding-top", function(d){
                                    count++;
                                    return count*nodeHeight+"px";
                                })
                                .attr("height", (count+1)*nodeHeight+10+"px")
                                // /.attr('height', "30px")
                                .attr('width', "100%")
                                .attr("class", function(d){
                                    return 'userTrans-'+d.id;
                                })
                            .append('xhtml:button').each(function(d){
                                var iconColour = '#29ABE2'; 
                                var name = d.lan_machine;
                                if (d.custom_user !== null){
                                    name = d.custom_user;
                                }
                                if ((name === "") && (name === null)){
                                    name = d.lan_ip;
                                }
                                if ((name === "") && (name === null)){
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
                        container.selectAll('g').data(data.filter(function(d){if (d.map === floor){ return true; }})).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("id", function(d){
                                return d.id;
                            })
                            .on("click", function(d){
                                $scope.requery(d, 'flooruser');
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
                                    if (d.custom_user !== null){
                                        name = d.custom_user;
                                    }
                                    if ((name === "") && (name === null)){
                                        name = d.lan_ip;
                                    }
                                    if ((name === "") && (name === null)){
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

                                            // draw line links   
                                            var conns = endpointConn.selectAll(".endpointConns").data([""]);
                                            $scope.getConnections(d,conns); 
                                            endpointConn.selectAll('line').remove();     
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

                                    el.draggable = true;

                                    el.addEventListener(
                                        'dragstart',
                                        function(e) {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('Text', this.id);
                                            //this.classList.add('drag');
                                            return false;
                                        },
                                        false
                                    );

                                    el.addEventListener(
                                        'dragend',
                                        function(e) {
                                            //this.classList.remove('drag');
                                            $scope.requery(d, 'flooruser');
                                            lastUserRequeried = d.id;
                                            return false;
                                        },
                                        false
                                    );
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
                        .attr('class', 'epbuttons pure-button')
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


                    // wait(function(){
                    //     lineCount = 0;
                    //     drawConnections(elm[0][0], $scope.selectedUser, $scope.connectionIn, "#34D4FF");
                    //     drawConnections(elm[0][0], $scope.selectedUser, $scope.connectionOut, "#009426");
                    //     drawConnections(elm[0][0], $scope.selectedUser, $scope.connStealthIn, "#C40600");
                    //     drawConnections(elm[0][0], $scope.selectedUser, $scope.connStealthOut, "#EE00FF");                                                 
                    // }, 400);  


                    // -- draws connections between hosts
                    $rootScope.drawConnections = function (user, connections, color, conns) {
                        // var conns = d3.select(".endpointConns");
                       //wait(function(){
                            //var conns = endpointConn.selectAll(".endpointConns").data([""]);
                            for (var c in connections) {
                                    //console.log(connections[c])      
                                /*if ( connections[c].map === user.map ) {                                         
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
                                }  */      
                                if ( connections[c].map === user.map ) {                                   
                                    conns.enter()
                                        .append("line")
                                        .attr("x1", user.x+30)
                                        .attr("y1", user.y+lineCount+20)
                                        .attr("x2", connections[c].x+30)
                                        .attr("y2", connections[c].y+lineCount+20)
                                        .attr('stroke-width', 2)
                                        .attr("stroke", color);
                                } else {
                                    conns.enter()
                                        .append("line")
                                        .attr("x1", user.x+30)
                                        .attr("y1", user.y+lineCount+20)
                                        .attr("x2", 0)
                                        .attr("y2", 0+lineCount)
                                        .attr('stroke-width', 2)
                                        .attr("stroke", color);
                                }                 
                            }  
                        lineCount +=4;
                       //}, 400);
                    }

                    $rootScope.resetLineCount = function () {
                        lineCount = 0;
                    }


                    // $rootScope.removeLines = function () {
                    //     endpointConn.selectAll('line').remove();
                    // }

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
                    $rootScope.setSelected = function (selected) {
                        d3.select('.user-'+selected.id).classed("selected", true);
                    }

                    ////////////////
                    ///  SEARCH  ///
                    ////////////////
                    // -- display users after
                    $scope.$on('searchUsers', function (event, filteredData){
                        //if ($scope.floor.active) {
                        // console.log(floorName)
                        plot(filteredData, floorName);
                        wait(function(){
                            if (filteredData.length > 0) {
                                //if (lastUserRequeried !== filteredData[0].id) {

                                    // $scope.buildings.filter(function(d){ 
                                    //     if (d.active = true) {
                                    //         console.log(filteredData[0])
                                    //         console.log(d)
                                    //         // if ((filteredData[0].map === d.asset_name)) { 
                                    //         //     d.active = true; 
                                    //         // }}); // doesnt switch floors
                                    //     }
                                    // });

                                    $scope.requery(filteredData, 'listsearch');
                                    //lastUserRequeried = filteredData[0].id;
                                //} 
                                d3.select('.user-'+filteredData[0].id).classed("selected", true);
                            } else {
                                // remove the info pane
                                lastUserRequeried = -1;
                                $scope.requery("clear", 'flooruser');   
                            }
                        }, 0, "filtertWait");  
                        //}          
                    })
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
                    // var searchFired = false;
                    // $rootScope.$watch('search', function(){
                    //     if (searchFired === true) {
                    //         searchFilter($scope.searchDimension, $rootScope.search);
                    //         $scope.$broadcast('searchUsers',$scope.searchDimension.top(Infinity));
                    //     }
                    //     searchFired = true;
                    // })

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
                    var lineCount = 0;

                    if (($('#floorplanspan')[0].offsetWidth-25) != -25) {
                        //console.log("test")
                        $scope.elementWidth = ($('#floorplanspan')[0].offsetWidth-25)
                    }
                    //console.log($scope.elementWidth)
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
                    var infoDiv = d3.select('#localuserinformation').append('table').style('overflow', 'auto');
                    var floorDiv = d3.select(element[0]);

                    var windowScale = $scope.standardWidth/element.outerWidth();

                    var hideListDiv = d3.select('#listlocalusersspan');
                    var expandDiv = d3.select('#allfloorplanspan');
                    var buttonDiv = d3.select('#triggerbuttons');
                    var scaleButtonDiv = $('#scalebuttons');

                    var margin = {top: -5, right: -5, bottom: -5, left: -5};

                    var zoom = d3.behavior.zoom()
                        .scaleExtent([0.3, 5])
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

                    d3.select("#floorplanspan").append("svg")
                    .attr("class", "endpointConns");
                    // .attr("width", elementWidth)
                    // .attr("height", elementHeight);

                    // var endpointConn = container.append("svg")
                    //     .attr("class", "endpointConns");



                    // -- to hide <input> when changing custom username
                    container.on('click', function(e){
                        if(d3.event.toElement.id == d3.select('.svgFloor')[0][0].id){
                            $scope.requery("clear");  
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
                                setTimeout(function () {rapidPHIRE
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
                    containerTag.droppable = true;
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
                            $(this).removeClass('over');floors
                            return false;
                        },
                        false
                    );
                    // -- handles when a user is dropped from userlist to floorplan
                    containerTag.addEventListener('drop', function(e) {
                        var floorName = d3.select(containerTag);
                        // Stops some browsers from redirecting.
                        if (e.stopPropagation) e.stopPropagation();

                        // call the drop passed drop function
                        var destinationId = $(this).attr('id');
                        var itemId = e.dataTransfer.getData("Text");
                        var item = $(document).find('#'+itemId);
                        var itemData = item[0]['__data__'];

                        console.log(floorName)
                        console.log(floorName[0][0])
                        console.log(destinationId)
                        console.log(itemId)
                        console.log(item)
                        console.log(itemData)

                        // if (destinationId === 'floorContainer'){
                        //     var divPos = {
                        //         // left: e.layerX/scale,
                        //         // top: e.layerY/scale
                        //         left: (e.pageX - $(containerTag).offset().left)/scale,
                        //         top: (e.pageY - $(containerTag).offset().top)/scale
                        //     };
                        //     $(this).append(item[0]);

                        //     itemData.x = divPos.left;
                        //     itemData.y = divPos.top;
                        //     scale = d3.event.scale = 1;
                        //     d3.event.translate = (0,0);
                        //     itemData.map = attrs.floorName;

                        //     // $http({method: 'POST', url: '/actions/add_user_to_map', data: {x_coord: divPos.left, y_coord: divPos.top, map_name: attrs.floorName, lan_ip: itemData.lan_ip, lan_zone: itemData.lan_zone}});
                        //     plot(data, attrs.fluserScaleoorName); 
                        //     // d3.select('.user-'+itemId).classed("selected", true);
                        // } 
                        return false;
                        },
                        false
                    );          



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
                            .on("click", function(d){
                                $scope.requery(d, 'flooruser');
                            })
                            .append('svg:foreignObject')
                                .style("padding-top", function(d){
                                    count++;
                                    return count*nodeHeight+"px";
                                })
                                .attr("height", (count+1)*nodeHeight+10+"px")
                                // /.attr('height', "30px")
                                .attr('width', "100%")
                                .attr("class", function(d){
                                    return 'userTrans-'+d.id;
                                })
                            .append('xhtml:button').each(function(d){
                                var iconColour = '#29ABE2'; 
                                var name = d.lan_machine;
                                if (d.custom_user !== null){
                                    name = d.custom_user;
                                }
                                if ((name === "") || (name === null)){
                                    name = d.lan_ip;
                                }
                                if ((name === "") || (name === null)){
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
                            .attr("class", function(d){ 
                                return d.id;
                            })
                            .call(drag)
                            .append('svg:foreignObject')
                                .attr('width', "170px")
                                .attr('height', "200px")
                            .append('xhtml:div').each(function(d){    
                                var userCount = 0;               
                                
                                var elm = d3.select(this);

                                data.filter(function(user){
                                    if (d.id == user.map) {
                                        userCount++;
                                    }
                                });

                                elm
                                    .attr("class","epIcon")
                                    .style("text-align", "center")
                                    .html("<h4>"+d.custom_name + "</h4><strong>" + userCount + " Hosts </strong>")
                                    .on('dblclick', function(e){
                                        d.active = true;
                                        $rootScope.toggleView = true;
                                        $scope.$apply();
                                    })
                                    .on('click', function(e){
                                        $scope.requery(d, 'listusers'); 
                                        // $scope.removeLines();
                                    })
                                    .on('mouseover', function(e){
                                        d3.select(this).style("cursor","pointer")
                                    });  

                                var element = elm.append("div").attr('class', 'floorplanicon').append("svg");

                                 element
                                    .attr('width', '155')
                                    .attr('height', '110')
                                        element.append('svg:path')
                                            .attr("transform", "scale(0.5)")
                                            .attr('d', 'M71.5,87.2h17.1v2.3H71.5V87.2z M302,2v206H2V2H302zM297.3,84.9h-17.4v3.8h17.4V84.9z M297.3,80.1h-17.4v3.8h17.4V80.1z M297.3,75.3h-17.4v3.8h17.4V75.3z M297.3,70.6h-17.4v3.8h17.4V70.6z M297.3,65.8h-17.4v3.8h17.4V65.8z M297.3,61h-17.4v3.8h17.4V61z M297.3,56.2h-17.4V60h17.4V56.2z M297.3,51.5h-17.4v3.8h17.4V51.5z M297.3,46.7h-17.4v3.8h17.4V46.7z M297.3,41.9h-17.4v3.8h17.4V41.9z M297.3,37.1h-17.4v3.8h17.4V37.1z M297.3,6.7h-41.9v82v0.9v0.1h-34v-1H253v-82h-45.5v83h-34.1v-1h31.7v-82h-47.3v82.9h-2.4V6.7h-46.4v80.4h20.7v2.4h-23.1V6.7H60.5v67h13.3v3.3H58.1V6.7H6.7v80.5h53.4v2.3H6.7v34.7h50.8V98.7h3.3v28.7H6.7v33.8h50.8v-24.6h3.3v27.9v0H6.7v38.8h50.7v-26h19.1v-4h1.8v5.7H60.7v24.2h45.6v-44.6H71.5l0-45l40.7,0v2.3h-22v2.1h1.9v0.9h2.7v0c1.1,0,2.6,1,2.6,2.3c0,1.3-1.5,2.3-2.6,2.3v0h-2.7v0.9h-1.9v3.2h1.9v0.9h2.7v0c1.1,0,2.6,1,2.6,2.3c0,1.3-1.5,2.3-2.6,2.3v0h-2.7v0.9h-1.9v1.6H114v-1.7h0.9v-1.1h0c0-1.1,1-1.8,2.3-1.8c1.3,0,2.3,0.7,2.3,1.8h0v1.1h0.9v1.7h2.2v-21.6h3.3v21.6h1.6v-2.5h0.9V130h0c0-1.1,1-2.6,2.3-2.6c1.3,0,2.3,1.5,2.3,2.6h0v2.7h0.9v2.5h13.6v-3.3h-1.3v-0.9h-1.1v0c-1.1,0-1.8-1-1.8-2.3c0-1.3,0.7-2.3,1.8-2.3v0h1.1v-0.9h1.3v-9.9h-11.8v-2.3h11.8h3.3l0,23.9H90.2v18.9h18.5v46.9H204v-65.8h-15.8l0-23.9h3.3v21.6h27.2v-21.6h3.3v23.9h-15.5v65.8h90.9v-65.8h-56.1v-23.9h12.1v2.3h-8.8v19.4h1.3v-2.8h0.9v-2.7h0c0-1.1,1-2.6,2.3-2.6c1.3,0,2.3,1.5,2.3,2.6h0v2.7h0.9v2.8h6.5v-1.7h0.9v-1.1h0c0-1.1,1-1.8,2.3-1.8c1.3,0,2.3,0.7,2.3,1.8h0v1.1h0.9v1.7h6.8v-2.8h0.9v-2.7h0c0-1.1,1-2.6,2.3-2.6c1.3,0,2.3,1.5,2.3,2.6h0v2.7h0.9v2.8h1.5v-19.4h-14.6v-2.3h21.6v2.3h-3.7v19.4h14.5v-19.4h-3.8v-2.2h3.8V89.6h-18.4V36.1h18.4V6.7z M86.9,151.9v-3.8H72.5v3.8H86.9z M72.5,152.9v3.5h14.4v-3.5H72.5z M86.9,147.1v-3.8H72.5v3.8H86.9z M86.9,142.3v-3.8H72.5v3.8H86.9z M86.9,137.5v-3.8H72.5v3.8H86.9z M86.9,132.7V129H72.5v3.8H86.9z M86.9,128v-3.8H72.5v3.8H86.9z M86.9,123.2v-3.8H72.5v3.8H86.9z M86.9,118.4v-3.8H72.5v3.8H86.9z')
                                            .style('fill-rule', '#evenodd')
                                            .style('clip-rule', '#evenodd')
                                            .style('fill', "#676767");                                        
                                        element.append('svg:path')
                                            .attr("transform", "scale(0.5)")
                                            .attr('d', 'M262.5,4.5v-4h27v4H262.5zM290.5,7.5v-3h-29v3H290.5z M276.5,204.5v4h9v-4H276.5z M275.5,201.5v3h11v-3H275.5z M238.5,204.5v4h9v-4H238.5z M237.5,201.5v3h11v-3H237.5z M214.5,204.5v4h9v-4H214.5z M213.5,201.5v3h11v-3H213.5z M175.5,204.5v4h9v-4H175.5z M174.5,201.5v3h11v-3H174.5z M151.5,204.5v4h9v-4H151.5z M150.5,201.5v3h11v-3H150.5z M113.5,204.5v4h9v-4H113.5z M112.5,201.5v3h11v-3H112.5z M38.5,204.5v4h9v-4H38.5z M37.5,201.5v3h11v-3H37.5z M18.5,204.5v4h9v-4H18.5z M17.5,201.5v3h11v-3H17.5z M4.5,140.5h-4v9h4V140.5z M7.5,139.5h-3v11h3V139.5z M4.5,100.5h-4v9h4V100.5z M7.5,99.5h-3v11h3V99.5z M4.5,58.5h-4v9h4V58.5z M7.5,57.5h-3v11h3V57.5z M84.5,204.5v4h9v-4H84.5z M83.5,201.5v3h11v-3H83.5z M243.5,4.5v-4h-27v4H243.5z M244.5,7.5v-3h-29v3H244.5z M195.5,4.5v-4h-27v4H195.5z M196.5,7.5v-3h-29v3H196.5z M145.5,4.5v-4h-27v4H145.5z M146.5,7.5v-3h-29v3H146.5z M99.5,4.5v-4h-27v4H99.5z M100.5,7.5v-3h-29v3H100.5zM45.5,4.5v-4h-27v4H45.5z M46.5,7.5v-3h-29v3H46.5z')
                                            .style('fill-rule', '#evenodd')
                                            .style('clip-rule', '#evenodd')
                                            .style('stroke', "#676767")
                                            .style('fill', "#F3F3F3");

                                var elel = elm[0];
                                var el = elel[0];
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

                    // -- sets selected class for CSS (controller calls this when coming from ioc_events_drilldown(page2))
                    $rootScope.setSelected = function (selected) {
                        d3.select('.user-'+selected.id).classed("selected", true);
                    }
                    
                    // $rootScope.removeLines = function () {
                    //     $scope.selectedUser = "";
                    //     $scope.floorConns = "";
                    //     endpointConn.selectAll('line').remove();
                    // }

                    $rootScope.resetLineCountF = function () {
                        lineCount = 0;
                    }
                    $rootScope.removeFLines = function () {
                        container.selectAll('line').remove();
                        lineCount = 0;
                    } 
                    // -- draws connections between floors
                    $rootScope.drawFloorConns = function (user, connections, color) {
                        //console.log("test");
                        //var conns = endpointConn.selectAll(".endpointConns").data([""]);
                        //container.selectAll(".endpointConns").each(function (d) {
                            // var elm = d3.select(this);
                            // console.log(elm)
                            for (var b in $scope.buildings) {
                                for (var f1 in $scope.buildings[b].floors) {
                                    for (var f2 in $scope.buildings[b].floors) {
                                        if (user.map == $scope.buildings[b].floors[f1].id) {
                                            for (var c in connections) {
                                                if (connections[c].map == $scope.buildings[b].floors[f2].id) {  
                                                    container.append("line")
                                                        .attr("x1", $scope.buildings[b].floors[f1].x+85)
                                                        .attr("y1", $scope.buildings[b].floors[f1].y+lineCount+100)
                                                        .attr("x2", $scope.buildings[b].floors[f2].x+85)
                                                        .attr("y2", $scope.buildings[b].floors[f2].y+lineCount+100)
                                                        .attr('stroke-width', 2)
                                                        .attr("stroke", color);
                                                }
                                            }   
                                        }
                                    }
                                }
                            }
                       // });

                        
                        lineCount += 4;

                        // if (($scope.floorConns !== undefined) && ($scope.selectedUser !== undefined)) {
                        //     endpointConn.selectAll('line').remove();
                        //     var conns = endpointConn.selectAll(".endpointConns").data([""]);
                        //     wait(function(){
                        //         var count = 0;
                        //         var floor1 = floors.filter(function(fl){ 
                        //             if (($scope.selectedUser.map === fl.asset_name)){
                        //                 return true;
                        //             }
                        //         });
                        //         for (var c in $scope.floorConns) {
                        //             var floor2 = floors.filter(function(fl){ 
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
                    }// -- draws connections between hosts

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
                    // var searchFired = false;
                    // $rootScope.$watch('search', function(){
                    //     if (searchFired === true) {
                    //         searchFilter($scope.searchDimension, $rootScope.search);
                    //         $scope.$broadcast('searchUsers',$scope.searchDimension.top(Infinity));
                    //     }
                    //     searchFired = true;
                    // })

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
                    var lineCount = 0;

                    if (($('#buildingplanspan')[0].offsetWidth-25) != -25) {
                        //console.log("test")
                        $scope.elementWidth = ($('#buildingplanspan')[0].offsetWidth-25)
                    }
                    //console.log($scope.elementWidth)
                    // var elementWidth = ($('#buildingplanspan')[0].offsetWidth-25);
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
                    var infoDiv = d3.select('#localuserinformation').append('table').style('overflow', 'auto');
                    var floorDiv = d3.select(element[0]);

                    var windowScale = $scope.standardWidth/element.outerWidth();

                    var hideListDiv = d3.select('#listlocalusersspan');
                    var expandDiv = d3.select('#buildingplanspan');
                    var buttonDiv = d3.select('#triggerbuttons');
                    var scaleButtonDiv = $('#scalebuttons');

                    var margin = {top: -5, right: -5, bottom: -5, left: -5};

                    var zoom = d3.behavior.zoom()
                        .scaleExtent([0.3, 5])
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
                            .on("click", function(d){
                                $scope.requery(d, 'flooruser');
                            })
                            .append('svg:foreignObject')
                                .style("padding-top", function(d){
                                    count++;
                                    return count*nodeHeight+"px";
                                })
                                .attr("height", (count+1)*nodeHeight+10+"px")
                                // /.attr('height', "30px")
                                .attr('width', "100%")
                                .attr("class", function(d){
                                    return 'userTrans-'+d.id;
                                })
                            .append('xhtml:button').each(function(d){
                                var iconColour = '#29ABE2'; 
                                var name = d.lan_machine;
                                if (d.custom_user !== null){
                                    name = d.custom_user;
                                }
                                if ((name === "") || (name === null)){
                                    name = d.lan_ip;
                                }
                                if ((name === "") || (name === null)){
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
                        container.selectAll('g').remove();
                        container.selectAll('g').data(bldgs.filter(function(d){return true; })).enter()
                            .append('g')
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr("transform", function(d){ 
                                return "translate("+d.x+","+d.y+")"
                            })
                            .call(drag)
                            .append('svg:foreignObject')
                                .attr('width', "140px")
                                .attr('height', "300px")
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
                                    .attr("class","epIcon")
                                    .style("text-align", "center")
                                    .html("<h4>"+d.custom_name + "</h4><strong>" + d.floors.length + " Floors, " + userCount + " Hosts</strong>")
                                    .on('dblclick', function(e){
                                        for (var bld in $scope.buildings) {
                                             $scope.buildings[bld].active = false;
                                        }
                                        d.active = true;
                                        if (d.floors[0] !== undefined) {
                                            d.floors[0].active = true;

                                        }
                                            $rootScope.toggleZoom = true;
                                            $scope.$apply();
                                    })
                                    .on('click', function(e){
                                        $scope.requery(d, 'listallusers'); 
                                        // $scope.removeLines();
                                    })
                                    .on('mouseover', function(e){
                                        d3.select(this).style("cursor","pointer")
                                    });  

                                var element = elm.append("div").attr('class', 'floorplanicon').append("svg");

                                 element
                                    .attr('width', '60')
                                    .attr('height', '95')
                                        element.append('svg:path')
                                            .attr('d', 'M60.8,20.7v-1.3h-2.7V14H43.8V7.2h8.7V5.5h-8.7V4.2h-5.8V0H18.9v4.2H13V14H2.1v5.5H0v1.3h2.1V95h3.8V81.5h10.6V95h38h3.6h1.1V78.4h-1.1V20.7H60.8z M13.8,78H8.7V67.4h5.1V78zM13.8,63.2H8.7V52.5h5.1V63.2z M13.8,49.1H8.7V38.4h5.1V49.1z M13.8,33.6H8.7V22h5.1V33.6z M29.4,90.5h-5.1v-8.1h5.1V90.5zM29.4,78h-5.1V67.4h5.1V78z M29.4,63.2h-5.1V52.5h5.1V63.2z M29.4,49.1h-5.1V38.4h5.1V49.1z M30,33.6h-8.3V22H30V33.6z M32,14.2H21.7V6.9H32V14.2z M39.1,90.5H34v-8.1h5.1V90.5z M39.1,78H34V67.4h5.1V78z M39.1,63.2H34V52.5h5.1V63.2z M39.1,49.1H34V38.4h5.1V49.1z M39.1,33.6H32V22h7.1V33.6z M55.1,90.5H43.9v-8.1h11.2V90.5z M56,78H45.1V67.4H56V78z M56,63.2H45.1V52.5H56V63.2z M56,49.1H45.1V38.4H56V49.1z M56,33.6H45.1V22H56V33.6z')
                                            .style('fill-rule', '#evenodd')
                                            .style('clip-rule', '#evenodd')
                                            .style('opacity','0.6')
                                            .style('fill', "#676767"); 

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

                    // -- redraws the floor (used when user is deleted from floorplan)
                    $rootScope.redrawBuilding = function (bldRemoved) {
                        buildings.splice(buildings.indexOf(bldRemoved),1);
                        plot(data, buildings);
                    }

                    $rootScope.removeBLines = function () {
                        container.selectAll('line').remove();
                        lineCount = 0;
                    }                    
                    // -- sets selected class for CSS (controller calls this when coming from ioc_events_drilldown(page2))
                    $rootScope.setSelected = function (selected) {
                        d3.select('.user-'+selected.id).classed("selected", true);
                    }


                    $rootScope.resetLineCountB = function () {
                        lineCount = 0;
                    }
                    // -- draws connections between floors
                    $rootScope.drawBuildingConns = function (user, connections, color) {
                        // console.log("test");
                        //var conns = endpointConn.selectAll(".endpointConns").data([""]);
                        //container.selectAll(".endpointConns").each(function (d) {
                            // var elm = d3.select(this);
                        //container.selectAll('line').remove();
                        for (var b1 in $scope.buildings) {
                            for (var b2 in $scope.buildings) {
                                for (var f1 in $scope.buildings[b1].floors) { 
                                    for (var f2 in $scope.buildings[b2].floors) { 
                                        for (var c in connections) {
                                            if ((user.map == $scope.buildings[b1].floors[f1].id) && (connections[c].map == $scope.buildings[b2].floors[f2].id)) {         
                                                container.append("line")
                                                    .attr("x1", $scope.buildings[b1].x+65)
                                                    .attr("y1", $scope.buildings[b1].y+lineCount+80)
                                                    .attr("x2", $scope.buildings[b2].x+65)
                                                    .attr("y2", $scope.buildings[b2].y+lineCount+80)
                                                    .attr('stroke-width', 2)
                                                    .attr("stroke", color);
                                            }   
                                        }
                                    }                             
                                }
                            }
                        }
                       // });
                        lineCount += 4;   
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

angular.module('mean.pages').directive('drawLinks', ['$timeout', '$rootScope', '$http', '$location', function ($timeout, $rootScope, $http, $location) {
    return {
        link: function ($scope, element, attrs) {
           
            $scope.$on('plotLinks', function (event, root) {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
                    
                    console.log(root)

                    for (var i in root.children) {
                        root.children[i].x = undefined;
                        root.children[i].y = undefined;
                    }


                    //var width = $("#hostlinks").parent().width(),
                        //height = params["height"];
                        var width = 755, height = 420;

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
                        .projection(function(d) { console.log(d); return [d.y, d.x]; });

                    var svg = d3.select("#hostlinks").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(180,0)");

                        var nodes = cluster.nodes(root),
                        links = cluster.links(nodes);
                        // console.log(nodes)
                        // console.log(links)

                        var link = svg.selectAll(".link")
                            .data(links)
                            .enter().append("path")
                            .attr("d", diagonal)
                            .data(nodes)
                            // .attr("stroke-width", function(d) { 
                            //     console.log(d)
                            //     return d.idRoute ? "1px" : "0"; 
                            // })
                            .attr("stroke-width", "1px")
                            .attr("class", "conn_link");

                        var node = svg.selectAll(".conn")
                            .data(nodes)
                            .enter().append("g")
                            .attr("class", "conn")
                            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                        node.append("circle")
                            .attr("fill",function(d){ return nodeColor(1); } )
                            .attr("stroke", "#000")
                            .attr("stroke-width", "0.7px")
                            .attr("r", 10);

                        node.append("text")
                            .attr("dx", function(d) { return d.children ? -8 : 8; })
                            .attr("dy", 3)
                            .attr("font-weight", function(d) { return d.idRoute ? "bold" : 400; })
                            // .attr("class", function(d){return aRoute(d.idRoute)})
                            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                            .text(function(d) { return d.lan_machine; });
                    d3.select(self.frameElement).style("height", height + "px");

                }, 1000, false);
            })
        }
    };
}]);