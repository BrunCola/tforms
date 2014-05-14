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
				var margin = {top: 5.5, right: 19.5, bottom: 30.5, left: 55.5};
				var width = document.getElementById('fishchart').offsetWidth-60;
				var height = (width / 2.25) - margin.top - margin.bottom;

				$('#fishchart').parent().height(height);

				$scope.xScale = d3.fisheye.scale(d3.time.scale).domain([new Date(moment.unix(data.xAxis[0])), new Date(moment.unix(data.xAxis[1]+3600))]).range([0, width]);
				$scope.yScale = d3.fisheye.scale(d3.scale.linear).domain([0-(data.yAxis*0.07), data.yAxis+(data.yAxis*0.07)]).range([height, 0]);
				$scope.radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]);
				$scope.maxnum = data.yAxis;
				$scope.scale = function(position) {
					// position will be between 0 and 100
					var minp = 0;
					var maxp = data.maxIOC;

					// The result should be between 100 an 10000000
					var minv = Math.log(0.5);
					var maxv = Math.log(2);

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
				dataset.forEach(function(d){
					d.time = new Date(moment.unix(d.time));
				})
				var gType = 'default';
				function x(d) { return d.time; }
				function y(d) {
					switch(gType) {
						case 'default':
							return d.data.length;
						case 'other':
							return (d.data.length)+50;
					}
				}
				function scale(d) {
					if (d.ioc_hits === 0){
						return 0.5;
					} else {
						return $scope.scale(d.ioc_hits);
					}
				}
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
							elm.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
						if ((d.class === 'file_ioc') || (d.class === 'conn_ioc') || (d.class === 'dns_ioc') || (d.class === 'http_ioc') || (d.class === 'ssl_ioc')) {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M18,0L0,32.986h36L18,0z M19.999,12.758l-0.756,11.56h-3.285'+
									'l-0.756-11.56H19.999z M19.47,28.751h-3.64v-3.142h3.64V28.751z')
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
								.attr('d', 'M13.598,4.188h22.413c-0.741-1.113-2.078-1.875-3.512-1.875'+
									'c0,0-13.106,0-14.207,0C17.635,0.961,16.12,0,14.526,0H3.165C0.406,0-0.176,1.595,0.042,3.441l3.575,19.406'+
									'c0.25,1.354,1.343,2.483,2.708,2.948c0,0,3.803-18.185,4.042-19.215C10.714,5.086,11.392,4.188,13.598,4.188z M40.778,6.045'+
									'c0,0-24.588-0.062-24.946-0.062c-1.734,0-2.438,1.099-2.652,2.189L9.08,26.027h28.403c1.946,0,3.723-1.396,4.05-3.18l-0.002,0.008'+
									'l0.002-0.009l2.377-13.354C44.314,7.417,43.376,5.959,40.778,6.045z')
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
								.attr('d', 'M36.761,0H1.424C0.637,0,0,0.637,0,1.422v27.154'+
									'C0,29.363,0.637,30,1.424,30h35.337c0.785,0,1.42-0.637,1.42-1.424V1.422C38.181,0.637,37.546,0,36.761,0z M26.735,23.604H11.439'+
									'v2.766l-7.074-5.344l7.074-5.344v2.768h15.296V23.604z M27.034,14.846V12.08h-15.39V6.924h15.39V4.158l7.072,5.344L27.034,14.846z')
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
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18c0,9.941,8.059,18,18,18c9.94,0,18-8.059,18-18C36,8.059,27.94,0,18,0z'+
									'M17.649,4.867c2.054,0,3.151,1.38,3.151,2.867c0,1.912-1.558,3.187-3.328,3.187c-1.524,0-3.082-1.31-3.082-3.116'+
									'C14.391,6.319,15.701,4.867,17.649,4.867z M22.75,28.938h-4.888c-1.488,0-3.366,0.036-4.818,0.036c0-0.956,0-2.019,0.035-2.938'+
									'l1.878-0.07c0.106-0.035,0.142-0.106,0.142-0.178V17.08l-2.268-0.106c0-0.956,0.035-2.054,0.071-3.009'+
									'c1.913-0.142,7.651-0.956,7.935-0.956c0.071,0,0.071,0.036,0.071,0.106c-0.035,3.823-0.107,9.274-0.107,12.814L22.75,26V28.938z')
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
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18C0,27.941,8.059,36,18,36C27.941,36,36,27.941,36,18C36,8.059,27.941,0,18,0z'+
									'M27.793,26.412l-1.666,1.26c0,0-2.006,2.998-2.128,2.76c-0.122-0.239-2.368,3.554-2.368,3.554l-1.312,0.626L20.294,32.5l0.87-4.385'+
									'l0.152-2.002l-0.997-1.242l-1.169-1.996l0.306-1.775l0.284-1.404l-1.085-0.52c0,0-1.937-1.668-1.964-1.598'+
									'c-0.03,0.076-1.767-0.569-1.767-0.569l-0.869-1.03l-1.58-2.279l0.69,1.864l-0.223-0.177l-1.694-2.577l-1.009-1.316L9.933,9.094'+
									'L8.454,7.527L6.39,6.284l2.52-2.607l5.925,0.655l2.325-0.627l1.243,1.128l-1.97,1.563l2.202,0.934l1.132,1.183l0.484-1.202'+
									'l-0.435-0.958l0.406-0.595l1.405,0.351l0.33,0.526l0.912-0.226l1.899,1.777l-0.728,0.568l-1.984,0.284l0.738,0.368l0.73,0.7'+
									'l-1.412,0.156l-1.396,1.011l-0.496,1.458l-0.856,0.556l0.326,1.964l-0.446-0.086l-0.806-1.629l-0.918,0.51l-1.108-0.081'+
									'l-0.896,1.048l0.724,1.616l1.692-0.593l-0.31,1.146l1.062,0.325l-0.076,0.868l1.614,0.857l1.051-0.857l1.384,0.478l2.057,1.122'+
									'l1.156,1.466l2.883,1.775L27.793,26.412z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
						if (d.class === 'ssl') {
							elm
								.append('svg:path')
								.attr("class", "dot "+d.class)
								.style("fill", function(d) { return $scope.colorScale(d.class); })
								.call(rPosition)
								.attr('d', 'M26.795,16.582v-4.416h-0.002c0-0.005,0.002-0.009,0.002-0.014C26.795,5.44,21.353,0,14.643,0'+
									'C7.931,0,2.49,5.44,2.49,12.152c0,0.005,0,0.009,0,0.014v4.416H0V36h29.368V16.582H26.795z M22.507,12.599v3.983H6.988v-3.983'+
									'c0-0.005,0-0.008,0-0.013c0-4.286,2.427-8.204,7.696-8.204c5.171,0,7.822,3.918,7.822,8.204'+
									'C22.507,12.59,22.507,12.594,22.507,12.599z')
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
								.attr('d', 'M37.917,0H2.083C0.933,0,0,0.932,0,2.083V26.25'+
									'c0,1.151,0.933,2.084,2.083,2.084H14.75l-1.833,5.834V35h14.166v-0.832l-1.833-5.834h12.667c1.149,0,2.082-0.933,2.082-2.084V2.083'+
									'C40,0.932,39.067,0,37.917,0z M37.627,22.668H2.561V2.48h35.066V22.668z')
								.on('mouseover', $scope.tip.show)
								.on('mouseout', $scope.tip.hide)
								.attr("data-legend", function(d) { return d.class})
								.on("click", function (d){
									$scope.open(d);
								});
						}
					})
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
