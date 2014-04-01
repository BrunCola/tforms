'use strict';

angular.module('mean.system').directive('makeMap', ['$timeout', '$location', '$routeParams', '$rootScope', '$http', function ($timeout, $location, $routeParams, $rootScope, $http) {
	return {
		link: function ($scope, element, attrs) {
			$scope.$on('map', function (event, data) {
				/*Tooltip showing address info*/
				var tooltip = d3.select("#map")
					.append("div")
					.attr("class", "tooltip")
					.style("position", "absolute")
					.style("z-index", "60")
					// .style("visibility", "hidden")
					.text("tooltip");

				/*Initialize Leaflet Map*/
				var map = new L.Map("map", {
					center: [51.505, -0.09],
					minZoom: 2,
					zoom: 2
				})
				// .addLayer(new L.TileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png"));
				.addLayer(new L.TileLayer("https://ssl_tiles.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/59870/256/{z}/{x}/{y}.png"));
				// .addLayer(new L.TileLayer("http://{s}.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png"));

				/* Initialize the SVG layer */
				map._initPathRoot()

				/* Pass map SVG layer to d3 */
				var svg = d3.select("#map").select("svg"),
				g = svg.append("g");

				/*Animation Timing Variables*/
				// var startingTime = 86166720000;
				var startingTime;
				// var step = 1500000000; // 17 days
				var step = 1000; // 1 second
				var maxTime;
				var timer;
				var isPlaying = false;
				var counterTime = startingTime;

				function loadData(data) {
					/*Load data file from cartoDB and initialize coordinates*/
					var cumEvictions = 0;
					var startingTime = moment(data.features[0].properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000;
					var maxTime = moment(data.features[data.features.length-1].properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000;
					counterTime = startingTime;
					data.features.forEach(function(d) {
						d.LatLng = new L.LatLng(d.geometry.coordinates[1],d.geometry.coordinates[0]);
						cumEvictions += d.properties.units;
						d.properties.totalEvictions = cumEvictions;
					});

					/*Add an svg group for each data point*/
					var node = g.selectAll(".node").data(data.features).enter().append('g')
					.each(function(d) {
						var parentt = d3.select(this);
						// d.properties.severity = 1;
						if (d.properties.severity === 0){
							// console.log('test')
							parentt.append("circle")
							.attr("r", 25)
							.attr("class",  "center")
							.style("stroke", function(d) {
								// if (d.properties.type == "OMI"){
								// return "#606";
								// } else if(d.properties.type == "DEMO"){
								// return "#066";
								// }
								return "#f30";
							});
						} else if ('properties' in d){
							parentt.append("g").attr('transform', 'scale(0.4)')
								.append('g')
								.attr("transform", "translate(15,-200)")
								.append('svg:path')
								.attr('d', 'M8.09-224.929 '+
									'C-13.491-93.344-86.594-49.482-129.756,23.621c-9.923,19.925-15.32,42.241-15.32,65.793c0,84.739,72.053,153.516,160.826,153.516 '+
									'c88.78,0,160.826-68.777,160.826-153.516c0-23.566-5.382-45.867-15.32-65.793C118.094-49.482,44.991-93.344,8.09-224.929z '+
									'M88.853,96.724c0,40.349-32.754,73.103-73.103,73.103s-73.103-32.753-73.103-73.103c0-40.35,32.754-73.103,73.103-73.103 '+
									'S88.853,56.374,88.853,96.724z')
								.attr('transform', "rotate(180)")
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
								})
						}
					});

					/*show node info on mouseover*/
					node
						.on("mouseover", function(d) {
							var fullDate = d.properties.date_filed;
							var thisYear = moment(fullDate,"YYYY-MM-DD hh:mm:ss").year();
							var currMonth = moment(fullDate,"YYYY-MM-DD hh:mm:ss").month()+1;
							var currDay = moment(fullDate,"YYYY-MM-DD hh:mm:ss").date();
							var units = d.properties.units;
							var unitText = units + " eviction";
							if(units > 1){
								unitText = units + " evictions"
							}
							var dateString = currMonth+"/"+currDay + "/"+thisYear;
							// $(".tooltip").html(d.properties.country+ "<br>"+unitText+"<br>"+dateString);
							$(".tooltip").html(d.properties.country);
							return tooltip.style("visibility", "visible");
						})
						.on("mousemove", function(){
							return tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
						})
						.on("click", function(d){
							tooltip.text(d.properties.country);
							return tooltip.style("visibility", "visible");
						})
						.on("mouseout", function(){
							return tooltip.style("visibility", "hidden");
						});

					filterCurrentPoints();
					map.on("zoomend", update);
					update();
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
							return moment(d.properties.date_filed,"YYYY-MM-DD hh:mm:ss").unix()*1000 > counterTime-1001
						})
						point
							.append("circle")
							.attr("r", 4)
							// .style("fill","red")
							.style("fill-opacity", 0.9)
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
								if (d.properties.severity >= 1) {return 50000 }
								else { return 5000};
							})
							.ease(Math.sqrt)
							.style("opacity", 0)
							.remove();
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
							// document.getElementById('counter').innerHTML =totalEvictions + " ";
							// currDate = new Date(counterTime).getFullYear();
							// var currMonth = new Date(counterTime).getMonth()+1;
							// var currDay = new Date(counterTime).getDate();
							// document.getElementById('date').innerHTML = "3/27/2014 - " + currMonth+"/"+currDay + "/"+currDate;
						}

						/*Update slider*/
						// function playAnimation(){
							// console.log(startingTime);
							// counterTime = startingTime;
							// counterTime = maxTime;
							// console.log(counterTime+','+maxTime)
							// if (counterTime >= maxTime) {
							// 	$( "#slider" ).slider( "value", startingTime);
							// }
							isPlaying = true;
						function stepUp() {
							counterTime += step;
							// $( "#slider" ).slider( "value", counterTime);
							filterCurrentPoints();
							if (counterTime >= maxTime) {
								// alert('http request')
								// stopAnimation();
								clearInterval(timer);
								var urltime = Math.round(maxTime /1000);
								var endtime = maxTime+300000;
								var urltime2 = Math.round(endtime /1000);
								var url = '/map?start='+urltime+'&end='+urltime2;
								console.log(url);
								$http({method: 'GET', url: url}).
									success(function(data) {
										console.log(data);
										checkData(data.map);
								});
							}
						}
						// stepUp();
						timer = window.setInterval(stepUp, 1000);

						/*Scale dots when map size or zoom is changed*/
						function update() {
							var up = map.getZoom()/13;
							node.attr("transform", function(d) {return "translate(" +  map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y + ") scale("+up+")"});
						}

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
				function checkData(data) {
					if (data.features.length === 0) {
						console.log('No data to display, waiting 5 minutes');
						setTimeout(function(data){
							checkData(data);
						}, 300000); // wait 5 minutes
					} else {
						loadData(data);
					}
				}
				checkData(data);
			});
		}
	};
}]);
