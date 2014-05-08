'use strict';

angular.module('mean.pages').directive('fishGraph', ['$timeout', '$location', '$rootScope', '$http', '$modal', function ($timeout, $location, $rootScope, $http, $modal) {
	return {
		link: function ($scope, element, attrs) {
			// D3 FISHEYE PLUGIN
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

				li.selectAll("text")
					.data(items,function(d) { return d.key})
					.call(function(d) { d.enter().append("text")})
					.call(function(d) { d.exit().remove()})
					.attr("y",function(d,i) { return i+"em"})
					.attr("x","1em")
					.style('fill', '#000')
					.text(function(d) { ;return d.key})

				li.selectAll("circle")
					.data(items,function(d) { return d.key})
					.call(function(d) { d.enter().append("circle")})
					.call(function(d) { d.exit().remove()})
					.attr("cy",function(d,i) { return i-0.25+"em"})
					.attr("cx",0)
					.attr("r","0.4em")
					.style("fill",function(d) { console.log(d.value.color);return d.value.color})

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
				var margin = {top: 5.5, right: 19.5, bottom: 20.5, left: 39.5};
				// width = 1560,
				// height = 1000 - margin.top - margin.bottom;

				var width = document.getElementById('fishchart').offsetWidth-60;
				var height = (width / 1.5) - margin.top - margin.bottom;

				$('#fishchart').parent().height(height);

				// Various scales and distortions.
				// d3.time.scale().domain([moment($scope.start), moment($scope.end)])
				// var $scope.xScale = d3.fisheye.scale(d3.time.scale).domain([new Date($scope.start), new Date($scope.end)]).range([0, width]),
				$scope.xScale = d3.fisheye.scale(d3.time.scale).domain([new Date(moment.unix(data.xAxis[0])), new Date(moment.unix(data.xAxis[1]))]).range([0, width]);
				$scope.yScale = d3.fisheye.scale(d3.scale.linear).domain([0-(data.yAxis*0.07), data.yAxis+(data.yAxis*0.07)]).range([height, 0]);
				$scope.radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]);
				$scope.maxnum = data.yAxis;
				$scope.logslider = function(position) {
					// position will be between 0 and 100
					var minp = 0;
					var maxp = data.yAxis;

					// The result should be between 100 an 10000000
					var minv = Math.log(15);
					var maxv = Math.log(70);

					// calculate adjustment factor
					var scale = (maxv-minv) / (maxp-minp);

					return Math.exp(minv + scale*(position-minp));
				}
				$scope.colorScale = function(cClass) {
					switch (cClass) {
						case 'http':
							return "#cb2815";
						case 'ssl':
							return "#e29e23";
						case 'file':
							return "#a3c0ce";
						case 'dns':
							return "#5c5e7d";
						default:
							return "#e3cdc9";
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
					.offset([-10, 0])
					.attr("transform", "translate(30,30)")
					.html(function(d) {
						return "<strong>Connection Type: </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + d.class.toUpperCase() + "</span><br />"+
							"<strong>Connection Count: </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + d.data.length + "</span><br />"+
							"<strong>Date: </strong> <span style='color:"+$scope.colorScale(d.class)+"'>" + moment(d.time).format('MMMM Do YYYY, h:mm:ss a') + "</span>";
					});

				$scope.svg.call($scope.tip);

				// Add legend
				$scope.legend = $scope.svg.append("g")
					.attr("class","legend")
					.attr("transform","translate(50,30)")
					.style("font-size","12px")
					.call(d3.legend);

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

				// dataset.forEach(function(d){
				// 	d.dd = new Date(moment.unix(d.time).format());
				// });
			})

			// Chart dimensions.
			// var button1 = d3.select("#buttons").append("button")
			// 	.html('Test');
			// var button2 = d3.select("#buttons").append("button")
			// 	.html('Test');
			////////////////////////////////////////////////////
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
				function radius(d) {
					switch(gType) {
						case 'default':
							return $scope.logslider(d.data.length);
						case 'other':
							return 20;
					}
				}
				$scope.dot = $scope.svg.append("g")
					.attr("class", "dots")
					.selectAll(".dot")
					.data(dataset)
					.enter().append("circle")
					.attr("class", "dot")
					.style("fill", function(d) { return $scope.colorScale(d.class); })
					.call(position)
					.sort(function(a, b) { return radius(b) - radius(a); })
					.on('mouseover', $scope.tip.show)
					.on('mouseout', $scope.tip.hide)
					.attr("data-legend", function(d) { return d.class})
					.on("click", function (d){
						// $scope.infoAppend(d);
						$scope.open(d);
					});

				// Add a title.
				$scope.dot.append("title")
					.text(function(d) { return d.name; });

				// Positions the dots based on data.
				function position(dot) {
					dot.attr("cx", function(d) { return $scope.xScale(x(d)); })
						.attr("cy", function(d) { return $scope.yScale(y(d)); })
						.attr("r", function(d) { return radius(d); });
				}
				$scope.svg.on("mousemove", function() {
					$scope.mouse = d3.mouse(this);
					$scope.xScale.distortion($scope.maxnum*0.007).focus($scope.mouse[0]);
					$scope.yScale.distortion($scope.maxnum*0.007).focus($scope.mouse[1]);
					// $scope.xScale.distortion(4.5).focus($scope.mouse[0]);
					// $scope.yScale.distortion(4.5).focus($scope.mouse[1]);

					$scope.dot.call(position);
					$scope.svg.select(".x.axis").call($scope.xAxis);
					$scope.svg.select(".y.axis").call($scope.yAxis);
				});
				// setTimeout(function() {
					$scope.legend
						.style("font-size","17px")
						.attr("data-style-padding",10)
						.call(d3.legend)
						.style('fill', 'none')
				// },1000)
				// button1.on("click", function() {
				// 	gType = 'default';
				// 	$scope.dot.transition()
				// 		.attr("r", function(d){ return radius(d); })
				// 		.attr("cy", function(d) { return $scope.yScale(y(d)) });
				// })
				// button2.on("click", function() {
				// 	gType = 'other';
				// 	$scope.dot.transition()
				// 		.attr("r", function(d){ return radius(d); })
				// 		.attr("cy", function(d) { return $scope.yScale(y(d)) });
				// })
			})
		}
	};
}]);
