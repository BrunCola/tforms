'use strict';

angular.module('mean.pages').directive('fishGraph', ['$timeout', '$location', '$rootScope', '$http', '$modal', function ($timeout, $location, $rootScope, $http, $modal) {
	return {
		link: function ($scope, element, attrs) {
			// D3 FISHEYE PLUGIN
			function titles(title) {
				switch(title){
					case 'http':
						return "HTTP";
					case 'ssl':
						return "SSL";
					case 'file': // extracted files
						return "File";
					case 'dns': // new dns
						return "DNS";
					case 'conn': //first seen
						return "Connections";
					case 'conn_ioc':
						return "Connection IOC";
					case 'http_ioc':
						return "HTTP IOC";
					case 'ssl_ioc':
						return "SSL IOC";
					case 'file_ioc':
						return "File IOC";
					case 'dns_ioc':
						return "DNS IOC";
					case 'endpoint':
						return "Endpoint";
					default: //endpoint events
						return "undefined";
				}
			}
			(function() {
			d3.legend = function(g) {
			  g.each(function() {
				var g= d3.select(this),
					items = {},
					svg = d3.select(g.property("nearestViewportElement")),
					legendPadding = g.attr("data-style-padding") || 5,
					lb = g.selectAll(".legend-box").data([true]),
					li = g.selectAll(".legend-items").data([true])
				lb.enter().append("rect").classed("legend-box",true)
				li.enter().append("g").classed("legend-items",true)

				svg.selectAll("[data-legend]").each(function() {
					var self = d3.select(this)
					items[self.attr("data-legend")] = {
					  pos : self.attr("data-legend-pos") || this.getBBox().y,
					  color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke") 
					}
				  })

				items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})

				var hidden = [];
				function isHidden(key){
					var index = hidden.indexOf(key);
					if (index !== -1 ) {
						hidden.splice(index, 1);
						return false;
					} else {
						hidden.push(key);
						return true;
					}
				}

				li.selectAll("text")
					.data(items,function(d){ return d.key})
					.call(function(d) { d.enter().append("text")})
					.call(function(d) { d.exit().remove()})
					.attr("y",function(d,i) { return i+"em"})
					.attr("x","1em")
					.style('fill', '#000')
					.text(function(d) { return titles(d.key)})

				li.selectAll("circle")
					.data(items,function(d) { return d.key})
					.call(function(d) { d.enter().append("circle")})
					.call(function(d) { d.exit().remove()})
					.attr("cy",function(d,i) { return i-0.25+"em"})
					.attr("cx",0)
					.attr("r","0.4em")
					.on('mouseover', function(d){
						d3.select(this).style('cursor', 'pointer');
					})
					.attr('stroke', 'black')
					.style('stroke-width', 1)
					.style("fill",function(d) { return d.value.color })
					.on("click", function (d){
						var button = d3.select(this);
						var elm = $scope.dot.selectAll('.'+d.key);
						if (isHidden(d.key)) {
							button
								.transition()
								.style("opacity", 0.5)
								.style('stroke-width', 0)
								.duration(300);
							elm
								.transition()
								.style('visibility', 'hidden')
								.duration(300);
						} else {
							button
								.transition()
								.style("opacity", 1)
								.style('stroke-width', 1)
								.duration(300);
							elm
								.transition()
								.style('visibility', 'visible')
								.duration(300);
						}
					});

				// Reposition and resize the box
				var lbbox = li[0][0].getBBox()
				lb.attr("x",(lbbox.x-legendPadding))
					.attr("y",(lbbox.y-legendPadding))
					.attr("height",(lbbox.height+2*legendPadding))
					.attr("width",(lbbox.width+2*legendPadding))
			  })
			  return g
			}
			})();
			(function() {
				d3.fisheye = {
					scale: function(scaleType) {
						return d3_fisheye_scale(scaleType(), 3, 0);
					},
					circular: function() {
						var radius = 200,
							distortion = 2,
							k0,
							k1,
							focus = [0, 0];
						function fisheye(d) {
							var dx = d.x - focus[0],
							dy = d.y - focus[1],
							dd = Math.sqrt(dx * dx + dy * dy);
							if (!dd || dd >= radius) return {x: d.x, y: d.y, z: 1};
							var k = k0 * (1 - Math.exp(-dd * k1)) / dd * .75 + .25;
							return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
						}
						function rescale() {
							k0 = Math.exp(distortion);
							k0 = k0 / (k0 - 1) * radius;
							k1 = distortion / radius;
							return fisheye;
						}
						fisheye.radius = function(_) {
							if (!arguments.length) return radius;
							radius = +_;
							return rescale();
						};
						fisheye.distortion = function(_) {
							if (!arguments.length) return distortion;
							distortion = +_;
							return rescale();
						};
						fisheye.focus = function(_) {
							if (!arguments.length) return focus;
							focus = _;
							return fisheye;
						}
						return rescale();
					}
				};
				function d3_fisheye_scale(scale, d, a) {
					function fisheye(_) {
						var x = scale(_),
						left = x < a,
						range = d3.extent(scale.range()),
						min = range[0],
						max = range[1],
						m = left ? a - min : max - a;
						if (m == 0) m = max - min;
						return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
					}
					fisheye.distortion = function(_) {
						if (!arguments.length) return d;
						d = +_;
						return fisheye;
					};
					fisheye.focus = function(_) {
						if (!arguments.length) return a;
						a = +_;
						return fisheye;
					};
					fisheye.copy = function() {
						return d3_fisheye_scale(scale.copy(), d, a);
					};
					fisheye.nice = scale.nice;
					fisheye.ticks = scale.ticks;
					fisheye.tickFormat = scale.tickFormat;
					return d3.rebind(fisheye, scale, "domain", "range");
				}
			})();
			// !D3 FISHEYE PLUGIN
			$scope.$on('buildFishChart', function (event, data){
				console.log(data)
				var margin = {top: 5.5, right: 19.5, bottom: 30.5, left: 55.5};
				var width = document.getElementById('fishchart').offsetWidth-60;
				var height = (width / 2.25) - margin.top - margin.bottom;

				$('#fishchart').parent().height(height);

				$scope.xScale = d3.fisheye.scale(d3.time.scale).domain([new Date(moment.unix(data.xAxis[0])), new Date(moment.unix(data.xAxis[1]+3600))]).range([0, width]);
				$scope.yScale = d3.fisheye.scale(d3.scale.linear).domain([0-(data.yAxis*0.17), data.yAxis+(data.yAxis*0.17)]).range([height, 0]);
				$scope.radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]);
				$scope.maxnum = data.yAxis;
				$scope.scale = function(position) {
					// position will be between 0 and 100
					var minp = 0;
					var maxp = data.maxIOC;

					// The result should be between 100 an 10000000
					var minv = Math.log(1);
					var maxv = Math.log(1);

					// calculate adjustment factor
					var scale = (maxv-minv) / (maxp-minp);

					return Math.exp(minv + scale*(position-minp));
				}
				$scope.zoomSlider = function(count) {
					if (count < 1000){
						return count*0.0000002*((data.xAxis[1]-data.xAxis[0]));
					} else {
						return 0.30;
					}
				}

				// The x & y axes.
				// var $scope.xAxis = d3.svg.axis().orient("bottom").scale($scope.xScale).tickFormat(d3.format(",d")).tickSize(-height),
				$scope.xAxis = d3.svg.axis().orient("bottom").scale($scope.xScale).tickSize(-height);
				$scope.yAxis = d3.svg.axis().scale($scope.yScale).orient("left").tickSize(-width);

				// Create the SVG container and set the origin.
				$scope.svg = d3.select("#fishchart").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				// Add a background rect for mousemove.
				$scope.svg.append("rect")
					.attr("class", "background")
					.attr("width", width)
					.attr("height", height);

				// Add the x-axis.
				$scope.svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call($scope.xAxis);

				// Add the y-axis.
				$scope.svg.append("g")
					.attr("class", "y axis")
					.call($scope.yAxis);

				// Add tooltip
				$scope.tip = d3.tip()
					.attr('class', 't-tip')
					.offset([-50, 0])
					.html(function(d) {
						return "<strong>Connection Type: </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + d.class.toUpperCase() + "</span><br />"+
							"<strong>Connection Count: </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + d.data.length + "</span><br />"+
							"<strong>IOC Hits </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + d.ioc_hits + "</span><br />"+
							"<strong>Date: </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + moment(d.time).format('MMMM Do YYYY, h:mm:ss a') + "</span>";
					});

				$scope.svg.call($scope.tip);

				// Add an x-axis label.
				$scope.svg.append("text")
					.attr("class", "x label")
					.attr("text-anchor", "end")
					.attr("x", width - 6)
					.attr("y", height - 6)
					.text("Time");

				// Add a y-axis label.
				$scope.svg.append("text")
					.attr("class", "y label")
					.attr("text-anchor", "end")
					.attr("x", -6)
					.attr("y", 6)
					.attr("dy", ".75em")
					.attr("transform", "rotate(-90)")
					.text("Number of connections.");
			})

			$scope.$on('fishChart', function (event, dataset) {
				var transitions = [];
				dataset.forEach(function(d){
					d.time = new Date(moment.unix(d.time));
					var trans = d.data.length +","+ d.time;
					function checkDup(vals) {
						if (transitions.indexOf(vals) !== -1) {
							// change value and check again
							var tr = vals.split(',');
							var oldtime = new Date(tr[1]);
							var newtime = new Date(oldtime.getTime() + 5*60000);
							tr[1] = newtime.toString();
							trans = tr[0]+','+tr[1];
							checkDup(trans);
						} else {
							var tr = trans.split(',');
							d.time = new Date(tr[1]);
							transitions.push(trans);
						}
					}
					checkDup(trans);
				})
				var gType = 'default';
				function x(d) { return d.time; }
				function y(d) {
					return d.data.length;
				}
				function scale(d) {
					if (d.ioc_hits === 0){
						return 1;
					} else {
						return $scope.scale(d.ioc_hits);
					}
				}
				var transitions = [];
				function rPosition(dot) {
					dot.attr("transform", function(d) {return "translate(" + $scope.xScale(x(d)) +","+ $scope.yScale(y(d)) + ")scale("+scale(d)+")";})
				}
				$scope.colorScale = function(cClass) {
					switch (cClass) {
						case 'http':
							return "#A70101";
						case 'ssl':
							return "#FFFFFF";
						case 'file': // extracted files
							return "#74BAE6";
						case 'dns': // new dns
							return "#CF1125";
						case 'conn': //first seen
							return "#BEDB39";
						case 'conn_ioc':
							return "#004358";
						case 'http_ioc':
							return "#1F8A70";
						case 'ssl_ioc':
							return "#FF85AA";
						case 'file_ioc':
							return "#FF5347";
						case 'dns_ioc':
							return "#FD7400";
						case 'endpoint':
							return "#0E0E0D";
						default: //endpoint events
							return "#0E0E0D";
					}
				}
				$scope.dot = $scope.svg.append("g")
					.attr("class", "dots")
					.selectAll(".dot")
					.data(dataset)
					.enter().insert('g')
					.sort(function(a, b) { return scale(b) - scale(a); })
					.each(function(d){
						var elm = d3.select(this)
						// console.log(elm[0][0].__data__)

						if ((d.class === 'file_ioc') || (d.class === 'conn_ioc') || (d.class === 'dns_ioc') || (d.class === 'http_ioc') || (d.class === 'ssl_ioc')) {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z M5.133,26.932'+
									'L18.155,3.067l13.022,23.865H5.133z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
						if (d.class === 'file') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18'+
									'S27.941,0,18,0z M7.828,23.787l-2.104-11.42c-0.129-1.086,0.214-2.025,1.839-2.025h6.686c0.938,0,1.83,0.566,2.216,1.361'+
									'c0.648,0,8.361,0,8.361,0c0.844,0,1.631,0.449,2.066,1.104H13.702c-1.299,0-1.697,0.528-1.902,1.408'+
									'c-0.141,0.606-2.378,11.309-2.378,11.309C8.619,25.249,7.975,24.584,7.828,23.787z M30.141,23.787L30.141,23.787'+
									'c-0.192,1.051-1.237,1.872-2.383,1.872H11.042l2.414-10.508c0.127-0.642,0.54-1.289,1.562-1.289c0.21,0,14.68,0.037,14.68,0.037'+
									'c1.529-0.051,2.081,0.807,1.843,2.029L30.141,23.787z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
						if (d.class === 'conn') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18c0,9.941,8.059,18,18,18s18-8.059,18-18'+
									'S27.94,0,18,0z M24.286,25.744H10.99v2.766l-7.074-5.344l7.074-5.343v2.767h13.295V25.744z M24.584,16.987v-2.766H11.195V9.065'+
									'h13.389V6.299l7.072,5.344L24.584,16.987z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}

						if (d.class === 'dns') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18s8.059,18,18,18s18-8.059,18-18S27.941,0,18,0z M17.649,4.867'+
									'c2.055,0,3.153,1.38,3.153,2.867c0,1.912-1.559,3.187-3.33,3.187c-1.524,0-3.082-1.31-3.082-3.116'+
									'C14.391,6.319,15.701,4.867,17.649,4.867z M22.75,28.938h-4.888c-1.488,0-3.366,0.036-4.818,0.036c0-0.957,0-2.019,0.035-2.939'+
									'l1.877-0.07c0.106-0.035,0.142-0.105,0.142-0.177V17.08l-2.267-0.106c0-0.956,0.035-2.054,0.071-3.009'+
									'c1.913-0.142,7.652-0.956,7.935-0.956c0.071,0,0.071,0.036,0.071,0.106c-0.036,3.823-0.106,9.275-0.106,12.814L22.75,26V28.938z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}

						if (d.class === 'http') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18c0,9.94,8.059,17.999,18,17.999c9.941,0,18-8.059,18-17.999'+
									'C36,8.059,27.941,0,18,0z M27.793,26.411l-1.666,1.26c0,0-2.006,2.999-2.128,2.76c-0.122-0.238-2.368,3.555-2.368,3.555'+
									'l-1.312,0.626L20.294,32.5l0.87-4.386l0.152-2.001l-0.997-1.243l-1.169-1.996l0.306-1.775l0.284-1.404l-1.085-0.519'+
									'c0,0-1.937-1.668-1.964-1.598c-0.03,0.076-1.767-0.569-1.767-0.569l-0.869-1.03l-1.58-2.279l0.69,1.864l-0.223-0.177l-1.694-2.577'+
									'l-1.009-1.316L9.933,9.094L8.454,7.527L6.39,6.284l2.52-2.607l5.925,0.655l2.325-0.627l1.243,1.128l-1.97,1.563l2.202,0.934'+
									'l1.132,1.183l0.484-1.202l-0.435-0.958l0.406-0.595l1.405,0.351l0.33,0.526l0.912-0.226l1.899,1.777l-0.728,0.568l-1.984,0.284'+
									'l0.738,0.368l0.73,0.7l-1.412,0.156l-1.396,1.011l-0.496,1.458l-0.856,0.556l0.326,1.964l-0.446-0.086l-0.806-1.629l-0.918,0.51'+
									'l-1.108-0.081l-0.896,1.048l0.724,1.616l1.692-0.593l-0.31,1.146l1.062,0.325l-0.076,0.868l1.614,0.856l1.051-0.856l1.384,0.478'+
									'l2.057,1.123l1.156,1.465l2.883,1.775L27.793,26.411z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
						// if (d.class === 'ssl') {
						// 	elm
						// 		.append('g')
						// 	elm.append('svg:path')
						// 		.attr('d', 'M18.184,8.753c-3.191,0-4.661,2.373-4.661,4.968'+
						// 			'c0,0.003,0,0.005,0,0.008v2.412h9.397v-2.412c0-0.003,0-0.005,0-0.008C22.92,11.126,21.315,8.753,18.184,8.753z');
						// 	elm.append('svg:path')
						// 		.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18'+
						// 			'S27.941,0,18,0z M27.076,27.9H9.291V16.141h1.508v-2.674c0-0.003,0-0.006,0-0.009c0-4.064,3.295-7.359,7.359-7.359'+
						// 			'c4.062,0,7.359,3.294,7.359,7.359c0,0.003-0.002,0.005-0.002,0.009h0.002v2.674h1.559V27.9z');
						// 	elm.attr("class", "dot "+d.class)
						// 		.style("fill", function(d) { return $scope.colorScale(d.class); })
						// 		.call(rPosition)
						// 		.on('mouseover', $scope.tip.show)
						// 		.on('mouseout', $scope.tip.hide)
						// 		.attr("data-legend", function(d) { return d.class})
						// 		.on("click", function (d){
						// 			$scope.open(d);
						// 		});
						// }
						if (d.class === 'ssl') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18'+
									'S27.941,0,18,0z M27.076,27.9H9.291V16.141h1.508v-2.674c0-0.003,0-0.006,0-0.009c0-4.064,3.295-7.359,7.359-7.359'+
									'c4.062,0,7.359,3.294,7.359,7.359c0,0.003-0.002,0.005-0.002,0.009h0.002v2.674h1.559V27.9z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
						if (d.class === 'endpoint') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18s8.059,18,18,18s18-8.06,18-18'+
									'S27.941,0,18,0z M29.886,23.201c0,0.685-0.554,2.238-1.236,2.238h-7.529l1.09,3.468v0.494h-8.42v-0.494l1.09-3.468H7.351'+
									'c-0.684,0-1.238-0.554-1.238-1.238V9.837c0-0.684,0.554-1.238,1.238-1.238H28.65c0.683,0,1.236,0.554,1.236,1.238V23.201z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
					})
				// $scope.dot.selectAll("path").each( function(d, i){
				// 	// if(d.someId == targetId){
				// 		console.log( d3.select(this).attr("d") );
				// 	// }
				// })
				$scope.svg.on("mousemove", function() {
					$scope.mouse = d3.mouse(this);
					$scope.xScale.distortion($scope.zoomSlider($scope.maxnum)).focus($scope.mouse[0]);
					$scope.yScale.distortion($scope.zoomSlider($scope.maxnum)).focus($scope.mouse[1]);

					$scope.dot.selectAll('path').call(rPosition);
					$scope.svg.select(".x.axis").call($scope.xAxis);
					$scope.svg.select(".y.axis").call($scope.yAxis);
				});
				// Add legend
				$scope.legend = $scope.svg.append("g")
					.attr("class","legend")
					.attr("transform","translate(50,30)")
					.style("font-size","12px")
					.call(d3.legend);
				$scope.legend
					.style("font-size","17px")
					.attr("data-style-padding",10)
					.call(d3.legend)
					.style('fill', 'none')
			})
		}
	};
}]);
