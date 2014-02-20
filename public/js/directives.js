'use strict';

angular.module('mean.iochits').directive('makeTable', ['$timeout', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('tableLoad', function () {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
                	var arr = $scope.data.tables[0].aaData;
                	$(element).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="example" ></table>');
                    $('#example').dataTable({
						"aaData": arr,
						"aoColumns": $scope.data.tables[0].params,
						"bDeferRender": true
						//"bDestroy": true,
						//"bProcessing": true,
						//"bRebuild": true,
						//"aaSorting": true,
						//"bFilter": true,
						//"bPaginate": true,
						//"iDisplayLength": 50
					});
                }, 0, false);
            })
        }
    };
}]);

//sevChart function
angular.module('mean.system').directive('makeSevChart', ['$timeout', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('sevChart', function () {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
                	//var arr = $scope.data.tables[0].aaData;
                	console.log('sevchart broadcast recieved');
                	var cf_data = crossfilter($scope.data.crossfilter); // feed it through crossfilter
					var all = cf_data.groupAll();

					var dimension = cf_data.dimension(function(d) { return d.hour });
					var group = cf_data.dimension(function(d) { return d.hour }).group();

					var sevChart = dc.barChart('#sevchart');

					var connVsTime = group.reduce(
						function(p, v) {
							if (v.ioc_severity === "1") {
								p.guarded += v.count;
							}
							if (v.ioc_severity === "2") {
								p.elevated += v.count;
							}
							if (v.ioc_severity === "3") {
								p.high += v.count;
							}
							if (v.ioc_severity === "4") {
								p.severe += v.count;
							}
							if (v.ioc_severity === null) {
								p.other += v.count;
							}
							return p;
						},
						function(p, v) {
							if (v.ioc_severity === "1") {
								p.guarded -= v.count;
							}
							if (v.ioc_severity === "2") {
								p.elevated -= v.count;
							}
							if (v.ioc_severity === "3") {
								p.high -= v.count;
							}
							if (v.ioc_severity === "4") {
								p.severe -= v.count;
							}
							if (v.ioc_severity === null) {
								p.other -= v.count;
							}
							return p;
						},
						function() {
							return {
								guarded:0,
								elevated:0,
								high:0,
								severe:0,
								other:0
							};
						}
					);
					var start = 1388552400;
					var end = 1391230740;
					//var width = $("#"+divID).width();
					var hHeight;
					// if(height !== undefined) {
					// 	hHeight = height;
					// } else {
					// 	hHeight = width/3.3; //4.6 as default
					// }
					sevChart
						.width(600) // (optional) define chart width, :default = 200
						.height(300)
						.transitionDuration(500) // (optional) define chart transition duration, :default = 500
						.margins({top: 10, right: 30, bottom: 25, left: 43}) // (optional) define margins
						.dimension(dimension) // set dimension
						//.group(group[g]) // set group
						.group(connVsTime, "(1) Guarded")
						.valueAccessor(function(d) {
							return d.value.guarded;
						})
						.stack(connVsTime, "(2) Elevated", function(d){return d.value.elevated;})
						.stack(connVsTime, "(3) High", function(d){return d.value.high;})
						.stack(connVsTime, "(4) Severe", function(d){return d.value.severe;})
						//.stack(connVsTime, "0 - Other", function(d){return d.value.other;})
						.colors(["#377FC7","#F5D800","#F88B12","#DD122A","#000"])
						.xAxisLabel('teest') // (optional) render an axis label below the x axis
						.yAxisLabel('teest') // (optional) render a vertical axis lable left of the y axis
						.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
						.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
						.x(d3.time.scale().domain([moment.unix(start), moment.unix(end)])) // define x scale
						.xUnits(d3.time.hours) // define x axis units
						.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
						.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
						//.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
						.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
						.renderTitle(true) // (optional) whether chart should render titles, :default = false
					dc.renderAll();





                }, 0, false);
            })
        }
    };
}]);

angular.module('mean.system').directive('makeRowChart', ['$timeout', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('rowChart', function () {
            	console.log('rowchart broadcast recieved');
                $timeout(function () { // You might need this timeout to be sure its run after DOM render
                	console.log($scope.data);
                	var cf_data = crossfilter($scope.data.crossfilter); // feed it through crossfilter
					var all = cf_data.groupAll();

					var dimension = cf_data.dimension(function(d) { return d.ioc });
					var group = dimension.group().reduceSum(function(d) { return d.count });

					var rowChart = dc.rowChart('#rowchart');

					var sevCount = group.reduce(
						function (d, v) {
						//++d.count;
						d.severity = v.ioc_severity - 1;
						d.count += v.count;
						return d;
					},
					/* callback for when data is removed from the current filter results */
					function (d, v) {
						//--d.count;
						d.severity = v.ioc_severity - 1;
						d.count -= v.count;
						return d;
					},
					/* initialize d */
					function () {
						return {count: 0, severity: 0};
					});
					var tops = sevCount.order(function (p) {return p.count;}).top(1);
					var numberFormat = d3.format(",f");
					function logFormat(d) {
						var x = Math.log(d) / Math.log(10) + 1e-6;
						return Math.abs(x - Math.floor(x)) < 0.3 ? numberFormat(d) : "";
					}
					// var hHeight, lOffset;
					// if (colors.length < 7) {
					// 	lOffset = 17+(colors.length*0.2);
					// 	hHeight = 25+(colors.length*35);
					// } 
					// else if (colors.length >= 7) {
					// 	lOffset = 12.7+(colors.length*0.2);
					// 	hHeight = 25+(colors.length*28);
					// }
					// var fill;
					// var width = $("#"+divID).width();
					rowChart
						.width(500)
						//.height(width/2 + barExpand)
						.height(500)
						.margins({top: 5, left: 0, right: 0, bottom: 20})
						.group(sevCount)
						.dimension(dimension)
						.colors(["#377FC7","#F5D800","#F88B12","#DD122A"])
						.valueAccessor(function(d) {
							return d.value.count+0.1;
						})
						.colorAccessor(function (d){return d.value.severity;})
						.renderLabel(true)
						.label(function(d) { return d.key+' ('+d.value.count+')'; })
						//.labelOffsetY(lOffset) //lOffset
						.elasticX(false)
						.x(d3.scale.log().domain([1, tops[0].value.count+0.1]).range([0,500])) //500 ->width
						.xAxis()
						.scale(rowChart.x())
						.tickFormat(logFormat);
		                }, 0, false);
		            })
		        }
		    };
}]);

angular.module('mean.system').directive('makeTable', ['$timeout', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('tableLoad', function () {
                $timeout(function () { // You might need this timeout to be sure its run after DOM render

                	var numberFormat = d3.format(".2f");
					var dimension = data.dimension(function (d) {
						return d.remote_country;
					});
					var countryCount = dimension.group().reduceSum(function (d) {
						return d.count;
					});
					var top = countryCount.orderNatural(function (p) {return p.count;}).top(1);
					var numberOfItems = top[0].value+1;
					var rainbow = new Rainbow();
					rainbow.setNumberRange(0, numberOfItems);
					rainbow.setSpectrum("#FF0000", "#CC0000", "#990000", "#660000", "#360000");
					// var cc = [];
					// for (var i = 1; i <= numberOfItems; i++) {
					// 	var hexColour = rainbow.colourAt(i);
					// 	cc.push('#' + hexColour);
					// }
					var width = $("#"+divID).width();
					var height = width/1.4;
					// var minhits = function (d) { return d.value.min; };
					// var maxhits = function (d) { return d.value.max; };
					geoChart
						.dimension(dimension)
						.group(countryCount)
						.projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 0.3 / Math.PI).translate([width / 2, width / 2]))
						.width(width)
						.height(width/1.4)
						.colors(cc)
						.colorCalculator(function (d) { return d ? geoChart.colors()(d) : '#ccc'; })
						.overlayGeoJson(world.features, "country", function(d) {
							return d.properties.name;
						})
						.title(function (d) {
							return d.key+": "+(d.value ? d.value : 0);
						});

                }, 0, false);
            })
        }
    };
}]);