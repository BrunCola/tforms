'use strict';

angular.module('mean.pages').directive('editClient', ['$http', '$window', function ($http, $window) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('drawUser', function (event, data) {

                var elementWidth = d3.select(element[0])[0][0].clientWidth-200;
                var elementHeight = elementWidth* (6/8); 

                var drag = d3.behavior.drag()
                    .origin(function(d) { return d; })
                    .on("dragstart", dragstarted)
                    .on("drag", dragged)
                    .on("dragend", dragended);

                var outterDiv = d3.select(element[0]).append("div").style("border","#0f0 solid 1px");
                var svg = outterDiv.append("svg")
                    .attr("height", elementHeight)
                    .attr("width", elementWidth).append("g");

                var bodyImage = svg.append("svg")
                    .attr("class", "bodyImage")
                    .append("image")
                    .attr("id", "svgBodyImage")
                    .attr("height", elementHeight)
                    .attr("width", elementWidth)
                    .attr("xlink:href", "./public/images/bodyImage.svg")
                    .attr("type", "image/svg+xml")
                    .on("click", mouseClick); 


                function mouseClick() {
                    svg.selectAll(".circle")
                        .data([{ x: d3.event.offsetX, y: d3.event.offsetY, r: 25 }])
                        .enter().append("circle")
                        .attr("class", "draggableCircle")
                        .attr("fill","transparent")
                        // .attr("fill","#F00")
                        .attr("stroke", "#F00")
                        .attr("stroke-width", "2px")
                        .attr("cx",function(d){return d.x})
                        .attr("cy",function(d){ return d.y})
                        .attr('cx', function(d) { return d.x; })
                        .attr('cy', function(d) { return d.y; })
                        .attr('r', function(d) { return d.r; })
                        .attr("r", 30)
                        .call(drag)
                }

                function dragstarted(d) {
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).classed("dragging", true);
                }
                // -- handles during a user is dragged
                function dragged(d) {
                    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
                }
                // -- handles the end of when a user is dragged
                function dragended(d) {
                    d3.select(this).classed("dragging", false);
                }



            })
        }
    };
}]);
