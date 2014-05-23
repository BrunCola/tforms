'use strict';

angular.module('mean.pages').directive('fishGraph', ['$timeout', '$location', '$rootScope', '$http', '$modal', function ($timeout, $location, $rootScope, $http, $modal) {
	return {
		link: function ($scope, element, attrs) {
			$(function() {
				var select = $( "#grouping" );
				$( "#grouping" ).slider({
					min: 0,
					step: 5,
					max: $scope.number,
					range: "min",
					value: $scope.minslider,
					slide: function( event, ui ) {
						if (ui.value < 1){
							ui.value = 1;
						}
						if (ui.value === 1) {
							$( "#count" ).html('Group by: <strong>'+ui.value+'</strong> minute. (Slide bar to change value.)');
						} else {
							$( "#count" ).html('Group by: <strong>'+ui.value+'</strong> minutes. (Slide bar to change value.)');
						}
					},
					change: function(event,ui){

						// REDUNDANT SO MAKE GLOBAL !!!!
						$('.page-content').fadeTo(500, 0.7);
						var target = document.getElementById('loading-spinner');
						var spinner = new Spinner().spin(target);
						$(target).data('spinner', spinner);

						$('#fishchart').empty();
						if (ui.value < 1){
							ui.value = 1;
						}
						$scope.$broadcast('grouping', ui.value);
					}
				});
				$( "#count" ).html('Group by: <strong>1</strong> minute. (Slide bar to change value.)');
			});
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
						return "IOC Hits";
				}
			}
			function colors(title) {
				switch(title){
					case 'http':
						return "#67AAB5";
					case 'ssl':
						return "#A0BB71";
					case 'file': // extracted files
						return "#B572AB";
					case 'dns': // new dns
						return "#708EBC";
					case 'conn': //first seen
						return "#6FBF9B";
					case 'conn_ioc':
						return "#EFAA86";
					case 'http_ioc':
						return "#FFF2A0";
					case 'ssl_ioc':
						return "#D97373";
					case 'file_ioc':
						return "#F68D55";
					case 'dns_ioc':
						return "#F3BD5D";
					case 'endpoint':
						return "#7E9E7B";
					default: //endpoint events
						return "#D8464A";
				}
			}
			// fisheye function
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
			$scope.point = function(element, nickname, title, dType) {
				if (nickname.search("ioc") !== -1) {
					element.attr('class', 'ioc');
					element = element.append('g');
					element.append('svg:path')
						.attr('transform', 'translate(-18,-18)')
						.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z')
						.attr('fill', colors(nickname));
					element.append('svg:polygon')
						.attr('transform', 'translate(-18,-18)')
						.attr('points', '18.155,3.067 5.133,26.932 31.178,26.932 ')
						.attr('fill', '#595A5C');
					element.append('svg:polygon')
						.attr('transform', 'translate(-18,-18)')
						.attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
						.attr('fill', colors(nickname));
					element.append('rect')
						.attr('transform', 'translate(-18,-18)')
						.attr('x', 16.376)
						.attr('y', 22.045)
						.attr('fill', colors(nickname))
						.attr('width', 2.838)
						.attr('height', 2.448);
					if(dType === 'legend') {
						element.append('text')
							.text(title)
							.attr('fill', '#7f7f7f')
							.attr('transform', 'translate(-23,32)');
					}
					return;
				} else {
					element.attr('class', nickname);
					element = element.append('g');
					switch(nickname){
						case 'file':
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z')
								.attr('fill', '#B572AB');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M13.702,12.807h13.189c-0.436-0.655-1.223-1.104-2.066-1.104c0,0-7.713,0-8.361,0'+
									'c-0.386-0.796-1.278-1.361-2.216-1.361H7.562c-1.625,0-1.968,0.938-1.839,2.025l2.104,11.42c0.146,0.797,0.791,1.461,1.594,1.735'+
									'c0,0,2.237-10.702,2.378-11.308C12.005,13.334,12.403,12.807,13.702,12.807z')
								.attr('fill', '#595A5C');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M29.697,13.898c0,0-14.47-0.037-14.68-0.037c-1.021,0-1.435,0.647-1.562,1.289l-2.414,10.508h16.716'+
									'c1.146,0,2.19-0.821,2.383-1.871l1.399-7.859C31.778,14.706,31.227,13.848,29.697,13.898z')
								.attr('fill', '#595A5C');
							if(dType === 'legend') {
								element.append('text')
									.text(title)
									.attr('fill', '#7f7f7f')
									.attr('transform', 'translate(-11,32)');
							}
							return;
						case 'conn':
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18c0,9.94,8.059,18,18,18s18-8.06,18-18C36,8.059,27.94,0,18,0z')
								.attr('fill', '#6FBF9B');
							element.append('svg:polygon')
								.attr('transform', 'translate(-18,-18)')
								.attr('points', '24.585,6.299 24.585,9.064 11.195,9.064 11.195,14.221 24.585,14.221 24.585,16.986 31.658,11.643 ')
								.attr('fill', '#595A5C');
							element.append('svg:polygon')
								.attr('transform', 'translate(-18,-18)')
								.attr('points', '10.99,17.822 3.916,23.166 10.99,28.51 10.99,25.744 24.287,25.744 24.287,20.59 10.99,20.59 ')
								.attr('fill', '#595A5C');
							if(dType === 'legend') {
								element.append('text')
									.text(title)
									.attr('fill', '#7f7f7f')
									.attr('transform', 'translate(-31,32)');
							}
							return;
						case 'dns':
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18,0C8.059,0,0,8.059,0,18s8.059,18,18,18s18-8.059,18-18S27.941,0,18,0z')
								.attr('fill', '#708EBC');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M20.909,13.115c0-0.07,0-0.106-0.071-0.106c-0.283,0-6.022,0.813-7.935,0.956'+
									'c-0.036,0.955-0.071,2.053-0.071,3.009l2.267,0.106v8.707c0,0.071-0.035,0.143-0.142,0.178l-1.877,0.07'+
									'c-0.035,0.92-0.035,1.982-0.035,2.938c1.452,0,3.33-0.036,4.818-0.036h4.888V26l-1.949-0.07'+
									'C20.801,22.39,20.874,16.938,20.909,13.115z')
								.attr('fill', '#595A5C');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M17.473,10.921c1.771,0,3.329-1.274,3.329-3.187c0-1.486-1.098-2.867-3.152-2.867'+
									'c-1.948,0-3.259,1.451-3.259,2.938C14.391,9.611,15.949,10.921,17.473,10.921z')
								.attr('fill', '#595A5C');
							if(dType === 'legend') {
								element.append('text')
									.text(title)
									.attr('fill', '#7f7f7f')
									.attr('transform', 'translate(-13,32)');
							}
							return;
						case 'http':
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18,0C8.059,0,0,8.06,0,18.001C0,27.941,8.059,36,18,36c9.94,0,18-8.059,18-17.999C36,8.06,27.94,0,18,0z')
								.attr('fill', '#67AAB5');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
									'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
									'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
									'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
									'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
									'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
									'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
									'l0.959-3.195l-2.882-1.775L24.715,19.976z')
								.attr('fill', '#595A5C');
							if(dType === 'legend') {
								element.append('text')
									.text(title)
									.attr('fill', '#7f7f7f')
									.attr('transform', 'translate(-16,32)');
							}
							return;
						case 'ssl':
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18,0C8.06,0,0,8.059,0,18s8.06,18,18,18c9.941,0,18-8.059,18-18S27.941,0,18,0z')
								.attr('fill', '#A0BB71');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M25.518,13.467h-0.002c0-0.003,0.002-0.006,0.002-0.008c0-4.064-3.297-7.359-7.359-7.359'+
									'c-4.064,0-7.359,3.295-7.359,7.359c0,0.002,0,0.005,0,0.008v2.674H9.291V27.9h17.785v-11.76h-1.559V13.467z')
								.attr('fill', '#595A5C');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18.184,8.754c-3.191,0-4.661,2.372-4.661,4.967'+
									'c0,0.004,0,0.006,0,0.008v2.412h9.397v-2.412c0-0.002,0-0.004,0-0.008C22.92,11.126,21.315,8.754,18.184,8.754z')
								.attr('fill', '#A0BB71');
							if(dType === 'legend') {
								element.append('text')
									.text(title)
									.attr('fill', '#7f7f7f')
									.attr('transform', 'translate(-5.5,32)');
							}
							return;
						case 'endpoint':
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M18,0C8.059,0,0,8.06,0,18c0,9.941,8.059,18,18,18c9.94,0,18-8.059,18-18C36,8.06,27.94,0,18,0z')
								.attr('fill', '#7E9E7B');
							element.append('svg:path')
								.attr('transform', 'translate(-18,-18)')
								.attr('d', 'M28.649,8.6H7.351c-0.684,0-1.238,0.554-1.238,1.238v14.363c0,0.684,0.554,1.238,1.238,1.238h7.529'+
									'l-1.09,3.468v0.495h8.419v-0.495l-1.09-3.468h7.529c0.684,0,1.237-0.555,1.237-1.238V9.838C29.887,9.153,29.333,8.6,28.649,8.6z'+
									'M28.477,22.072H7.635V10.074h20.842V22.072z')
								.attr('fill', '#595A5C');
							if(dType === 'legend') {
								element.append('text')
									.text(title)
									.attr('fill', '#7f7f7f')
									.attr('transform', 'translate(-24,32)');
							}
							return;
					}
				}
			}
			// !D3 FISHEYE PLUGIN
			$scope.$on('buildFishChart', function (event, data){
				var margin = {top: 5.5, right: 19.5, bottom: 30.5, left: 55.5};
				var width = document.getElementById('fishchart').offsetWidth-60;
				var height = (width / 3) - margin.top - margin.bottom;

				$('#fishchart').parent().height(height+150);

				$scope.xScale = d3.fisheye.scale(d3.time.scale).domain([new Date(moment.unix(data.xAxis[0])), new Date(moment.unix(data.xAxis[1]+3600))]).range([0, width]);
				$scope.yScale = d3.fisheye.scale(d3.scale.linear).domain([0-(data.yAxis*0.07), data.yAxis+1+(data.yAxis*0.07)]).range([height, 0]);
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
					.attr("height", height + margin.top + margin.bottom + 100)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				// Add a background rect for mousemove.
				$scope.svg.append("rect")
					.attr("class", "background")
					.attr("width", width)
					.attr("height", height+100);

				//////////////////////
				/////// LEGEND ///////
				//////////////////////
				$scope.legendHolder = $scope.svg.append('g').attr('class', 'legend');
				var pIoc = $scope.legendHolder.append('g');
				var pFile = $scope.legendHolder.append('g');
				var pConn = $scope.legendHolder.append('g');
				var pDns = $scope.legendHolder.append('g');
				var pHttp = $scope.legendHolder.append('g');
				var pSsl = $scope.legendHolder.append('g');
				var pEndpoint = $scope.legendHolder.append('g');
				var legendPoints = [
					{
						element: pEndpoint,
						nickname: 'endpoint',
						title: titles('endpoint')
					},
					{
						element: pIoc,
						nickname: 'ioc',
						title: titles('ioc')
					},
					{
						element: pFile,
						nickname: 'file',
						title: titles('file')
					},
					{
						element: pConn,
						nickname: 'conn',
						title: titles('conn')
					},
					{
						element: pDns,
						nickname: 'dns',
						title: titles('dns')
					},
					{
						element: pHttp,
						nickname: 'http',
						title: titles('http')
					},
					{
						element: pSsl,
						nickname: 'ssl',
						title: titles('ssl')
					}
				];
				for (var i in legendPoints) {
					$scope.point(legendPoints[i].element, legendPoints[i].nickname, legendPoints[i].title, 'legend');
				}

				var margin = 70;
				var totalItems = legendPoints.length;
				var center = (width/2) - ((totalItems*margin)/2) + 18; //width of legend holder which is margins*items. 18 adjusts for center of icons
				var pointCount = 0;
				var y = height + 39;
				var x = center - margin; //move group to center, countering the original margin far left
				$scope.legendHolder.selectAll('g').select('g').each(function(d){
					var elm = d3.select(this);
					pointCount++;
					var x = margin*pointCount;
					elm.attr('transform', 'translate('+x+',0)')
				});
				$scope.legendHolder.attr('transform', 'translate('+x+','+y+')')

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
						return "<strong>Connection Type: </strong> <span style='color:"+colors(d.class)+"'>" + titles(d.class).toUpperCase() + "</span><br />"+
							"<strong>Connection Count: </strong> <span style='color:"+colors(d.class)+"'>" + d.data.length + "</span><br />"+
							"<strong>IOC Hits </strong> <span style='color:"+colors(d.class)+"'>" + d.ioc_hits + "</span><br />"+
							"<strong>Date: </strong> <span style='color:"+colors(d.class)+"'>" + moment.unix(d.roundedtime).format('MMMM Do YYYY, h:mm:ss a') + "</span>";
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
				$scope.$broadcast('spinnerHide');
				var mouseover = [null, null];
				var transitions = [];
				$scope.pTypes = [];
				dataset.forEach(function(d){
					var tClass = d.class
					if (d.class.search('ioc') !== -1) {
						tClass = 'ioc';
					}
					if ($scope.pTypes.indexOf(tClass) === -1) {
						$scope.pTypes.push(tClass);
					}
					d.roundedtime = d.time;
					d.time = new Date(moment.unix(d.time));
					d.duplicate = false;
					var trans = d.data.length +","+ d.time;
					d.id = trans; // duplicates should now share the same original trans value
					function checkDup(vals) {
						if (transitions.indexOf(vals) !== -1) {
							// change value and check again
							var tr = vals.split(',');
							var oldtime = new Date(tr[1]);
							var newtime = new Date(oldtime.getTime() + 5*60000);
							tr[1] = newtime.toString();
							trans = tr[0]+','+tr[1];
							d.duplicate = true;
							checkDup(trans);
						} else {
							var tr = trans.split(',');
							d.time = new Date(tr[1]);
							transitions.push(trans);
						}
					}
					checkDup(trans);
				})
				function x(d) {
					return d.time;
				}
				function y(d) {
					return d.data.length;
				}
				function scale(d) {
					return 0.8;
				}
				function rPosition(dot) {
					dot.each(function(d){
					var elm = d3.select(this)
						// check if its not the item being moused over but blending time and count into string
						if ('time-'+d.roundedtime+'count-'+d.data.length !== 'time-'+mouseover[0]+'count-'+mouseover[1]) {
							elm.attr("transform", function(d) { return "translate(" + $scope.xScale(x(d)) +","+ $scope.yScale(y(d)) + ")scale("+scale(d)+")";})
						}
					});
				}

				// hover-over spread function
				var hoverCount = 1;
				function pointTranslate(count, total) {
					if (total > 1) {
						if (total%2 !== 0){
						}
						var h = 20, x, y;
						var segment, fraction;
						// if odd total
						if (total%2 !== 0){
							segment = 180 / (total+1);
							fraction = segment*count;
						} else {
						// if even total
							segment = 180 / (total+2);
							fraction = segment*count;
							if (fraction >= 90) {
								fraction += segment;
							}
						}
						// some conversion for D3 - just pass it fractions up to 180
						if (fraction === 90) {
							y = h;
							x = 0;
						} else if (fraction < 90) {
							y = Math.sin(fraction)*h;
							x = Math.cos(fraction)*h;
						} else {
							fraction = 180 - fraction;
							if (fraction < 0) {
								fraction *= -1;
							}
							y = Math.sin(fraction)*h;
							x = Math.cos(fraction)*h;
							x *= -1;
						}
						if (y < 0){
							y *= -1;
						}
						hoverCount ++;
						return {
							x: x,
							y: y
						}
					}
				}

				$scope.dot = $scope.svg.append("g")
					.attr("class", "dots")
					.selectAll(".dot")
					.data(dataset)
					.enter().insert('g')
					.sort(function(a, b) { return scale(b) - scale(a); })
					.each(function(d){
						var elm = d3.select(this).append('g').attr('class','point').call(rPosition);
						$scope.point(elm, d.class);
						// although the function above assignes a class, re-assign each item with time and count
						elm.attr('class', d.class+' time-'+d.roundedtime.toString()+'count-'+d.data.length)
						elm
							.style("fill", function(d) { return colors(d.class); })
							.on('mouseover', $scope.tip.show)
							.on('mouseout', $scope.tip.hide)
							.attr("data-legend", function(d) { return d.class})
							.on("click", function (d){
								$scope.open(d);
							});
						elm
							// append invisible circle over points for mouse selection
							.append('circle')
							.attr('r', 18)
							.attr('opacity', 0)
							.on('mouseover', function(d) {
								// assign values to mouseover array on mouseOver
								mouseover[0] = d.roundedtime;
								mouseover[1] = d.data.length;
								// on mouseover, grab the classes that match the time and count blended into a string
								var elm = $scope.dot.selectAll('g .time-'+d.roundedtime.toString()+'count-'+d.data.length);
								// get count of elements moused over
								var elmCount = $.grep(elm, function(e){ return e[0] !== undefined; });
								// continue with .each statement
								elm.each(function(d){
								var elm = d3.select(this.parentNode);
									if (elmCount.length > 1) {
										var trans = pointTranslate(hoverCount, elmCount.length);
										// elm
										// 	.transition().duration(100)
										// 	.attr('transform', function(d) { return 'translate('+trans.x+','+(-1*trans.y)+')';})
									}
								})
							})
							.on('mouseout', function(d){
								// remove values from mouseover array on mouseOut
								mouseover[0] = null;
								mouseover[1] = null;
								hoverCount = 1;
								// on mouseover, grab the classes that match the time and count blended into a string
								var elm = $scope.dot.selectAll('g .time-'+d.roundedtime.toString()+'count-'+d.data.length);
								// get count of elements moused over
								var elmCount = $.grep(elm, function(e){ return e[0] !== undefined; });
								// continue with .each statement
								elm.each(function(d){
									var elm = d3.select(this.parentNode);
									if (elmCount.length > 1) {
										elm
											.transition().duration(100)
											.attr('transform', function(d) { return 'translate(0,0)';})
									}
								})
							})
						})
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

				// LEGEND STUFF
				$scope.legendHolder.selectAll('g').each(function(d){
					var par = d3.select(this);
					var pclass = par.attr('class');
					var elm = par.select('g');
					var countArr;
					if (pclass !== null) {
						if (pclass.search('ioc') === -1) {
							countArr = $.grep(dataset, function(e){ return e.class == pclass; });
						} else {
							countArr = $.grep(dataset, function(e){ return e.class.search('ioc') !== -1; });
						}
					}
					var tcount = 0;
					for(var c in countArr) {
						tcount += countArr[c].data.length;
					}
					if ($scope.pTypes.indexOf(pclass) === -1){
						elm.style("opacity", 0.3);
					} else {
						//center counts
						var textElement = elm.select('text');
						var translatePre = textElement.attr('transform').match(/(-?\d*,-?\d*)\w+/g);
						var translateArr = translatePre[0].split(',');
						var textWidth = parseInt(textElement.style('width').match(/(\d+)/g));
						var textHeight = parseInt(textElement.style('height').match(/(\d+)/g));
						elm
							.append('circle')
							.attr('cx', 0)
							.attr('transform', 'translate(-18,-18)')
							.attr('cy', 0)
							.attr('r', 3)
							.attr('fill', '#72be9b')
							.style("opacity", 0.5);
						elm
							.append('text')
							.attr('class', 'count')
							.text(tcount)
						// centering text n shit
						var countWidth = parseInt(elm.select('.count').style('width').match(/(\d+)/g));
						var marginleft = (textWidth/2) - (countWidth/2) + parseInt(translateArr[0]);
						var margintop = parseInt(translateArr[1]) + textHeight-3;
						elm
							.select('.count')
							.attr('transform', 'translate('+marginleft+','+margintop+')')
							.attr('fill', '#72be9b')
							.style("opacity", 0.5);

						elm
							.style('cursor', 'pointer')
							.on("click", function (d){
							var button = d3.select(this);
							var elm = $scope.dot.selectAll('.'+pclass);
							if (isHidden(pclass)) {
								button
									.transition()
									.style("opacity", 0.5)
									.style('stroke-width', 0)
									.duration(150);
								elm
									.transition()
									.style('visibility', 'hidden')
									.duration(150);
							} else {
								button
									.transition()
									.style("opacity", 1)
									.style('stroke-width', 1)
									.duration(150);
								elm
									.transition()
									.style('visibility', 'visible')
									.duration(150);
							}
						})
					}
				});
				$scope.svg.on("mousemove", function() {
					$scope.mouse = d3.mouse(this);
					$scope.xScale.distortion($scope.zoomSlider($scope.maxnum)).focus($scope.mouse[0]);
					$scope.yScale.distortion($scope.zoomSlider($scope.maxnum)).focus($scope.mouse[1]);

					$scope.dot.select('g').call(rPosition);
					$scope.svg.select(".x.axis").call($scope.xAxis);
					$scope.svg.select(".y.axis").call($scope.yAxis);
				});
			})
		}
	};
}]);
