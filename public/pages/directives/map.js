'use strict';

angular.module('mean.pages').directive('makeMap', ['$timeout', '$location', '$rootScope', '$http', 'timeFormat', function ($timeout, $location, $rootScope, $http, timeFormat) {
    return {
        link: function ($scope, element, attrs) {

            // RESIZING
            d3.select(window).on("resize", function(){
                // resize function goes here
            });

            // SET PARAMS
            var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");
            var width = document.getElementById('map').offsetWidth;
            // var height = width / 2.15;
            var height = window.innerHeight-105;
           
            var zoom = d3.behavior.zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([0.5, 5])
                .on("zoom", zoomed);

            // BUILD SVG LAYER
            var projection = d3.geo.mercator()
                .translate([0, 150])
                .scale(width / 2 / Math.PI);
            var path = d3.geo.path()
                .projection(projection);
            var mapp = d3.select("#map");
            
            var leg = mapp.append("svg")
                        .style("position","absolute");

            var svg = mapp.append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(0,0)scale(1)")
                .call(zoom)
                .append("g")
                .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(1)");

            var g = svg.append("g");

            var margin = {top: 10, right: 10, bottom: 20, left: 10},
                lineChartWidth = document.getElementById('graph').offsetWidth - margin.left - margin.right,
                lineChartHeight = 100 - margin.top - margin.bottom;    
             
            var x = d3.time.scale()
                .range([lineChartWidth, 0])
                .domain([$scope.lineChartStart, $scope.lineChartEnd]);
             
            var y = d3.scale.linear()
                .domain([0, 1])
                .range([lineChartHeight, 0]);
                 
            var lineGraph = d3.select("#graph");
            lineGraph.selectAll("svg").remove();

            var svgLine = lineGraph.append("svg")
                .attr("width", lineChartWidth + margin.left + margin.right)
                .attr("height", lineChartHeight + margin.top + margin.bottom)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
            
            var gLine = svgLine.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
            var graphLine = gLine.append("svg")
                .attr("width", lineChartWidth+50)
                .attr("height", lineChartHeight + margin.top + margin.bottom);    

            var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);

            var axisX = graphLine.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + lineChartHeight + ")")
                .call(xAxis);

            var pathLine = gLine.append("g");

            var filteredLineChart;

            function zoomed() {
                svg.attr("transform", "translate(" + (d3.event.translate[0]+(width/2)*d3.event.scale) + "," + (d3.event.translate[1]+(height/2)*d3.event.scale) + ")scale(" + d3.event.scale + ")");
            }

            function lineColor (color) {
                switch(color) {
                    case "DNS":
                        return "#34D4FF"; // aqua
                        break;
                    case "NTP":
                        return "#FFEC00"; // yellow
                        break;
                    case "HTTP":
                        return "#0f0f0f"; //
                        break;
                    case "SSL":
                        return "#0f0f0f"; //
                        break;
                    case "BitTorrent":
                        return "#009426"; // green
                        break;
                    case "Google":
                        return "#0ff00f"; //
                        break;
                    case "YouTube":
                        return "#0f00ff"; //
                        break;
                    case "Facebook":
                        return "#000f0f"; //
                        break;
                    case "AppleiTunes":
                        return "#0fff0f"; //
                        break;
                    case "sFlow":
                        return "#123456"; //
                        break;
                    case "Other":
                        return "#f0f000"; //
                        break;
                    case "Unknown":
                        return "#000000"; //
                        break;
                    case "-":
                        return "#000000"; //
                        break;
                    case "Stealth":
                        return "#f30"; //
                        break;
                    case "Corp":
                        return "#0f0"; //
                        break;
                    case "Dev":
                        return "#f0f"; //
                        break;
                    default:
                    return "#377FC7"; // bluish
                }
            }

            function populateTable(array, dClass) {
                function sortArrOfObjectsByParam(arrToSort, strObjParamToSortBy, sortAscending) {
                if(sortAscending == undefined) sortAscending = true;  // default to true
                    if(sortAscending) {
                        arrToSort.sort(function (a, b) {
                            return a[strObjParamToSortBy] > b[strObjParamToSortBy];
                        });
                    }
                    else {
                        arrToSort.sort(function (a, b) {
                            return a[strObjParamToSortBy] < b[strObjParamToSortBy];
                        });
                    }
                }
                sortArrOfObjectsByParam(array, "count", false);  // sort tables by count
                if (array.length > 5) {
                    array.splice(4, array.length-4);
                }
                var thisDiv = d3.select('.'+dClass).select('tbody');
                if (array.length > 0) {
                    thisDiv.selectAll('tr').remove();
                    for (var i in array) {
                        var row = thisDiv.append('tr');
                        row
                            .append('td')
                            .text(array[i].display);
                        row
                            .append('td')
                            .text(array[i].percentage+'%');
                        row
                            .append('td')
                            .text(array[i].count);
                        if ((dClass == 'countriesTable') || (dClass == 'remoteTable')) {
                            row
                                .append('td')
                                .append('div')
                                .attr('class', 'f16')
                                .append('span')
                                .attr('class', 'flag '+array[i].flag)
                        } else if (dClass == 'protosTable') {
                            row.style("color", lineColor(array[i].display))
                        }
                    }
                }
            }

            // DRAW MAP
            function draw(countries) {
                var country = g.selectAll(".country").data(countries);
                country.enter().insert("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .attr("id", function(d,i) { return d.id; })
                    .attr("title", function(d,i) { return d.properties.name; })
                    .style("fill", '#cbcbcb');
                var offsetL = document.getElementById('map').offsetLeft+(width/2)+40;
                var offsetT = document.getElementById('map').offsetTop+(height/2)+20;
                //tooltips
                country
                    .on("mousemove", function(d,i) {
                        var mouse = d3.mouse(svg.node()).map( function(d) {
                            return parseInt(d);
                        });
                        tooltip
                            .classed("hidden", false)
                            .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
                            .html(d.properties.name)
                    })
                    .on("mouseout",  function(d,i) {
                        tooltip.classed("hidden", true)
                    });
            }

            // FIRE OFF SHIT WHEN SHIT LOADS, YO
            d3.json("public/system/assets/world-topo.json", function(error, world) {
                var countries = topojson.feature(world, world.objects.countries).features;
                draw(countries);
            });

            var arrayCount = 0;
            // country tables arr
            var countryArr = [];
            var countrylist = [];
            // l7 table arr
            var l7Arr = [];
            var l7list = [];
            // top local arr
            var topLocalArr = [];
            var topLocallist = [];
            // top remote arr
            var topRemoteArr = [];
            var topRemotelist = [];
            // Country labels arr
            var labelList = [];
            $scope.$on('map', function (event, data, start, end, zones) {

                var rainbow = new Rainbow();
                rainbow.setNumberRange(0, zones.length-1);
                rainbow.setSpectrum("#FF0000", "#00FF00", "#0000FF");
                var cc = [];
                for (var i = 0; i < zones.length; i++) {
                    // /var hexColour = rainbow.colourAt(i);
                    cc[""+zones[i].zone] = '#' + rainbow.colourAt(i);
                }

                /*Animation Timing Variables*/
                var step = 1000; // 1 second
                var timer, percent;
                data.features.forEach(function(d){
                    d.time = moment(timeFormat(d.properties.date_filed, 'strdDateObj')).unix()*1000;
                    if (d.properties.country === 'United States of America') {
                        d.properties.country = 'United States';
                    }
                })
                /*Add an svg group for each data point*/
                var node = svg.selectAll(".node").data(data.features).enter().insert('g')
                    .each(function(d) {
                    var parentt = d3.select(this);

                    // d.properties.severity = 1;
                    if (d.properties.severity === 0){
                        parentt.append("circle")
                            .attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0],d.geometry.coordinates[1]]) + ")";})
                            .attr("r", 2)
                            .attr("class",  "center")
                            .style("stroke", function(d) {
                                return cc[d.properties.lan_zone];
                            });
                       // / .style("stroke",lineColor (d.properties.lan_zone));
                    } else if ('properties' in d){
                        parentt.append("g")
                            .attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0]+.4,d.geometry.coordinates[1]+2]) + ")rotate(180)scale(0.06)";})
                            // .attr("transform", "translate(15,-200)")
                            .append('svg:path')
                            .attr('d', 'M8.09-224.929 '+
                                'C-13.491-93.344-86.594-49.482-129.756,23.621c-9.923,19.925-15.32,42.241-15.32,65.793c0,84.739,72.053,153.516,160.826,153.516 '+
                                'c88.78,0,160.826-68.777,160.826-153.516c0-23.566-5.382-45.867-15.32-65.793C118.094-49.482,44.991-93.344,8.09-224.929z '+
                                'M88.853,96.724c0,40.349-32.754,73.103-73.103,73.103s-73.103-32.753-73.103-73.103c0-40.35,32.754-73.103,73.103-73.103 '+
                                'S88.853,56.374,88.853,96.724z')
                            // .attr('transform', "rotate(180)")
                            .style('stroke-width', '5px')
                            .style('stroke', '#000')
                            .style('fill', function(d){
                                switch(d.properties.severity) {
                                    case 1:
                                        return '#377FC7';
                                    break;
                                    case 2:
                                        return '#F5D800';
                                    break;
                                    case 3:
                                        return '#F88B12';
                                    break;
                                    case 4:
                                        return '#DD122A';
                                    break;
                                }
                            });
                    }
                    parentt.append("circle")
                        .attr("transform", function(d) {return "translate(" + projection([d.zone.coordinates[0],d.zone.coordinates[1]]) + ")";})
                        .attr("r", 2)
                        .attr("class",  "center")
                        .style("stroke", function(d) {
                            //return cc[d.properties.lan_zone];
                            return "#f0f";
                        })
                });
                /*show node info on mouseover*/
                var tip = d3.tip().attr('class', 'd3-tip')
                    .html(function(d) {
                        function sevLevel(sev) {
                            switch(sev) {
                                case 1:
                                    return 'Guarded';
                                case 2:
                                    return 'Elevated';
                                case 3:
                                    return 'High';
                                case 4:
                                    return 'Severe';
                                default:
                                    return ' ';
                            }
                        }
                        if (d.properties.severity > 0) {
                            return '<div class="t-tip"><span>' + d.properties.ioc + '</span><br>'+
                                    '<span> Severity: ' + sevLevel(d.properties.severity) +' ('+d.properties.severity+')'+ '</span><br>'+
                                    '<span> Count: ' + d.properties.count + '</span></div>';
                        }
                    })
                    .offset([-12, 0]);
                node.call(tip);
                node
                    .on("click", function(d) {console.log(d)})
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);


                $scope.totalMap = $scope.totalMap.concat(data.features);

                filterCurrentPoints();
                // map.on("zoomend", update);
                /*Filter map points by date*/
                function filterCurrentPoints(){
                    var filtered = node.attr("visibility", "hidden")
                        .filter(function(d) {
                            return d.time < start
                        })
                        .attr("visibility", function(d){
                            return "visible";
                        });
                    var point = filtered.filter(function(d) {
                        return d.time > start-1001
                    })
                    point.append('text')
                        .text(function(d){
                            // add count to total count
                            arrayCount += d.properties.count;
                            // push countries to object while keeping track of count
                            function calc(value, pushTo, check) {
                                switch(value.toString()) {
                                    // switch for values to ignore
                                    case '-':
                                        return;
                                    case 'Default':
                                        return;
                                    default:
                                        var index = check.indexOf(value);
                                        if (index !== -1) {
                                            pushTo[index].count += d.properties.count;
                                        } else {
                                            check.push(value);
                                            pushTo.push({
                                                count: d.properties.count,
                                                display: value,
                                                flag: d.properties.flag.toLowerCase()
                                            });
                                        }
                                    return;
                                }
                            }
                            var props = [{
                                val: d.properties.country,
                                pushTo: countryArr,
                                check: countrylist
                            },{
                                val: d.properties.l7_proto,
                                pushTo: l7Arr,
                                check: l7list
                            },{
                                val: d.properties.lan_ip,
                                pushTo: topLocalArr,
                                check: topLocallist
                            },{
                                val: d.properties.remote_ip+' ('+d.properties.country+')',
                                pushTo: topRemoteArr,
                                check: topRemotelist
                            }]
                            for (var i in props) {
                                calc(props[i].val, props[i].pushTo, props[i].check);
                            }

                            // return text for label (REVISIT SOMETIME)
                            if (labelList.indexOf(d.properties.country) === -1) {
                                labelList.push(d.properties.country);
                                setTimeout(function(){
                                    var index = labelList.indexOf(d.properties.country);
                                    labelList.splice(index, 1);
                                }, 30000);
                                return d.properties.country;
                            } else {
                                return '';
                            }
                        })
                        .attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0]+2,d.geometry.coordinates[1]]) + ")";})
                        .style('fill', '#000')
                        .attr("text-anchor","left")
                        .attr('font-size','10px');
                        // .call(zoom);

                    point.append('text')
                        .text(function(d){
                            return d.properties.count;
                        })
                        .attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0]-2.5,d.geometry.coordinates[1]+2]) + ")";})
                        .style('fill', '#000')
                        .attr("text-anchor","center")
                        .attr("font-size", '10px')
                        .transition()
                        .style("fill-opacity", 0)
                        .duration(function(d){
                            return 800 / (d.properties.count/5);
                        })
                        // .attr('font-size','19px')
                        .ease(Math.sqrt)
                        .attr("font-size", function(d) {
                            return d.properties.count*40;
                        })
                        .remove();
                    point
                        .append("circle")
                        .attr("r", 2)
                        .style("fill-opacity", 0.9)
                        .attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0],d.geometry.coordinates[1]]) + ")";})
                        .transition()
                        .duration(function(d) {
                            return 800 / (d.properties.count/5);
                        })
                        .ease(Math.sqrt)
                        .attr("r", function(d) {
                            return d.properties.count*50;
                        })
                        .style('fill', function(d){
                            switch(d.properties.severity) {
                                case 1:
                                    return '#377FC7';
                                break;
                                case 2:
                                    return '#F5D800';
                                break;
                                case 3:
                                    return '#F88B12';
                                break;
                                case 4:
                                    return '#DD122A';
                                break;
                                default:
                                return cc[d.properties.lan_zone];
                                break;
                            }
                        })
                        .style("fill-opacity", 1e-6)
                        .remove();
                     point
                            .append("circle")
                            .attr("r", 2)
                            .style("fill-opacity", 0.9)
                            .attr("transform", function(d) {return "translate(" + projection([d.zone.coordinates[0],d.zone.coordinates[1]]) + ")";})
                            .transition()
                            .duration(function(d) {
                                return 800 / (d.properties.count/5);
                            })
                            .ease(Math.sqrt)
                            .attr("r", function(d) {
                                return d.properties.count*50;
                            })
                            .style('fill', function(d){
                                //return cc[d.properties.lan_zone];
                                return "#f0f";
                            })
                            .style("fill-opacity", 1e-6)
                            .remove();
                    point
                        .transition()
                        .duration(function(d){
                            if (d.properties.severity >= 1) {return 120000 }
                            else { return 60000};
                        })
                        .ease(Math.sqrt)
                        .style("opacity", 0)
                        .remove();

                    //filteredLineChartOld = filteredLineChart;

                    filteredLineChart = $scope.totalMap.filter(function(d) {  return d.time < start });

                    //var distinctHits = filteredLineChart.filter(function(obj) { return filteredLineChartOld.indexOf(obj) == -1; });

                    // if (start >= $scope.lineChartEnd) {
                    //     $scope.lineChartEnd += 250000;
                    // }

                   x.domain([ start-300000 , start]);
                    //y.domain([0, d3.max(filteredLineChart, function(d) { return d.properties.count; })]); 
                    //y.domain([0, 20]); 

                    // Slide x-axis left
                    axisX.transition()
                        .duration(1000)
                        .ease('linear')
                        .call(xAxis)

                    var dataNest = d3.nest()
                        .key(function(d) {return d.properties.l7_proto;})
                        .entries(filteredLineChart);

                    // var dataNestNew = d3.nest()
                    //     .key(function(d) {return d.properties.l7_proto;})
                    //     .entries(distinctHits);

                    gLine.selectAll('.lineChart').remove();

                    var y1 = 0;
                    var y2 = 0;
                    // Loop through each symbol / key
                    dataNest.forEach(function(lines) {
                        y1 = y2;
                        y2 = y1 + (1/dataNest.length);
                        for (var l in lines.values) {
                            pathLine.append('line')
                                .classed("lineChart", true)
                                .attr('x1', x(lines.values[l].time))
                                .attr('y1', y(y1))
                                .attr('x2', x(lines.values[l].time))
                                .attr('y2', y(y2))
                                // .attr('transform', null)
                                .style("stroke", lineColor(lines.key))
                                .style("cursor", "pointer")
                                .on('click', function(){
                                    console.log(lines.values[l].properties)
                                });
                        }
                    });
                }

                function stepUp() {
                    start += step;
                    filterCurrentPoints();
                    if (start >= end) {
                        $scope.$broadcast('canIhazMoreMap');
                        clearInterval(timer);
                        clearInterval(percent);
                    }
                }
                function calcPercent() {
                    var arrs = [{
                        arr: countryArr,
                        result: null,
                        class: 'countriesTable'
                    },{
                        arr: l7Arr,
                        result: null,
                        class: 'protosTable'
                    },{
                        arr: topLocalArr,
                        result: null,
                        class: 'localTable'
                    },{
                        arr: topRemoteArr,
                        result: null,
                        class: 'remoteTable'
                    }];
                    function calc(arr) {
                        var percentages = [];
                        arr.forEach(function(d){
                            var decimal = (d.count/arrayCount) * 100;
                            var fDecimal = Math.round(decimal * 100) / 100;
                            d.percentage = fDecimal;
                            percentages.push(fDecimal);
                        });
                        percentages.sort(function(a, b){return b-a});
                        if (percentages.length > 5){
                            var difference = (percentages.length) - 5;
                            percentages.splice(5, difference);
                        }
                        var result = $.grep(arr, function(e) {
                            if (percentages.length > 0) {
                                var index = percentages.indexOf(e.percentage);
                                if (index !== -1){
                                    return e;
                                }
                            }
                        });
                        return result;
                    }
                    for (var i in arrs){
                        arrs[i].result = calc(arrs[i].arr);
                        populateTable(arrs[i].result, arrs[i].class)
                    }
                }

                $scope.$on('$destroy', function() {
                    clearInterval(timer);
                    clearInterval(percent)
                });

                timer = window.setInterval(stepUp, step);
                percent = window.setInterval(calcPercent, step);

                /*Scale dots when map size or zoom is changed*/
                // d3.behavior.zoom()
                //  .scaleExtent([1, 8])
                //  .on("zoom", function(){
                //      conosle.log('zooom')
                //      var s = d3.event.scale;
                //      console.log(s);
                //      node.attr("transform", function(d) {return "scale("+s/2+")"});
                //  });
                // function update() {
                //  var up = map.getZoom()/13;
                //  node.attr("transform", function(d) {return "translate(" +  map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y + ") scale("+up+")"});
                // }

            
                //LEGEND
                var legend = leg.selectAll(".legend")
                    .data(zones)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                legend.append('svg:circle')
                    .attr('transform', 'translate(15,15) scale(0.5)')
                    .attr('r', 15)
                    .style("stroke", function(d) {
                        return cc[d.zone];
                    })
                    .style("fill", function(d) {
                        return cc[d.zone];
                    });
                legend.append("text")
                    .attr("x", 30)
                    .attr("y", 15)
                    .attr("dy", ".35em")
                    .text(function(d) { return d.zone; });

            });
        }
    };
}]);
