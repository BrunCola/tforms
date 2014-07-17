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

					node.each(function(d){
						var elm = d3.select(this);
						switch (d.type) {
							case 'stealth':
								elm.append("rect")
									.attr("height", function(d) { return d.dy; })
									.attr("width", sankey.nodeWidth())
									.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
									.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
									.append("title")
									.text(function(d) { return d.name + "\n" + format(d.value); });
								
								var text =  elm.append("text")
									.attr("x", -6)
									.attr("y", function(d) { return d.dy / 2; })
									.attr("dy", ".35em")
									.attr("text-anchor", "end")
									.attr("transform", null)
									.text(function(d) { return d.name; })
									.filter(function(d) { return d.x < width / 2; })
									.attr("x", 6 + sankey.nodeWidth())
									.attr("text-anchor", "start");

								var viz = elm.append('g')
									.attr('transform', function(d) { 
										var width = parseInt(text.style('width').match(/(\d+)/g));
										return 'translate('+(20 + sankey.nodeWidth() + width)+','+(d.dy / 2)+')scale(0.5)'; 
									})
	
								viz.append('circle')
									.attr('transform', 'translate(-18,-18)')
									.attr('fill', function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
									.attr('cx', 18)
									.attr('cy', 18)
									.attr('r', 18);
								viz.append('svg:path')
									.attr('transform', 'translate(-18,-18)')
									.attr('fill', '#58595B')
									.attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
										'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
										'C28.014,15.545,26.676,21.468,23.587,26.751z')
								viz.append('svg:path')
									.attr('transform', 'translate(-18,-18)')
									.attr('fill', function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
									.attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
										'C11.076,16.238,11.938,20.26,13.699,23.661z')
								return;
							case 'cleartext':
								elm.append("rect")
									.attr("height", function(d) { return d.dy; })
									.attr("width", sankey.nodeWidth())
									.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
									.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
									.append("title")
									.text(function(d) { return d.name + "\n" + format(d.value); });
	
								var text = elm.append("text")
									.attr("x", -6)
									.attr("y", function(d) { return d.dy / 2; })
									.attr("dy", ".35em")
									.attr("text-anchor", "end")
									.attr("transform", null)
									.text(function(d) { return d.name; })
									.filter(function(d) { return d.x < width / 2; })
									.attr("x", 6 + sankey.nodeWidth())
									.attr("text-anchor", "start");

								var viz = elm.append('g')
									.attr('transform', function(d) { 
										// var width = parseInt(text.style('width').match(/(\d+)/g));
										return 'scale(0.5)'; 
									})
								viz.append('svg:path')
									.attr('transform', 'translate(0,-18)')
									.attr('d', 'M18,0C8.059,0,0,8.06,0,18.001C0,27.941,8.059,36,18,36c9.94,0,18-8.059,18-17.999C36,8.06,27.94,0,18,0z')
									.attr('fill', '#67AAB5');
								viz.append('svg:path')
									.attr('transform', 'translate(0,-18)')
									.attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
										'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
										'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
										'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
										'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
										'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
										'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
										'l0.959-3.195l-2.882-1.775L24.715,19.976z')
									.attr('fill', '#595A5C');
								return;
							default:
								elm.append("rect")
									.attr("height", function(d) { return d.dy; })
									.attr("width", sankey.nodeWidth())
									.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
									.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
									.append("title")
									.text(function(d) { return d.name + "\n" + format(d.value); });

								elm.append("text")
									.attr("x", -6)
									.attr("y", function(d) { return d.dy / 2; })
									.attr("dy", ".35em")
									.attr("text-anchor", "end")
									.attr("transform", null)
									.text(function(d) { return d.name; })
									.filter(function(d) { return d.x < width / 2; })
									.attr("x", 6 + sankey.nodeWidth())
									.attr("text-anchor", "start");
								return;
						}
					})


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
