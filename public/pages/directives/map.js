'use strict';

angular.module('mean.pages').directive('makeMap', ['$timeout', '$location', '$rootScope', '$http', function ($timeout, $location, $rootScope, $http) {
	return {
		link: function ($scope, element, attrs) {

			// RESIZING
			d3.select(window).on("resize", function(){
				// resize function goes here
			});

			// SET PARAMS
			var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");
			var width = document.getElementById('map').offsetWidth-60;
			var height = width / 1.5;
			var zoom = d3.behavior.zoom()
				.scaleExtent([1, 8])
				.on("zoom", move);

			// BUILD SVG LAYER
			var projection = d3.geo.mercator()
				.translate([0, 150])
				.scale(width / 2 / Math.PI);
			var path = d3.geo.path()
				.projection(projection);
			var svg = d3.select("#map").append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
				.call(zoom);
			var g = svg.append("g");

			// APPEND TABLE
			var tableDiv = d3.select('table')
				.attr('transform', "translate(-" + ((width / 2) - 20) + ",-" + ((height / 2) - 20) + ")");
			var thead = tableDiv.select('thead').append('tr');
			var tbody = tableDiv.select('tbody');
			thead.append("th")
				.text('Country');
			thead.append("th")
				.text('Percentage');
			thead.append("th")
				.text('Count');

			function updateTable(obj) {
				if (obj.length > 0) {
					tbody.selectAll('tr').remove();
					for (var i in obj) {
						var row = tbody.append('tr');
						row
							.append('td')
							.text(obj[i].country);
						row
							.append('td')
							.text(obj[i].percentage+'%');
						row
							.append('td')
							.text(obj[i].count);
					}
				}
			}

			// ZOOM BEHAVIOR
			function move() {
				var t = d3.event.translate;
				var s = d3.event.scale;
				var h = height / 3;
				t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
				t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

				zoom.translate(t);
				g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
				// var up = s/5;
				// node.attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0],d.geometry.coordinates[1]]) + ")scale("+up+")";})
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
			var percentArr = [];
			var countrylist = [];
			var arr = [];
			$scope.$on('map', function (event, data, start, end) {
				/*Animation Timing Variables*/
				var step = 1000; // 1 second
				var timer, percent;
				data.features.forEach(function(d){
					d.time = moment(d.properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000;
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
						.attr("r", 5)
						.attr("class",  "center")
						.style("stroke", function(d) {
							return "#f30";
						});
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
					.on('mouseover', tip.show)
					.on('mouseout', tip.hide)

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
							var thisCountry = d.properties.country;
							var index = countrylist.indexOf(thisCountry);
							if (index !== -1) {
								percentArr[index].count += d.properties.count;
							} else {
								countrylist.push(thisCountry);
								percentArr.push({
									count: d.properties.count,
									country: d.properties.country
								});
							}

							// return text for label (REVISIT)
							return d.properties.country;
						})
						.attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0]+2,d.geometry.coordinates[1]]) + ")";})
						.style('fill', '#000')
						.attr("text-anchor","left")
						.attr('font-size','10px')
						.call(zoom);

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
						.duration(function(d) {
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
								return 'red';
								break;
							}
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
					var percentages = [], country = [];
					percentArr.forEach(function(d){
						var decimal = (d.count/arrayCount) * 100;
						var fDecimal = Math.round(decimal * 100) / 100;
						d.percentage = fDecimal;
						percentages.push(fDecimal);
					});
					var arr = percentages.sort(function(a, b){return b-a});
					if (arr.length > 4){
						arr = arr.splice(4, arr.length);
					}
					var fArr = $.grep(percentArr, function(e) {
						if (arr.length > 0) {
							var index = arr.indexOf(e.count);
							if (index === -1){
								return e;
							}
						}
					});
					updateTable(fArr);
				}

				timer = window.setInterval(stepUp, step);
				percent = window.setInterval(calcPercent, step);

				/*Scale dots when map size or zoom is changed*/
				// d3.behavior.zoom()
				// 	.scaleExtent([1, 8])
				// 	.on("zoom", function(){
				// 		conosle.log('zooom')
				// 		var s = d3.event.scale;
				// 		console.log(s);
				// 		node.attr("transform", function(d) {return "scale("+s/2+")"});
				// 	});
				// function update() {
				// 	var up = map.getZoom()/13;
				// 	node.attr("transform", function(d) {return "translate(" +  map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y + ") scale("+up+")"});
				// }

			});
		}
	};
}]);
