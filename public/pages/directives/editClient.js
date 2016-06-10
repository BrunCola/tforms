'use strict';

angular.module('mean.pages').directive('editClient', ['$http', '$window', function ($http, $window) {
    return {
        link: function ($scope, element, attrs) {
            // let back_body = require("../../images/body_back.svg");
            // let front_body = require("../../images/body_back.svg");

            // let width = element[0].clientWidth - 20, 
            // height = angular.element($window)[0].innerHeight - offsetHeight;

            let width = 500, height = 1000;

            let svg = d3.select(element[0])


            // d3.xml(front_body, "image/svg+xml", function (xml) {

            //     let front_body_svg = d3.select('#front_body')
            //     // front

            //     var importedNode = document.importNode(xml.documentElement, true);
            //     svgOutter = d3.select('#svgOutter')
            //     svgInner = d3.select('#svgInner')
            //     areas = svgInner.selectAll(".areas");
            //     if (currentClient.map.color === "color1") {
            //         homeContainer.style.background = "#276791";
            //         homeHeader.style.background = "#276791";
            //         areas.style("fill", "#D9AB69");
            //         areas.style("stroke", "#000");
            //     } else {
            //         homeContainer.style.background = "#4a4a4a";
            //         homeHeader.style.background = "#4a4a4a";
            //         areas.style("fill", "#757575");
            //         areas.style("stroke", "#ddd");
            //     }

            //     defaultWidth = Number(svgOutter.attr('width'));
            //     defaultHeight = Number(svgOutter.attr('height'));
            //     scale = Math.min(((height-offsetHeight)/defaultHeight),(width/defaultWidth))
            //     svgOutter.attr('width', width)
            //     svgOutter.attr('height', height)
            //     if (currentClient.map.name === "svg1") {
            //         scale = scale*0.8;
            //     }
            //     svgInner.attr("transform", "translate("+(currentClient.map.offsetx*scale)+","+(currentClient.map.offsety*scale)+") scale("+(currentClient.map.scale*scale)+")")
            //     zm = d3.behavior.zoom()
            //         .translate([(currentClient.map.offsetx),(currentClient.map.offsety)])
            //         .scale([currentClient.map.scale])
            //         .scaleExtent([0.7, 10])
            //         .on("zoom", zoom)
            //         .on("zoomend", zoomend)
            //     svgOutter.attr("transform", "scale("+scale+")")
            //     svgOutter.on("dblclick", function () {
            //         resetMap();
            //     })
            //     svgOutter.call(zm)
            //     redraw();
            // });



            let body_parts = d3.selectAll(".body_part")
            console.log(body_parts)
            body_parts.on("click", function(d){
                let elm = d3.select(this)
                console.log(elm)
                if (elm.style("fill") !== "rgb(255, 255, 255)") {
                    elm.style("fill", "#FFF")
                } else {
                    elm.style("fill", "#F00")
                }
            })




            $scope.$on('drawUser', function (event, data) {

                console.log("test")







                // var elementWidth = d3.select(element[0])[0][0].clientWidth-200;
                // var elementHeight = elementWidth* (6/8); 

                // var drag = d3.behavior.drag()
                //     .origin(function(d) { return d; })
                //     .on("dragstart", dragstarted)
                //     .on("drag", dragged)
                //     .on("dragend", dragended);

                // var outterDiv = d3.select(element[0]).append("div").style("border","#0f0 solid 1px");
                // var svg = outterDiv.append("svg")
                //     .attr("height", elementHeight)
                //     .attr("width", elementWidth).append("g");

                // var bodyImage = svg.append("svg")
                //     .attr("class", "bodyImage")
                //     .append("image")
                //     .attr("id", "svgBodyImage")
                //     .attr("height", elementHeight)
                //     .attr("width", elementWidth)
                //     .attr("xlink:href", "./public/images/bodyImage.svg")
                //     .attr("type", "image/svg+xml")
                //     .on("click", mouseClick); 


                // function mouseClick() {
                //     svg.selectAll(".circle")
                //         .data([{ x: d3.event.offsetX, y: d3.event.offsetY, r: 25 }])
                //         .enter().append("circle")
                //         .attr("class", "draggableCircle")
                //         .attr("fill","transparent")
                //         // .attr("fill","#F00")
                //         .attr("stroke", "#F00")
                //         .attr("stroke-width", "2px")
                //         .attr("cx",function(d){return d.x})
                //         .attr("cy",function(d){ return d.y})
                //         .attr('cx', function(d) { return d.x; })
                //         .attr('cy', function(d) { return d.y; })
                //         .attr('r', function(d) { return d.r; })
                //         .attr("r", 30)
                //         .call(drag)
                // }

                // function dragstarted(d) {
                //     d3.event.sourceEvent.stopPropagation();
                //     d3.select(this).classed("dragging", true);
                // }
                // // -- handles during a user is dragged
                // function dragged(d) {
                //     d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
                // }
                // // -- handles the end of when a user is dragged
                // function dragended(d) {
                //     d3.select(this).classed("dragging", false);
                // }



            })
        }
    };
}]);