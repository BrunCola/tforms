'use strict';

angular.module('mean.pages').directive('makeSankeyNew', ['$timeout', '$location', '$rootScope', '$http', '$modal', function ($timeout, $location, $rootScope, $http, $modal) {
	return {
		link: function ($scope, element, attrs) {

			d3.sankey = function() {
				var sankey = {},
					nodeWidth = 24,
					nodePadding = 8,
					size = [1, 1],
					nodes = [],
					links = [];

				sankey.nodeWidth = function(_) {
					if (!arguments.length) return nodeWidth;
					nodeWidth = +_;
					return sankey;
				};

				sankey.nodePadding = function(_) {
					if (!arguments.length) return nodePadding;
					nodePadding = +_;
					return sankey;
				};

				sankey.nodes = function(_) {
					if (!arguments.length) return nodes;
					nodes = _;
					return sankey;
				};

				sankey.links = function(_) {
					if (!arguments.length) return links;
					links = _;
					return sankey;
				};

				sankey.size = function(_) {
					if (!arguments.length) return size;
					size = _;
					return sankey;
				};

				sankey.layout = function(iterations) {
					computeNodeLinks();
					//computeNodeValues();  //we skip this.  The node value is the total components of the node and is provided in the data
					computeNodeBreadths();  //x position (horizontal).  No change 
					computeNodeDepths(iterations); //no change
					computeLinkDepths();
					return sankey;
				};

				sankey.relayout = function() {
					computeLinkDepths();
					return sankey;
				};

				sankey.link = function() {
					var curvature = .5;

					function link(d) {
						var x0 = d.source.x + d.source.dx,
						x1 = d.target.x,
						xi = d3.interpolateNumber(x0, x1),
						x2 = xi(curvature),
						x3 = xi(1 - curvature),
						y0 = d.source.y + d.sy,
						y1 = d.target.y + d.ty,
						y2 = d.source.y + d.sy + d.dy,
						y3 = d.target.y + d.ty + d.dyTarget;
						return "M" + x0 + "," + y0
							+ "C" + x2 + "," + y0
							+ " " + x3 + "," + y1
							+ " " + x1 + "," + y1
							+ "L" + x1 + "," + y3
							+ "C" + x3 + "," + y3
							+ " " + x2 + "," + y2
							+ " " + x0 + "," + y2
							;
					}

					link.curvature = function(_) {
						if (!arguments.length) return curvature;
						curvature = +_;
						return link;
					};

					return link;
				};

				// Populate the sourceLinks and targetLinks for each node.
				// Also, if the source and target are not objects, assume they are indices.
				function computeNodeLinks() {
					nodes.forEach(function(node) {
						node.sourceLinks = [];
						node.targetLinks = [];
					});
					links.forEach(function(link) {
						var source = link.source,
						target = link.target;
						if (typeof source === "number") source = link.source = nodes[link.source];
						if (typeof target === "number") target = link.target = nodes[link.target];
						source.sourceLinks.push(link);
						target.targetLinks.push(link);
					});
				}

				// Compute the value (size) of each node by summing the associated links.
				function computeNodeValues() {
					nodes.forEach(function(node) {
						node.value = Math.max(
							d3.sum(node.sourceLinks, value),
							d3.sum(node.targetLinks, value)
						);
					});
				}

				// Iteratively assign the breadth (x-position) for each node.
				// Nodes are assigned the maximum breadth of incoming neighbors plus one;
				// nodes with no incoming links are assigned breadth zero, while
				// nodes with no outgoing links are assigned the maximum breadth.
				function computeNodeBreadths() {
					var remainingNodes = nodes,
					nextNodes,
					x = 0;

					while (remainingNodes.length) {
						nextNodes = [];
						remainingNodes.forEach(function(node) {
							node.x = x;
							node.dx = nodeWidth;
							node.sourceLinks.forEach(function(link) {
								nextNodes.push(link.target);
							});
						});
						remainingNodes = nextNodes;
						++x;
					}

					//
					moveSinksRight(x);
					scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
				}

				function moveSourcesRight() {
					nodes.forEach(function(node) {
						if (!node.targetLinks.length) {
							node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
						}
					});
				}

				function moveSinksRight(x) {
					nodes.forEach(function(node) {
						if (!node.sourceLinks.length) {
							node.x = x - 1;
						}
					});
				}

				function scaleNodeBreadths(kx) {
					nodes.forEach(function(node) {
						node.x *= kx;
					});
				}

				function computeNodeDepths(iterations) {
					var nodesByBreadth = d3.nest()
						.key(function(d) { return d.x; })
						.sortKeys(d3.ascending)
						.entries(nodes)
						.map(function(d) { return d.values; });

					//
					initializeNodeDepth();
					resolveCollisions();
					for (var alpha = 1; iterations > 0; --iterations) {
						relaxRightToLeft(alpha *= .99);
						resolveCollisions();
						relaxLeftToRight(alpha);
						resolveCollisions();
					}

					function initializeNodeDepth() {
						var ky = d3.min(nodesByBreadth, function(nodes) {
							return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
						});

						nodesByBreadth.forEach(function(nodes) {
							nodes.forEach(function(node, i) {
								node.y = i;
								node.dy = node.value * ky * node.scale;
							});
						});

						links.forEach(function(link) {
							link.dy = link.value * ky * link.source.scale;
							link.dyTarget = link.targetCount * ky * link.target.scale;
						});
					}

					function relaxLeftToRight(alpha) {
						nodesByBreadth.forEach(function(nodes, breadth) {
							nodes.forEach(function(node) {
								if (node.targetLinks.length) {
									var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, targetValue);
									node.y += (y - center(node)) * alpha;
								}
							});
						});

						function weightedSource(link) {
							return center(link.source) * link.value;
						}
					}

					function relaxRightToLeft(alpha) {
						nodesByBreadth.slice().reverse().forEach(function(nodes) {
							nodes.forEach(function(node) {
								if (node.sourceLinks.length) {
									var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
									node.y += (y - center(node)) * alpha;
								}
							});
						});

						function weightedTarget(link) {
							return center(link.target) * link.value;
						}
					}

					function resolveCollisions() {
						nodesByBreadth.forEach(function(nodes) {
							var node,
							dy,
							y0 = 0,
							n = nodes.length,
							i;

							// Push any overlapping nodes down.
							nodes.sort(ascendingDepth);
							for (i = 0; i < n; ++i) {
								node = nodes[i];
								dy = y0 - node.y;
								if (dy > 0) node.y += dy;
								y0 = node.y + node.dy + nodePadding;
							}

							// If the bottommost node goes outside the bounds, push it back up.
							dy = y0 - nodePadding - size[1];
							if (dy > 0) {
								y0 = node.y -= dy;

								// Push any overlapping nodes back up.
								for (i = n - 2; i >= 0; --i) {
									node = nodes[i];
									dy = node.y + node.dy + nodePadding - y0;
									if (dy > 0) node.y -= dy;
									y0 = node.y;
								}
							}
						});
					}

					function ascendingDepth(a, b) {
						return a.y - b.y;
					}
				}

				function computeLinkDepths() {
					nodes.forEach(function(node) {
						node.sourceLinks.sort(ascendingTargetDepth);
						node.targetLinks.sort(ascendingSourceDepth);
					});
					nodes.forEach(function(node) {

						//source
						var lastY = 0;
						var grossHeight = 0;
						node.sourceLinks.forEach(function(link) {
							grossHeight += link.dy;
							lastY = link.dy;
						});
						grossHeight = grossHeight - lastY;
						var coverageHeight = node.dy * node.coverageCount / node.value - lastY;

						var sy = 0, ty = 0;
						node.sourceLinks.forEach(function(link) {
							link.sy = sy;
							sy += link.dy * coverageHeight / grossHeight;
						});
						var maxHeight = node.dy * node.coverageCount / node.value;
						node.sourceLinks.forEach(function(link) {
							if (link.sy + link.dy > maxHeight) {
								link.sy  = maxHeight - link.dy;
							}
						});

						//target
						lastY = 0;
						grossHeight = 0;
						node.targetLinks.forEach(function(link) {
							grossHeight += link.dyTarget;
							lastY = link.dyTarget;
						});
						grossHeight = grossHeight - lastY;
						var utilizationHeight = node.dy * node.utilizationCount / node.value - lastY;
						var factor = utilizationHeight / grossHeight;
						node.targetLinks.forEach(function(link) {
							link.ty = ty;      
							ty += link.dyTarget * factor;
						});
						maxHeight = node.dy * node.utilizationCount / node.value;
						node.targetLinks.forEach(function(link) {
							if (link.ty + link.dyTarget > maxHeight) {
								link.ty  = maxHeight - link.dyTarget;
							}
						});

					});

					function ascendingSourceDepth(a, b) {
						return a.source.y - b.source.y;
					}

					function ascendingTargetDepth(a, b) {
						return a.target.y - b.target.y;
					}
				}

				function center(node) {
					return node.y + node.dy / 2;
				}

				function value(link) {
					return link.value;
				}

				function targetValue(link) {
					return link.targetCount;
				}

				function dy(link) {
					return link.dy;
				}

				return sankey;
			};

			$scope.$on('sankey_new', function (event, graph, params) {
				$timeout(function () { // You might need this timeout to be sure its run after DOM render

					function logslider(x) {
						var minp = 0;
						var maxp = graph.totalCount;
						// The result should be between 100 an 10000000
						var minv = Math.log(1);
						var maxv = Math.log(100);
						// calculate adjustment factor
						var scale = (maxv-minv) / (maxp-minp);
						return Math.exp(minv + scale*(x-minp));
					}

					var width = document.getElementById('sankey_new').offsetWidth;
							// height = params["height"];

					//var dataUrl = "nodes.json";
					var unit = "components";
					var margin = {top: 10, right: 10, bottom: 10, left: 10};
					//width = 960 - margin.left - margin.right,
					var height = width/2;

					var formatNumber = d3.format(",.0f"),
					format = function(d) { return formatNumber(d) + " "+unit; },
					color = d3.scale.category20();

					var svg = d3.select("#sankey_new").append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					var sankey = d3.sankey()
						.nodeWidth(36)
						.nodePadding(10)
						.size([width, height]);

					var path = sankey.link();

					//d3.json("energy.json", function(energy) {
					// d3.json(dataUrl, function(energy) {
						
					sankey
					  .nodes(graph.nodes)
					  .links(graph.links)
					  .layout(32);

					var link = svg.append("g").selectAll(".link")
					  .data(graph.links)
					.enter().append("path")
					  .attr("class", "link")
					  .attr("d", path)
					  .style("stroke-width", 1)
					  .sort(function(a, b) { return b.dy - a.dy; });

					link.append("title")
					  .text(function(d) { return d.source.name + " â†’ " + d.target.name + "\n" + format(d.value); });

					var node = svg.append("g").selectAll(".node")
					  .data(graph.nodes)
					.enter().append("g")
					  .attr("class", "node")
					  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.call(d3.behavior.drag()
					  .origin(function(d) { return d; })
					  .on("dragstart", function() { this.parentNode.appendChild(this); })
					  .on("drag", dragmove));

					node.append("rect")
					  .attr("height", function(d) { return d.dy; })
					  .attr("width", sankey.nodeWidth())
					  .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
					  .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
					.append("title")
					  .text(function(d) { return d.name + "\n" + format(d.value); });

					node.append("text")
					  .attr("x", -6)
					  .attr("y", function(d) { return d.dy / 2; })
					  .attr("dy", ".35em")
					  .attr("text-anchor", "end")
					  .attr("transform", null)
					  .text(function(d) { return d.name; })
					.filter(function(d) { return d.x < width / 2; })
					  .attr("x", 6 + sankey.nodeWidth())
					  .attr("text-anchor", "start");

					link.on("click", function(d){ 
						window.showAlert(d.source.name + "->"+d.target.name);
					});

					// the function for moving the nodes
					function dragmove(d) {
						d3.select(this).attr("transform",
							"translate(" + (
								 d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
							) + "," + (
										 d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
							) + ")");
						sankey.relayout();
						link.attr("d", path);
					}

				}, 0, false);
			})
		}
	};
}]);
