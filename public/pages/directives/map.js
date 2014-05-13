'use strict';

angular.module('mean.pages').directive('makeMap', ['$timeout', '$location', '$rootScope', '$http', function ($timeout, $location, $rootScope, $http) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('map', function (event, data) {
				/*Tooltip showing address info*/
				// var tooltip = d3.select("#map")
				// 	.append("div")
				// 	.attr("class", "tooltip")
				// 	.style("position", "absolute")
				// 	.style("z-index", "60")
				// 	// .style("visibility", "hidden")
				// 	.text("tooltip");

    //             var map = L.mapbox.map('map', 'andrewdw.i3ka4b7e')
				// 	.setView([51.505, -0.09], 2);
				// $scope.heat = L.heatLayer([], {radius: 30, max: 1, gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}}).addTo(map);
				// var overlayMaps = {
    //                 'Heatmap': $scope.heat
    //             };
				// var controls = L.control.layers(null, overlayMaps, {collapsed: false});
				// controls.addTo(map);

				// // .addLayer(new L.TileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png"));
				// // .addLayer(new L.TileLayer("https://ssl_tiles.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/59870/256/{z}/{x}/{y}.png"));
				// // .addLayer(new L.TileLayer("http://{s}.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png"));

				// /* Initialize the SVG layer */
				// map._initPathRoot()

				/* Pass map SVG layer to d3 */


				d3.select(window).on("resize", throttle);

				var zoom = d3.behavior.zoom()
					.scaleExtent([1, 8])
					.on("zoom", move);

				var width = document.getElementById('map').offsetWidth-60;
				var height = width / 1.5;

				var topo,projection,path,svg,g,heatConfig,heat,node;

				var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");

				setup(width,height);

				function setup(width,height){
					projection = d3.geo.mercator()
						.translate([0, 150])
						.scale(width / 2 / Math.PI);
					path = d3.geo.path()
						.projection(projection);
					svg = d3.select("#map").append("svg")
						.attr("width", width)
						.attr("height", height)
						.append("g")
						.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
						.call(zoom);
					g = svg.append("g");
					// h = heatmap.append("h");
					heatConfig = {
						element: document.getElementById("map"),
						radius: 30,
						opacity: 50,
						legend: {
							position: 'br',
							title: 'Example Distribution'
						}
					};
					// heat = h337.create(heatConfig);
				}

				d3.json("public/system/assets/world-topo.json", function(error, world) {
					var countries = topojson.feature(world, world.objects.countries).features;
					topo = countries;
					draw(topo);
					startLoop();
				});

				function draw(topo) {
					var country = g.selectAll(".country").data(topo);
					country.enter().insert("path")
						.attr("class", "country")
						.attr("d", path)
						.attr("id", function(d,i) { return d.id; })
						.attr("title", function(d,i) { return d.properties.name; })
						// .style("fill", function(d, i) { return d.properties.color; })
						.style("fill", '#cbcbcb')
					// var text = g.selectAll("text").data(topo)
    	// 				.enter()
    	// 				.append("text")
					//     .text(function(d){
					//         return d.properties.name;
					//     })
					//     .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
					//  //    .attr("dx", function (d) { return d.properties.dx || "0"; })
					// 	// .attr("dy", function (d) { return d.properties.dy || "0.35em"; })
					//     .style('color', '#000')
					// 	.attr("text-anchor","middle")
					// 	.attr('font-size','6pt');
					//ofsets plus width/height of transform, plsu 20 px of padding, plus 20 extra for tooltip offset off mouse
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

				function redraw() {
					width = document.getElementById('container').offsetWidth-60;
					height = width / 2;
					d3.select('svg').remove();
					setup(width,height);
					draw(topo);
				}

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

				var throttleTimer;
				function throttle() {
					window.clearTimeout(throttleTimer);
					throttleTimer = window.setTimeout(function() {
						redraw();
					}, 200);
				}
				function startLoop() {
					/*Animation Timing Variables*/
					var startingTime;
					var step = 1000; // 1 second
					var timer;
					var isPlaying = false;
					var counterTime = startingTime;

					$scope.loadData = function(data) {
						/*Load data file from cartoDB and initialize coordinates*/
						var cumEvictions = 0;
						var startingTime = moment(data.features[0].properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000;
						$scope.maxTime = moment(data.features[data.features.length-1].properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000;
						counterTime = startingTime;
						data.features.forEach(function(d) {
							// d.LatLng = new L.LatLng(d.geometry.coordinates[1],d.geometry.coordinates[0]);
							// d.LatLng.count = d.properties.count;
							// d.properties.severity = 4;
							cumEvictions += d.properties.units;
							d.properties.totalEvictions = cumEvictions;
						});

						/*Add an svg group for each data point*/
						node = g.selectAll(".node").data(data.features).enter().insert('g')
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
						// update();
						// playAnimation();
						/*Filter map points by date*/
						function filterCurrentPoints(){
							var filtered = node.attr("visibility", "hidden")
								.filter(function(d) {
									return moment(d.properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000 < counterTime
								})
								.attr("visibility", "visible");
							// console.log(JSON.stringify(filtered[0]));
							// updateCounter(filtered[0].length-1);
							var point = filtered.filter(function(d) {
								// var p = projection([d.geometry.coordinates[0],d.geometry.coordinates[1]]);
								// heat.store.addDataPoint(p[0], p[1], 1);
								return moment(d.properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000 > counterTime-1001
							})
							point.append('text')
								.text(function(d){
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
								// .style("fill","red")
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
								// addMapData();
								updateCounter(filtered[0].length-1);
								// console.log(filtered);
						}
						/*Update map counters*/
						function updateCounter(index){
							var totalEvictions = 0;
							if(index<1){
								// SOMETHING HERE
							} else {
								var props = data.features[index].properties;
								totalEvictions = props.totalEvictions;
							}
						}
						isPlaying = true;
						function stepUp() {
							counterTime += step;
							// $( "#slider" ).slider( "value", counterTime);
							filterCurrentPoints();
							if (counterTime >= $scope.maxTime) {
								// alert('http request')
								// stopAnimation();
								$scope.fetchMore($scope.maxTime);
							}
						}
						// stepUp();
						timer = window.setInterval(stepUp, 1000);
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
						/*Show info about on mouseover*/
						$( ".popup" ).hide();
						$( ".triggerPopup" ).mouseover(function(e) {
							$( ".popup" ).position();
							var id = $(this).attr('id');
							if(id=="ellis"){
								$( "#ellisPopup" ).show();
							} else if (id=="omi"){
								$( "#omiPopup" ).show();
							} else {
								$( "#demoPopup" ).show();
							}
							$('.popup').css("top", e.pageY+20);
						});
						$( ".triggerPopup" ).on("mouseout", function(){ $( ".popup" ).hide();});
					}
					$scope.fetchMore = function(maxTime) {
						clearInterval(timer);
						var urltime = Math.round(maxTime /1000);
						var endtime = maxTime+60000;
						var urltime2 = Math.round(endtime /1000);
						var url = '/live_connections/live_connections?start='+urltime+'&end='+urltime2;
						console.log(url);
						$http({method: 'GET', url: url}).
							success(function(data) {
								// console.log(data.map);
								$scope.checkData(data.map);
						});
					}
					$scope.checkData = function(data) {
						if (data.features.length === 0) {
							console.log('No data to display, waiting 5 minutes');
							setTimeout(function(data){
								var startTime = new Date().getTime();
								$scope.fetchMore(startTime);
							}, 60000); // wait 5 minutes
						} else {
							$scope.loadData(data);
						}
					}
					$scope.checkData(data);
				}
			});
		}
	};
}]);
