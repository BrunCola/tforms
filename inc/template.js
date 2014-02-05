var defaultDayRange = 1; //Set default date range for the app
var defaultSearch = 'ioc_hits'; //Set default search for when the raw url is visited
var defaultNotifications = 'ioc_hits'; //Set which query to run when the 'See all Notifications' dropdown is clicked
///////////////////////////////////////////////
/////////     GENERAL FUNCTIONS     ///////////
///////////////////////////////////////////////
var page = function(search_val, type, start, end, clear_b) {
	
	clear_div('page');
	$('#paral').hide();
	$('#head-right').html('');
	$('#dashboard-report-range').hide();
	clear_div('severity');
	clear_div('d3Div');

	var start_get = getURLParameter('start');
	var end_get = getURLParameter('end');
	if (!start && start_get != 'null') {
		start = start_get;
		end = end_get;
	} 
	else if (!start) {
		end = moment().unix();
		start = moment().subtract('days', defaultDayRange).unix();
	}
	var where;
	if (type!='null') { // set &where
		where = '&query='+search_val;
	}
	else {
		where = '';
	}
	var json = "inc/getdata.php?type="+type+where+"&start="+start+"&end="+end;
	var lStore = localStorage.getItem(getURLParameter('type')+'_dDiv');
	d3.json(json+'&getInfo=true', function(data) {
		// CLEAR DIVS/HEADERS BEFORE SETTING CONTENT
		for (var p in data.page.vDiv) {
			$('#page').append('<div id="'+data.page.vDiv[p][0]+'"></div>');
		}

		///////////////////////////////////
		////// Custom REPORT SETTINGS /////
		///////////////////////////////////
		//glossary append 
		if(type === 'ioc_hits_report') {
			d3.json(json+'&getTable=true&dID=table2', function (data) {
				if (data !== undefined) {
					$('#glossary').html('<h2>Glossary</h2>');
				}
				var g = []; var a = []; var prev;
				for (var d in data.aaData) {
					g.push(data.aaData[d].ioc);	
				}
				g.sort();
				for (var f = 0; f < g.length; f++) {
					if ((g[f] !== prev) && (g[f] in glossary)) {
						$('#glossary').append('<h4>'+g[f]+'</h4>');
						$('#glossary').append('<p>'+glossary[g[f]]+'</p>');
					}
					prev = g[f];
				}
			});	
			$('#page').prepend('<p>This report summarizes rapidPHIRE\'s detection of Indicators of Compromise - IOC - (i.e.'+
				' network communications between users and known malicious hosts, files or entities). These events have'+
				' occurred within one or more data network zones within your organization. It should be noted that some'+
				' IOC detection events are merely points of concern (e.g. Tor exit node detected) whereas others can be'+
				' more conclusive in nature and may require immediate remediation (e.g. malicious file downloaded by user).'+
				' The following bar chart below plots the number of unique IOC detection events occurring within one hour'+
				' time-slices inside the date range indicated in the upper right corner of this page.</p>');
			$('#t1').prepend('<p>The tables below are aggregated lists of IOC events, grouped by IOC Name, IOC Type and'+
				' LAN IP / Remote IP pairing. Each row that is displayed may contain one or more distinct connection events.'+
				' A count of unique events is provided. For example, a user may repeatedly browse to a known malvertiser'+
				' website. This activity would be displayed as a single entry showing a count of the number of unique connections'+
				' to that site. Security administrators should access the rapidPHIRE GUI to view any listed IOC event'+
				' records in more detail.</p>');
		}
		// SET HEADERS
		switch (data.page.header) {
			case 'drilldown':
			$('#home').html('<a href="javascript:void(0)" onclick="page(\'top\', \'ioc_hits\', null,null,true);">Home</a>');
			$('#head-right').html('<div class="btn-group"><a class="btn grey" href="#" data-toggle="dropdown">Availabe Widgets <i class="fa fa-angle-down"></i></a><div id="jdash-controls"></div></div>');
			$('#dashboard-report-range').show();
			break;
			case 'users':
			$('#home').html('<a href="javascript:void(0)" onclick="page(\'top\', \'ioc_hits\', null,null,true);">Home</a>');
			$('#head-right').html('<button onclick="$.colorbox({href:\'assets/modals/user.create.php\'});" class="btn dropdown-toggle" data-toggle="dropdown">Create User</button>');
			break;
			case 'reports':
			$('#home').html('<a href="javascript:void(0)" onclick="page(\'top\', \'ioc_hits\', null,null,true);">Home</a>');
			$('#head-right').html('<button onclick="$.colorbox({href:\'assets/modals/reports.create.php\', width:\'550px\', height:\'600px\'});" class="btn dropdown-toggle" data-toggle="dropdown">Add New Report</button>');
			break;
		}
		// SET PAGE TITLE
		$('#graph_title').html(data.page.title);
		// SET SUB HEADING
		if (data.page.subheading) {
			$('#sub_heading').html(data.page.subheading);
		} 
		else {
			$('#sub_heading').html('');
		}
		// SET ACTIVE SIDEBAR
		if (data.page.sidebar) {
			// OPTIONS -> netflow, layer7, web, dns, email, file, ssl, notifications
			$('.page-sidebar-menu :not(.'+data.page.sidebar+')').removeClass('start active');
			$('.page-sidebar-menu li.'+data.page.sidebar).addClass('start active');
			$('#heading_sub', '.page-sidebar-menu li.'+data.page.sidebar).addClass('selected');
		} 
		else {
			$('.page-sidebar-menu li').removeClass('start active');
		}
		// SET BREADCRUMBS
		if (clear_b===true) { // if true, clear breadcrumbs and set new div (for search feilds)
			clear_div('breadhome');
			$('#breadhome').append('<li><i class=\'fa fa-angle-right\'></i><a href="javascript:void(0);" onclick="page(\''+search_val+'\',\''+type+'\',\''+start+'\',\''+end+'\',false);$(this).parent().nextAll().remove();">'+data.page.title+' ('+search_val+')</a></li>');
		} 
		else if (clear_b===false) { // if false, just append new (for digging through the table/calendar)
			$('#breadhome').append('<li><i class=\'fa fa-angle-right\'></i><a href="javascript:void(0);" onclick="page(\''+search_val+'\', \''+type+'\',\''+start+'\',\''+end+'\',false);$(this).parent().nextAll().remove();">'+data.page.title+' ('+search_val+')</a></li>');
		} 
		else if (clear_b===null) { // if false, just append new (for page loads & 'Home' button in breadcrumb)
			clear_div('breadhome');
		}
		// SEVERITY LEVEL INDICATORS
		if (data.page.severity !== undefined) { 
			$('#severity').append('<button onclick="oTable.fnFilter(\'Severity: 1\',null);severityBtn(\'alert1\');" style="min-width:120px" class="severity-btn btn mini alert1 alert"><i class="fa fa-flag"></i> GUARDED -<span id="al1" style="font-weight:bold"> 0 </span></button>');
			$('#severity').append('<button onclick="oTable.fnFilter(\'Severity: 2\',null);severityBtn(\'alert2\');" style="min-width:120px" class="severity-btn btn mini alert2 alert"><i class="fa fa-bullhorn"></i> ELEVATED -<span id="al2" style="font-weight:bold"> 0 </span></button>');
			$('#severity').append('<button onclick="oTable.fnFilter(\'Severity: 3\',null);severityBtn(\'alert3\');" style="min-width:120px" class="severity-btn btn mini alert3 alert"><i class="fa fa-bell"></i> HIGH -<span id="al3" style="font-weight:bold"> 0 </span></button>');
			$('#severity').append('<button onclick="oTable.fnFilter(\'Severity: 4\',null);severityBtn(\'alert4\');" style="min-width:120px" class="severity-btn btn mini alert4 alert"><i class="fa fa-exclamation-circle"></i> SEVERE -<span id="al4" style="font-weight:bold"> 0 </span></button>');
			d3.json(json+'&severity_levels=true', function(levels) {
				for (var s in levels) {
					if (levels[s].ioc_severity === '1') {
						$('#al1').html(' '+levels[s].count+' ');
					}
					if (levels[s].ioc_severity === '2') {
						$('#al2').html(' '+levels[s].count+' ');
					}
					if (levels[s].ioc_severity === '3') {
						$('#al3').html(' '+levels[s].count+' ');
					}
					if (levels[s].ioc_severity === '4') {
						$('#al4').html(' '+levels[s].count+' ');
					}
				}
			});
		}
		// PUSH CUSTOM HTML INTO DIVS
		if (data.html !== null) {
			for (var i = 0; i < data.html.length; i++) {	
				if (data.html[i].heading !== '') {
					$('#'+data.html[i].pID).prepend(
						'<div id="'+data.html[i].dID+'" class="jdash-widget">\n' +
						'<div class="jdash-header">'+data.html[i].heading+'</div>\n' +
						'<div class="row-fluid">\n' +
						'<div class="span12">\n' +						
						'<div class="box-content">\n' +
						'<div style="padding:3px !important;">'+data.html[i].data+'</div>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n'
						);
				}
				else if(data.html[i].bgColor) {
					$('#'+data.html[i].pID).prepend('<div style="margin-left:0;min-height:60px;background-color:'+data.html[i].bgColor+' !important;" id="'+data.html[i].dID+'" class="jdash-widget"><div style="display:none;" class="jdash-header"></div><div style="padding:10px">'+data.html[i].data+'</div></div>');
				}
			}
		}
		// LAUNCH ALL TABLES 
		if (data.table !== undefined) {
			// DIF TABLE FOR REPORT VS WEB
			var j;
			if (/(report)/.test(window.location) !== true ) {
				for (j = 0; j < data.table.length; j++) {
					$('#'+data.table[j].pID).prepend(
						'<div id="'+data.table[j].dID+'" class="jdash-widget">\n' +
						'<div class="jdash-header">'+data.table[j].heading+'</div>\n' +
						'<div class="row-fluid">\n' +
						'<div class="span12">\n' +
						'<div  style="background-color:#FFF;" class="box">\n' +
						'<div class="box-content">\n' +
						'<table width="100%" class="table table-hover '+data.table[j].dID+' '+data.table[j].tClass+'">\n' +
						'<thead><tr class="table_header"></tr></thead>\n' +
						'</table>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n'
						);
				}
			} 
			else {
				for (j = 0; j < data.table.length; j++) {
					$('#'+data.table[j].pID).prepend(
						'<div style="margin-bottom:17px;margin-left:0;" id="'+data.table[j].dID+'" class="jdash-widget ">\n' +
						'<div class="jdash-header">'+data.table[j].heading+'</div>\n' +
						'<div class="row-fluid">\n' +
						'<div style="background-color:#FFF;" class="">\n' +
						'<div class="box-content">\n' +
						'<table class="table report-table '+data.table[j].dID+' '+data.table[j].tClass+'">\n' +
						'<thead><tr></tr></thead>\n' +
						'</table>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n' +
						'</div>\n'
					);
				}
			}
			//INSERT TABLE PAGE BREAKS INTO HTML (this has to happen after the viz divs are created above)
			for (var pb in data.table) {
				if (data.table[pb].pagebreak !== undefined) {
					//alert(data.table[pb].dID)
					//$('#'+data.table[pb].pID).prepend('<div style="page-break-before: always;"></div>');
					//$('#'+data.table[pb].dID).attr('style','page-break-before:always');
					$('<div style="page-break-before: always;"></div>').insertBefore('#'+data.table[pb].pID);
				}
			}
			// TABLE COLUMN GENERATOR
			$('thead').empty();		
			var col = [];
			for (var c = 0; c < data.columns.length; c++) {
				var columns = [];
				for (var dc=0; dc < data.columns[c].length; dc++) {
					var dCol = true;
					if (data.columns[c][dc][2] === 'false') {
						dCol = false;
					}
					if (data.columns[c][dc][1]) { // check for titles
						if (data.columns[c][dc]) { // check for html types
							columns.push({"sTitle": data.columns[c][dc][1], "mData": data.columns[c][dc][0], "sType": "html", "bVisible": dCol });
						} 
						else {
							columns.push({"sTitle": data.columns[c][dc][1], "mData": data.columns[c][dc][0], "sType": 'string-case', "bVisible": dCol });
						}
					}
				}
				// TABLE BUTTON GENERATOR
				if (/(report)/.test(window.location) !== true) {
					switch(type) {
						case 'ioc_hits':
						columns.push({
							"bSortable": false,
							"sWidth": "75px",
							"mData": function(d) {
								var del = "$.get('inc/getdata.php?&archive=true&query="+d.lan_ip+","+d.wan_ip+","+d.remote_ip+","+d.ioc+"', function() {oTable.fnDraw();});";
								return '<button onclick="'+del+'" class="btn mini grey"> Archive</button>';
							}
						});
						break;
						//case 'blacklist_trash':
						//	columns.push({
						//		"bSortable": false,
						//		"sWidth": "75px",
						//		"mData": function(d) {
						//			var restore_row = "$.get('inc/getdata.php?&restore=true&id="+d.main+"', function() {oTable.fnDraw();});";
						//			return '<button onclick="'+restore_row+'" class=" btn mini grey"><i class="fa fa-mail-reply"></i> Restore</button>';
						//		}
						//	});
						// break;
					}
					// buttons for special pages
					switch (data.page.header) {
						case 'users':
						columns.push({
							"bSortable": false,
							"sWidth": "75px",
							"mData": function(d) {
								return "<button onclick=\"$.colorbox({href:'assets/modals/user.params.php?id="+d.id+"'});\" class=\"btn mini grey\"><i class=\"fa fa-trash\"></i> Edit</button>";
							}
						},
						{
							"bSortable": false,
							"sWidth": "75px",
							"mData": function(d) {
								var delete_row = "$.get('inc/getdata.php?&delete_user=true&id="+d.id+"', function() {page('null','manage_users','User Mangement', null, null, null);});";
								return '<button onclick="'+delete_row+'" class="btn mini grey"><i class="fa fa-trash"></i> Delete</button>';
							}
						});
						break;
						case 'reports':
						columns.push({
							"bSortable": false,
							"sWidth": "75px",
							"mData": function(d) {
								var delete_row = "$.get('inc/getdata.php?&delete_cron=true&id="+d.id+"', function() {page('null','get_cron','Report Management', null, null, null);});";
								return '<button onclick="'+delete_row+'" class="btn mini grey"><i class="fa fa-trash"></i> Delete</button>';
							}
						});
						break;
					}
				}
				col[c] = columns;
			}
			tableViz(col, data.table); // FIRE OFF TABLE(S)
		}
		// LOAD ALL VISUALS
		if (data.viz !== undefined) {
			// SET VISABILITY OF DIVS FOR VIZ
			if (!lStore) {
				if (data.viz.crossfilter !== undefined) {
					for (var k in data.viz.crossfilter.disp) {
						var hidden;
						if (data.viz.crossfilter.disp[k].dView == 'false') {
							hidden = ' jdash_hidden';
						} 
						else {
							hidden = '';
						}
						$('#'+data.viz.crossfilter.disp[k].pID).append('<div " id="'+data.viz.crossfilter.disp[k].dID+'" class="jdash-widget'+hidden+'"><div class="jdash-header">'+data.viz.crossfilter.disp[k].heading+'</div></div>');
					}
					crossfilterViz();
				}
				if (data.viz.d3 !== undefined) {
					for (var d in data.viz.d3) {
						//I havent made a hidden switch for this yet because we don't have a use for d3 on anything other than reports at this moment (Jan 7, 2014)
						$('#'+data.viz.d3[d].disp.pID).append('<div " id="'+data.viz.d3[d].disp.dID+'" class="jdash-widget"><div class="jdash-header">'+data.viz.d3[d].disp.heading+'</div></div>');
					}
					d3Viz(data);
				}			
			}
			//stealth is what the d3Div Div is for in the index & report files, all other d3 is handled above
			if (data.viz.d3stealth !== undefined) {
				d3Stealth(data);
			}
		}
		// PUSH SORTABLE VISUALS INTO DIVS
		for (var h in data.page.vDiv) {
			var vInsert = (new Function( "return([" + data.page.vDiv[h][1] + "])" ))();
			$('#'+ data.page.vDiv[h][0]).jDashboard({ storageID: type, columns: vInsert, controls: '#jdash-controls' });
		}
		// IOC information expand text
		$(function() {
			$(".description").each(function(i) {
				len = $(this).text().length;
				if (len > 200) {
					$(this).html($(this).text().substr(0,200)+'... <a href="javascript:void(0);" onclick="dPopup(\''+$(this).text()+'\');" style="text-decoration:none">Read More</a>');
				}
			});
		});
	});
var tableViz = function(columns, data) {
	for(var i=0; i < columns.length; i++) {
		getTable(data[i].dID, json, data[i], columns[i]);
	}
	$(".page-content").fadeTo(500, 1); // return opacity to 1 
	//$(".dc-data-table tbody tr td .trash-row").click(function () {
	//	oTable.fnDeleteRow(this);
	//});
	$('.page-content').activity(false);
};
var crossfilterViz = function() {
	queue()
	.defer(d3.json, json+'&getViz=true&vizType=crossfilter')
	.defer(d3.json, "assets/json/world.json")
	.await(ready);
	function ready(error, data, world) {
			if (data.iTotalDisplayRecords === '0') { // if no data return, call no_fetch to display user message 
				no_fetch();
			} 
			else {
				for (var s = 0; s < data.struct.length; s++) { // Loop for every struct param
					var dimension = {}; // make dimension an object to count up with
					var group = {};
					var width;
					var dim = data.struct[s].dim;
					var grp = data.struct[s].grp;
					for (var x in data.struct[s].dim) {
						dimension[x] = (new Function( "return( function(d) { return d." + dim[x] + " } );" ))();
						var cf_data;
						var mainGroup;
						var mainDimension;
						// TODO // this needs to be moved out of loop and have a statement checking if it's necessary beforehand
						var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
						data.aaData.forEach(function(d) {
							d.dd = dateFormat.parse(d.time);
							d.hour = d3.time.hour(d.dd);
							d.count = +d.count;
						});
						cf_data = crossfilter(data.aaData); // feed it through crossfilter
						var all = cf_data.groupAll();
						for (var g in data.struct[s].grp) {
							if (grp[g] !== '') {
								group[g] = cf_data.dimension(dimension[x]).group().reduceSum((new Function( "return( function(d) { return d." + grp[g] + " } );" ))());
							}
							dc.dataCount("#data-count")
							.dimension(cf_data) // set dimension to all data
							.group(all);
						}

						//COLOR GENERATOR
						var a = [], prev;
						var arr = [];
						//this counts only one of each dimension type returned so the color picker can assign the exct amount
						for (var e in data.aaData) {
							arr.push(data.aaData[e][dim[x]]);
						}
						arr.sort();
						for (var i = 0; i < arr.length; i++ ) {
							if ( arr[i] !== prev ) {
								a.push(arr[i]);
							}
							prev = arr[i];
						}
						var numberOfItems = a.length;
						var rainbow = new Rainbow(); 
						rainbow.setNumberRange(1, a.length+1);
						rainbow.setSpectrum('#ED5314', '#FFB92A', '#FEEB51', '#9BCA3E', '#3ABBC9', '#E6E6E6');
						var cc = [];
						for (var hex = 1; hex <= numberOfItems; hex++) {
							var hexColour = rainbow.colourAt(hex);
							cc.push('#' + hexColour);
						}

						for (var key in data.viz) { // for every key in the viz array, check the graph type against the ones below
							if (key === 'length' || !data.viz.hasOwnProperty(key)) continue;
							var val = data.viz[key];
							
							// GEO CHART
							if ((val.type === 'geo') && (dim[x] === val.dim) && (grp[g] === val.grp)) {
								dcGeoMap(val.dID, cf_data.dimension(dimension[x]), group[g], world);
							}
							// BAR CHART
							if ((val.type === 'bar') && (dim[x] === val.dim) && (grp[g] === val.grp)) {
								dcBarGraph(val.dID, cf_data.dimension(dimension[x]), group[g], start, end, val.xAxis, val.yAxis);
							}
							// SEVERITY STACKED BAR CHART
							if ((val.type === 'severitybar') && (dim[x] === val.dim) && (grp[g] === val.grp)) {
								severityGraph(val.dID, cf_data.dimension(dimension[x]), cf_data.dimension(dimension[x]).group(), start, end, val.xAxis, val.yAxis, val.height);
							}
							////PIE Chart
							if ((val.type === 'pie') && (dim[x] === val.dim) && (grp[g] === val.grp)) {	
								dcPieGraph(val.dID, cf_data.dimension(dimension[x]), cf_data.dimension(dimension[x]).group(), cc);
							}
							// WORDCLOUD
							if ((val.type === 'word') && (dim[x] === val.dim) && (grp[g] === val.grp)) {
								dcWordCloud(val.dID,data);
							}
							// ROW CHART
							if ((val.type === 'row') && (dim[x] === val.dim) && (grp[g] === val.grp)) {
								dcRowGraph(val.dID, cf_data.dimension(dimension[x]), group[g], cc);
							}
							// COMPOSITE CHART
							if ((val.type === 'composite') && (dim[x] === val.dim) && (grp[g] === val.grp)) {
								dcCompositeGraph(val.dID, cf_data.dimension(dimension[x]), cf_data.dimension(dimension[x]).group(), start, end, val.xAxis, val.yAxis);
							}				
						}
					}
				}
				$('.page-content').activity(false);
				$(".page-content").fadeTo(500, 1);
				dc.renderAll();
			}
		}
	};
	var d3Viz = function(data) {
		for (var d in data.viz.d3) {
			if(data.viz.d3[d].disp.type === 'pie') {
				d3PieGraph(data.viz.d3[d].disp.dID, json);
			}
			if(data.viz.d3[d].disp.type === 'd3swimChart') {
				d3swimChart(data.viz.d3[d].disp.dID, json);
			}
		}
	};
	var d3Stealth = function(data) {
		//$('#d3Div').prepend('<ul style="list-style:vertical; font-size: 12pt; margin-left: 20%"><li><div style="float:left;width:15px;height:15px;background-color:#000"></div><span style="float:left"> test</span></li><li><div style="float:left;width:15px;height:15px;background-color:#000"></div><span style="float:left"> test</span></li></ul>');
		var width = $("#d3Div").width(),
		height = width/2;
		var color = d3.scale.category20();
		var svg = d3.select("#d3Div").append("svg")
		.attr("width", width)
		.attr("height", height);
		d3.json(json+'&getViz=true&vizType=d3stealth', function(error, graph) {
			var force = d3.layout.force()
				.charge(-120)
				.linkDistance(50) //default is 30
				.size([width, height])
				.nodes(graph.nodes)
				.links(graph.links)
				.start();
			var link = svg.selectAll(".link")
				.data(graph.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
			var node = svg.selectAll(".node")
				.data(graph.nodes)
				.enter().append("circle")
				.attr("class", "node")
				.attr("r", 10) //default is 5
				.style("fill", function(d) { return color(d.group); })
				.call(force.drag)
				.append("title")
				.text(function(d) { return d.name; });
			force.on("tick", function() {
				link.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
				node.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
			});
		});
	};
	// INITIAL COMPONENTS TO RUN
	floating_logo();
	$('.page-content').activity(false); //data loading spinner
	if (!/(report)/.test(window.location)) { // push url params & transition if NOT on report.php page
		history.pushState('string or object', 'Title', 'index.php?&type='+type+'&query='+search_val+'&start='+start+'&end='+end);
		// animate transition
		$('.page-content').fadeTo(500, 0.7);
		$('html, body').animate({scrollTop:0}, 'slow');
	}
};// end page() function
var getURLParameter = function(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
};
var parseURL = function(url) {
	var a =  document.createElement('a');
	a.href = url;
	return {
		source: url,
		protocol: a.protocol.replace(':',''),
		host: a.hostname,
		port: a.port,
		query: a.search,
		params: (function(){
			var ret = {},
			seg = a.search.replace(/^\?/,'').split('&'),
			len = seg.length, i = 0, s;
			for (;i<len;i++) {
				if (!seg[i]) { continue; }
				s = seg[i].split('=');
				ret[s[0]] = s[1];
			}
			return ret;
		})(),
		file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
		hash: a.hash.replace('#',''),
		path: a.pathname.replace(/^([^\/])/,'/$1'),
		relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
		segments: a.pathname.replace(/^\//,'').split('/')
	};
};
// top error notification
var no_fetch = function() { // error display if not data is return from getdata.php
	$('#breadhome li:last').remove();
	noty({
		layout: 'top',
		theme: 'defaultTheme',
		type: 'error',
		text: 'Sorry, no results were returned.',
		dismissQueue: false, // If you want to use queue feature set this true
		animation: {
			open: { height: 'toggle' },
			close: { height: 'toggle' },
			easing: 'swing',
			speed: 500 // opening & closing animation speed
		},
		timeout: 1000 // delay for closing event. Set false for sticky notifications
	});
	$('.page-content').activity(false);
	$(".page-content").fadeTo(500, 1);
};
// bottom-left notification
var newNotification = function(ioc) {
	if(!/(report)/.test(window.location)) {
		var notify_ioc = noty({
			layout: 'bottomLeft',
			theme: 'defaultTheme',
			type: 'information',
			text: 'Incoming flagged host: '+ioc,
			maxVisible: 1,
			dismissQueue: true, // If you want to use queue feature set this true
			animation: {
				open: { height: 'toggle' },
				close: { height: 'toggle' },
				easing: 'swing',
				speed: 500 // opening & closing animation speed
			},
			timeout: 5000 // delay for closing event. Set false for sticky notifications
		});
	}
};
// clear all div children
var clear_div = function(elementID) { // clear specified div contents
	var div=document.getElementById(elementID);
	while (div.hasChildNodes()) {
		div.removeChild(div.childNodes[0]);
	}
};
// calendar reset date
var reset_calendar = function() {
	$('#dashboard-report-range span').html(Date.today().add({
		days: -defaultDayRange
	}).toString('MMMM d, yyyy') + ' - ' + Date.today().toString('MMMM d, yyyy'));
};
// bottom-left logo
var floating_logo = function() {
	var viewPort = $(window).height();
	var sidebarHeight = $('.page-sidebar').height() + 180;
	if (viewPort < sidebarHeight) {
		$('#footimg').css({ display: 'none' });
	}
	else {
		$('#footimg').css({ position: 'fixed', bottom: 30, display: '' });
	}
};
var dPopup = function(text) {
	$.colorbox({html:text, width:500});
};
var severityBtn = function(divclass) {
	if (($("."+divclass).siblings().hasClass('severity-deselect')===false) && ($("."+divclass).hasClass('severity-deselect')===false)) {
		$("."+divclass).siblings().addClass('severity-deselect');
	} else if ($("."+divclass).hasClass("severity-deselect") === true) {
		$("."+divclass).removeClass("severity-deselect");
		$("."+divclass).siblings().addClass("severity-deselect");
	} else if (($("."+divclass).hasClass("severity-deselect") === false) && ($("."+divclass).siblings().hasClass('severity-deselect')===true)) {
		$("."+divclass).siblings().removeClass('severity-deselect');
		oTable.fnFilter('', null);
	}
};
var resizeViz = function (chart, divid, aspect) {
	var targetWidth = $(divid).width();
	chart.select('svg')
		.attr("width", targetWidth)
		.attr("height", targetWidth / aspect);
	// chart.selectAll('svg g text')
	// .attr('style', 'font-size:12px; !important');
};
var d3swimChart = function(divID, json) {
	d3.json(json+'&getViz=true&vizType=d3swimChart&dID='+divID, function(error, dataset) {
        timeline('#'+divID)
            .data(dataset)
            .band("mainBand", 0.82)
            .band("naviBand", 0.08)
            .xAxis("mainBand")
            .xAxis("naviBand")
            .labels("mainBand")
            .labels("naviBand")
            .brush("naviBand", ["mainBand"])
            .redraw();
    });
};

///////////////////////////////////////////////
/////////   DC.JS GRAPH FUNCTIONS   ///////////
///////////////////////////////////////////////
var severityGraph = function(divID, dim, group, start, end, xAxis, yAxis, height) {
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
	var width = $("#"+divID).width();
	var hHeight;
	if(height !== undefined) {
		hHeight = height;
	} else {
		hHeight = width/3.3; //4.6 as default
	}
	barChart = dc.barChart("#"+divID)
		.width(width) // (optional) define chart width, :default = 200
		.height(hHeight)
		.transitionDuration(500) // (optional) define chart transition duration, :default = 500
		.margins({top: 10, right: 30, bottom: 25, left: 43}) // (optional) define margins
		.dimension(dim) // set dimension
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
		.xAxisLabel(xAxis) // (optional) render an axis label below the x axis
		.yAxisLabel(yAxis) // (optional) render a vertical axis lable left of the y axis
		.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
		.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
		.x(d3.time.scale().domain([moment.unix(start), moment.unix(end)])) // define x scale
		.xUnits(d3.time.hours) // define x axis units
		.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
		.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
		//.legend(dc.legend().x(width - 140).y(10).itemHeight(13).gap(5))
		.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
		.renderTitle(true) // (optional) whether chart should render titles, :default = false

		.renderlet(function(chart) {
			chart.select('svg')
				.attr('width', width)
				.attr('height', hHeight)
				.attr('viewBox', '0 0 '+width+' '+hHeight)
				.attr('perserveAspectRatio', 'xMinYMid');
			
			var aspect;
			$(window).on("resize", function() {
				aspect = width / hHeight;
				resizeViz(chart, "#"+divID, aspect);
			});
			$('.sidebar-toggler').on("click", function() {
				setTimeout(function() {
					aspect = width / hHeight;
					resizeViz(chart, "#"+divID, aspect);
				},10);
			});
			chart.filterAll([function(d){return d.value.elevated;}]);

			//	var tip = d3.tip()
			//		.attr('class', 'd3-tip')
			//		.offset([-10, 0])
			//		.html( function (d) { return "<span style='color: #f0027f'>Country: " + d.count + "</span> : "  + "\nTotal Flows: " + (d.count ? d.count : 0); } );
			//		chart.selectAll("g").call(tip);
			//		chart.selectAll("g").on('mouseover', tip.show)
			//			.on('mouseout', tip.hide);

			//chart.select("svg").attr("width", "100%").attr("height", "100%").attr("viewBox",
			//	"0 0 " + width + " 170").attr("preserveAspectRatio", "xMinYMin");
		dc.events.trigger(function() {
			var filter = barChart.filters();
			var string = filter.join(' | ');
				//	oTable.fnFilter(string,null,true,null);
			});
	});
	$('#filter').on('click', function(){
				// var minDate = 1389330000;
				// var maxDate = 1389371640;
				// //console.log(barChart.filters());

				// barChart.filter([minDate, maxDate]);
				// barChart.x(d3.time.scale().domain([minDate,maxDate]));

				// //console.log(barChart.filters());

				// dc.redrawAll();
			});
};
var dcGeoMap = function (divID, dim, group, world) {
	var width = $("#"+divID).width();
	var height = width/1.4;
	var minhits = function (d) { return d.value.min; };
	var maxhits = function (d) { return d.value.max; };
	geo = dc.geoChoroplethChart('#'+divID)
	.dimension(dim)
	.group(group)
	.projection(d3.geo.mercator().precision(0.1).scale((width + 1) / 0.3 / Math.PI).translate([width / 2, width / 2]))
	.width(width)
	.height(width/1.4)
	.colors(["#ccc", "#FF0000", "#CC0000", "#990000", "#660000", "#360000"])
	.colorDomain([minhits, maxhits])
	.overlayGeoJson(world.features, "country", function(d) {
		return d.properties.name;
	})
	.title(function (d) {
		return "Total Connections: " + (d.value ? d.value : 0);
	})	
	.renderlet(function(chart) {		
		dc.events.trigger(function() {
			var filter = geo.filters();
			var string = filter.join(' | ');
			if(string !== "") {
				oTable.fnFilter(string,null,true,false);
			}
		});
		chart.select('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', '0 0 '+width+' '+height)
			.attr('perserveAspectRatio', 'xMinYMid');
		var aspect;
		$(window).on("resize", function() {
			aspect = width / height;
			resizeViz(chart, "#"+divID, aspect);
		});
		$('.sidebar-toggler').on("click", function() {
			setTimeout(function() {
				aspect = width / height;
				resizeViz(chart, "#"+divID, aspect);
			},10);
		});
		//	var tip = d3.tip()
		//		.attr('class', 'd3-tip')
		//		.offset([-5, 0])
		//		.html(function (d) { return "<span style='color: #f0027f'>Country: " + d.properties.name + "</span> : "  + "Total Flows: " + (d.value ? d.value: 0 ); } );
		//		chart.selectAll("g").call(tip);
		//		chart.selectAll("g").on('mouseover', tip.show)
		//		.on('mouseout', tip.hide);				
		//	chart.select("svg").attr("width", "200%").attr("height", "100%").attr("viewBox",
		//	"0 0 " + width + " " + width/1.4).attr("preserveAspectRatio", "xMinYMin");
});
};
var dcBarGraph = function(divID, dim, group, start, end, xAxis, yAxis) {
	var width = $("#"+divID).width();
	hHeight = width/4.6;
	barChart = dc.barChart("#"+divID)
		.width(width) // (optional) define chart width, :default = 200
		.height(width/4.6)
		.transitionDuration(500) // (optional) define chart transition duration, :default = 500
		.margins({top: 10, right: 50, bottom: 40, left: 60}) // (optional) define margins
		.dimension(dim) // set dimension
		//.group(group) // set group
		.group(group)
		.colors(["#193459"])
		.xAxisLabel(xAxis) // (optional) render an axis label below the x axis
		.yAxisLabel(yAxis) // (optional) render a vertical axis lable left of the y axis
		.elasticY(true) // (optional) whether chart should rescale y axis to fit data, :default = false
		.elasticX(false) // (optional) whether chart should rescale x axis to fit data, :default = false
		.x(d3.time.scale().domain([moment.unix(start), moment.unix(end)])) // define x scale
		.xUnits(d3.time.hours) // define x axis units
		.renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
		.renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
		.title(function(d) { return "Value: " + d.value; })// (optional) whether svg title element(tooltip) should be generated for each bar using the given function, :default=no
		//.title(function (d) { return ""; })
		//.legend(dc.legend().x(250).y(10))							
		.renderTitle(true) // (optional) whether chart should render titles, :default = false
		.renderlet(function(chart) {
			chart.select('svg')
				.attr('width', width)
				.attr('height', hHeight)
				.attr('viewBox', '0 0 '+width+' '+hHeight)
				.attr('perserveAspectRatio', 'xMinYMid');
			var aspect;
			$(window).on("resize", function() {
				aspect = width / hHeight;
				resizeViz(chart, "#"+divID, aspect);
			});
			$('.sidebar-toggler').on("click", function() {
				setTimeout(function() {
					aspect = width / hHeight;
					resizeViz(chart, "#"+divID, aspect);
				},10);
			});
		dc.events.trigger(function() {
			var filter = barChart.filters();
			var string = filter.join(' | ');
				//	oTable.fnFilter(string,null,true,null);
			});
	});
	};
	
var dcPieGraph = function(divID, dim, group, colors) {
		var width = $("#"+divID).width();
		pieChart = dc.pieChart("#"+divID)
		.height(width)
		.innerRadius(width/6)
		.width(width)	
		.group(group)
		.radius(width/2)
		.colors(colors)
		.dimension(dim)
		.legend(dc.legend().x(width / 2 ).y(width / 2).itemHeight(13).gap(5));
		// .on("preRender", legend)
		//	.renderlet(function(chart) {
		//	//$('#'+dID+' .jdash-header').height();
		//	//chart.select("svg").attr("width", "100%").attr("height", "100%").attr("viewBox",
		//	//"0 0 " + width + " " + width).attr("preserveAspectRatio", "xMinYMin meet");
		//	dc.events.trigger(function() {
		//		var filter = pieChart.filters();
		//		var string = filter.join(' | ');
		//		oTable.fnFilter(string,null,true,null);
		//	});
		// });
};
var dcWordCloud = function(divID, data) {
	var str = ['test', 'test2', 'test3'];
	var width = $("#"+divID).width();
	//wordCloud = dc.wordCloud("#"+divID)
	//.width(width)
	//.height(width)
	//.title(function (d) { return ""; })
	//.group(group[g])
	//.dimension(cf_data.dimension(dimension[x]))
	//.text(function(d) { return d.remote_country });
	function wordCloud(words) {
		d3.select("#"+divID)
		.append("svg")
		.attr("width", "100%").attr("height", "100%").attr("viewBox",
			"0 0 " + width + " " + width/1.4).attr("preserveAspectRatio", "xMinYMin")
		.append("g")
		.attr("transform", "translate(" + [w >> 1, h >> 1] + ")" )
		.selectAll("text")
		.data(words)
		.enter().append("text")
		.style("font-size", function(d) { return d.size + "px"; })
		.style("font-family", "Helvetica")
		.style("fill", function(d, i) { return fill(i); })
		.attr("text-anchor", "middle")
		.attr("transform", function(d) {
			return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		})
		.text(function(d) { return d.text; });
	}
	data.aaData.forEach(function(d) { return { text: d.remote_country, size: d.count }; }); // parse data json obj to set name and font size
	
	var fontSize = d3.scale.log().range([4, 20]);  
	var fill = d3.scale.category20b();
	var w = width;
	var h = width/2;

	d3.layout.cloud()
	.size([w,h])
	.words(data.aaData.map(function(d) { return { text: d.remote_country, size: d.count }; }))
	.padding(5)
	.rotate(function(d) { return ~~(Math.random() * 5) * 30 - 60; })
	.font("Impact")
	.fontSize(function(d) { return fontSize(d.size); })
		//.fontSize(function(d) { return d.size; })
		.on("end", wordCloud)
		.start();
	};
var dcRowGraph = function(divID, dim, group, colors) {
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
	var rowChart = dc.rowChart("#"+divID);
	//set pixels to expand by if there are more than [hLimit] items
	// var hLimit = 9;
	// var barExpand = 0;
	// if (colors.length > hLimit) {
	//	barExpand = (colors.length - hLimit)*(width/35);
	// }
	var hHeight, lOffset;
	if (colors.length < 7) {
		lOffset = 17+(colors.length*0.2);
		hHeight = 25+(colors.length*35);
	} else if (colors.length >= 7) {
		lOffset = 12.7+(colors.length*0.2);
		hHeight = 25+(colors.length*28);	
	}
	var width = $("#"+divID).width();
		rowChart
		.width(width)
		//.height(width/2 + barExpand)
		.height(hHeight)
		.margins({top: 5, left: 0, right: 0, bottom: 20})
		.group(sevCount)
		.dimension(dim)
		.colors(["#377FC7","#F5D800","#F88B12","#DD122A"])
		.valueAccessor(function(d) {
			return d.value.count+0.1;
		})
		.colorAccessor(function (d){return d.value.severity;})
		.renderlet(function(chart){
			chart.select('svg')
				.attr('width', width)
				.attr('height', hHeight)
				.attr('viewBox', '0 0 '+width+' '+hHeight)
				.attr('perserveAspectRatio', 'xMinYMid');
				var aspect;
				$(window).on("resize", function() {
					if (colors.length < 7) {
						height = 25+(colors.length*35);
					} else if (colors.length >= 7) {
						height = 25+(colors.length*28);	
					}
					aspect = width / hHeight;
					resizeViz(chart, "#"+divID, aspect);
				});
				$('.sidebar-toggler').on("click", function() {
					setTimeout(function() {
						if (colors.length < 7) {
							height = 25+(colors.length*35);
						} else if (colors.length >= 7) {
							height = 25+(colors.length*28);	
						}
						aspect = width / hHeight;
						resizeViz(chart, "#"+divID, aspect);
					},10);
				});
		})
		.renderLabel(true)
		.label(function(d) { return d.key+' ('+d.value.count+')'; })
		.labelOffsetY(lOffset)
		.elasticX(false)
		.x(d3.scale.log().domain([1, tops[0].value.count+0.1]).range([0,width]))
		.xAxis()
		.scale(rowChart.x())
		.tickFormat(logFormat);
};
var dcCompositeGraph = function(divID, dim, group, start, end, xAxis, yAxis) {
	var width = $("#"+divID).width();
	var compositeChart = dc.compositeChart("#"+divID)
	.width(width)
	.height(180)
	.transitionDuration(1000)
	.margins({top: 10, right: 50, bottom: 40, left: 60})
	.dimension(dim)
	.group(group)
		//.valueAccessor(function (d) {
			//return d.destination;
		//})
		.xAxisLabel(xAxis) // (optional) render an axis label below the x axis
		.yAxisLabel(yAxis) // (optional) render a vertical axis lable left of the y axis
		.mouseZoomable(true)
		.x(d3.time.scale().domain([moment.unix(start), moment.unix(end)]))
		//.round(d3.time.hour)
		.xUnits(d3.time.hours)
		.elasticY(true)
		.renderHorizontalGridLines(true)
		.brushOn(false)
		.rangeChart(barChart)
		.compose([
			dc.lineChart(compositeChart).group(group)
			//.valueAccessor(function (d) {
				//return d.count;
			//})
		.renderArea(true)
			//.stack(group, function (d) { return d.count; })
			])
		.xAxis();
	//barChart = dc.barChart("#"+value.dID+'bar')
	//.width(990)
	//.height(40)
	//.margins({top: 0, right: 50, bottom: 20, left: 40})
	//.dimension(cf_data.dimension(dimension[x]))
	//.group(group[g])
	//.centerBar(true)
	//.gap(1)
	//.x(d3.time.scale().domain([moment.unix(start), moment.unix(end)]))
	//.round(d3.time.hour.round)
	//.xUnits(d3.time.hour);
};

///////////////////////////////////////////////
/////////   D3.JS GRAPH FUNCTIONS   ///////////
///////////////////////////////////////////////
var d3PieGraph = function(divID, json) {
	///NOTE: there is an issue with the colors not being assigned to the right data. the colution is to push the colors into the data object and access it from there
	d3.json(json+'&getViz=true&vizType=d3&dID='+divID, function(error, graph) {
		//color picker function
		var numberOfItems = graph.aaData.length;
		var rainbow = new Rainbow(); 
		rainbow.setNumberRange(1, graph.aaData.length+1);
		rainbow.setSpectrum('#ED5314', '#FFB92A', '#FEEB51', '#9BCA3E', '#3ABBC9', '#E6E6E6');
		var cc = [];
		for (var i = 1; i <= numberOfItems; i++) {
			var hexColour = rainbow.colourAt(i);
			cc.push('#' + hexColour);
		}
		//var color = d3.scale.ordinal().range(cc);
		//begin pie chart render
		var width = $("#"+divID).width();
		var w = width/2, //width
		h = width/2, //height
		r = width/4, //radius
		color = d3.scale.ordinal().range(cc); //builtin range of colors
			//color.domain(d3.keys(graph.aaData.ioc).filter(function(key) { return key !== "count"; }));

			var vis = d3.select("#"+divID)
			.append("svg:svg") //create the SVG element inside the <body>
			.data([graph.aaData]) //associate our data with the document
			.attr("width", w) //set the width and height of our visualization (these will be attributes of the <svg> tag
				.attr("height", h)
			.append("svg:g") //make a group to hold our pie chart
			.attr("transform", "translate(" + r + "," + r + ")"); //move the center of the pie chart from 0, 0 to radius, radius

		var arc = d3.svg.arc() //this will create <path> elements for us using arc data
		.outerRadius(r);

		var pie = d3.layout.pie() //this will create arc data for us given a list of values
			.value(function(d) { return d.count; }); //we must tell it out to access the value of each element in our data array

		var arcs = vis.selectAll("g.slice") //this selects all <g> elements with class slice (there aren't any yet)
			.data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
			.enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
				.append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
					.attr("class", "slice"); //allow us to style things in the slices (like text)

					arcs.append("svg:path")
			.attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
			.attr("d", arc); //this creates the actual SVG path using the associated data (pie) with the arc drawing function

			var legend = d3.select("#"+divID).append("svg")
			.attr("class", "legend")
			.attr("class", "pie_legend")
			//.attr("width", r * 1.7)
			.attr("height", r * 2)
			.selectAll("g")
			.data(color.domain().reverse())
			.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

			legend.append("text")
			.attr("x", 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.text(function(d, i) { return graph.aaData[i].ioc; });
		});
};
///////////////////////////////////////////////
/////////    DataTable FUNCTIONS    ///////////
///////////////////////////////////////////////
var getTable = function(divID, json, data, columns) {

	var graph_type = getURLParameter('type');
	var sort = [[ 0, "desc" ]];
	if (data.sSort) {
		sort = (new Function( "return([" + data.sSort + "])" ))();
	}
	var bFilter,iDisplayLength,bStateSave,bPaginate,sDom;	
	if(/(report)/.test(window.location) === true) {
		bfilter = false;
		iDisplayLength = false;
		bStateSave = true;
		bPaginate = false;
		sDom = 'r<t>';
	} else {
		if (data.sDom !== 'false') {
			sDom = '<"clear"C>T<"clear">lfr<"table_overflow"t>ip';
		} 
		else {
			sDom = '<"clear"><"clear">r<"table_overflow"t>';
		}
		bfilter = true;
		iDisplayLength = 50;
		bStateSave = true;
		bPaginate = true;
	}
	oTable = $("."+divID).dataTable( {
		"bDestroy": true,
		"bProcessing": true,
		"bRebuild": true,
		"bServerSide": true,			
		"aaSorting": sort,
		"bFilter": bfilter,
		"bPaginate": bPaginate,
		"sAjaxSource": json+'&getTable=true&dID='+divID,
		"aoColumns": columns,

		"iDisplayLength": iDisplayLength,
		"bStateSave": true,
		
		"sType": "html",
		"sDom": sDom,
		"fnStateSave": function (oSettings, oData) {
			localStorage.setItem( 'DataTable_'+graph_type, JSON.stringify(oData) );
		},
		"fnStateLoad": function (oSettings) {
			return JSON.parse( localStorage.getItem('DataTable_'+graph_type) );
		},
		"oTableTools": {
			"sSwfPath": "assets/swf/copy_csv_xls_pdf.swf",
			"aButtons": [
			"copy",
			{
				"sExtends": "collection",
				"sButtonText": "Export",
				"aButtons": [ "csv", "xls", {
					"sExtends": "pdf",
					"sPdfOrientation": "landscape",
					"sPdfMessage": "Your custom message would go here."
				} ]
			}
			]
		},
		//this hides any tables on the ioc_event page that come up empty
		"fnDrawCallback": function(oSettings) {
			var iTotalRecords = oSettings.fnRecordsTotal();
			if ((iTotalRecords === 0) && (getURLParameter('type') === 'ioc_event')) {
				$(this).parents('.jdash-widget').remove();
			}
		}
	});
oTable.fnFilter('');
};

///////////////////////////////////////////////
/////////    PAGE LOAD FUNCTIONS    ///////////
///////////////////////////////////////////////
$(document).ready(function() { // execute javascript as soon as DOM is loaded

	App.init(); // initlayout and core plugins
	floating_logo();
	// window.onpopstate = function(event) {
	//	var url;
	//	url = parseURL(document.location);
	//	page(url.params['query'], url.params.type, url.params['start'], url.params['end'], null);		
	// };	
	//
	// http://stackoverflow.com/questions/10416026/what-is-the-ideal-way-to-handle-window-onpopstate-for-all-browsers
	//
	// A slightly more elegant way is to add a 1ms timeout before adding the popstate listener. 
	// Since the initial popstate will fire before any async code gets executed, your popstate 
	// function will work properly (only on forward/back actions):
	//
	window.setTimeout(function() {
		$(window).on('popstate', function(event) {
			var url;
			url = parseURL(document.location);
			//page(url.params.query, url.params.type, url.params.start, url.params.end, null);
		});
	}, 1);
	// CALENDAR DISPLAY
	var Index = function() { // initiate daterange
		return {
			initDashboardDaterange: function() {
				$('#dashboard-report-range').daterangepicker({
					ranges: {
						'Today': [moment().startOf('day'), moment()],
						'Yesterday': [moment().subtract('days', 1).startOf('day'), moment().subtract('days', 1).endOf('day')],
						'Last 7 Days': [moment().subtract('days', 6), moment()],
						'Last 30 Days': [moment().subtract('days', 29), moment()],
						'This Month': [moment().startOf('month'), moment().endOf('month')],
						'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
					},
					opens: (App.isRTL() ? 'right' : 'left'),
					timePicker: true,
					timePickerIncrement: 05,
					format: 'MM/DD/YYYY h:mm A',
					separator: ' to ',
					startDate: Date.today().add({
						days: -29
					}),
					endDate: Date.today(),
					minDate: '01/01/2012',
					maxDate: '',
					locale: {
						applyLabel: 'Submit',
						fromLabel: 'From',
						toLabel: 'To',
						customRangeLabel: 'Custom Range',
						daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
						monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
						firstDay: 1
					},
					showWeekNumbers: true,
					buttonClasses: ['btn-danger']
				},
				function(start, end) {
					App.blockUI(jQuery("#dashboard"));
					setTimeout(function() {
						// this is doing nothing at the moment but will be used soon for effects
					}, 1000);
					// this (below) updates the displayed dates (via .html property)
					$('#dashboard-report-range span').html(start.format('MMMM D, YYYY h:mm A') + ' - ' + end.format('MMMM D, YYYY h:mm A'));
					start = moment(start.format('MMMM D, YYYY h:mm A'), 'MMMM D, YYYY h:mm A').unix();
					end = moment(end.format('MMMM D, YYYY h:mm A'), 'MMMM D, YYYY h:mm A').unix();
					page(getURLParameter('query'), getURLParameter('type'), start, end, 'false'); // refresh page if date range is changed
				});
				// displays the date function
				$('#dashboard-report-range').show();
				start_check = getURLParameter('start');
				end_check = getURLParameter('end');
				if (start_check != 'null') {
					$('#dashboard-report-range span').html(moment.unix(start_check).format('MMMM D, YYYY h:mm A')+' - '+moment.unix(end_check).format('MMMM D, YYYY h:mm A'));
				}
				if (start_check == 'null' || end_check == 'null') {
					reset_calendar();
				}
			},
		};
	}();
	Index.initDashboardDaterange();
	// SIDEBAR MEMORY
	if (!localStorage.getItem('sidebar')) {
		localStorage.setItem('sidebar', 0);
	}
	if (localStorage.getItem('sidebar') === '0') { // keep sidebar consistent between pages
		var body = $('body');
		var sidebar = $('.page-sidebar');
		$(".sidebar-search", sidebar).removeClass("open");
		if (body.hasClass("page-sidebar-closed")) {
			body.removeClass("page-sidebar-closed");
			if (body.hasClass('page-sidebar-fixed')) {
				sidebar.css('width', '');
			}
		} 
		else {
			body.addClass("page-sidebar-closed");
		}
		//runResponsiveHandlers(); // failing when sidebar set to '0'
	}
	// LIVE NOTIFICATION CHECKING + DISPLAY
	var counter = localStorage.getItem('counter');
	var newflags = 0;
	$.get("inc/getdata.php?&checkpoint=true", function(check) { // load ioc alert dropdown
		checkpoint = check;
		$.getJSON('inc/getdata.php?type=blacklist&where=null&start=null&end=null', function(jsn) {
			if(jsn) { // only run if return is not NULL
				$.each(jsn, function() { //check for new items & count
					if(checkpoint < this.added) { // math.checkpoint
						newflags++;
						$('#notifications').prepend('<li><a class="flagged_drop" href="javascript:page(\''+this.ioc+'\',\''+defaultNotifications+'\');"><span class="label label-important"><i class="fa fa-bolt"></i></span>' + this.ioc + ' <span style="float:right" class="time" data-livestamp="'+this.added+'"></span></a></li>');
						$('.badge').html(++counter);
						newNotification(this.ioc);
						$('.notification span.more').html('<p>You have '+newflags+' new notifications</p>');
					} 
					else {
						$('#notifications').append('<li><a href="javascript:page(\''+this.ioc+'\',\''+defaultNotifications+'\');"><span class="label label-important"><i class="fa fa-bolt"></i></span>'+this.ioc+'<span style="float:right" class="time" data-livestamp="'+this.added+'"></span></a></li>');
					}
					localStorage.setItem('counter', counter);
					if (newflags > 6) { // if more than 10, linktop button to notification page
						$.each(jsn, function() {
							var more_notifications = 5 - Math.newflags;
							$('.notification span.more').html('<p>You have '+newflags+' new notifications</p>');
							$('.badge').html(++counter);
						});
					}
					$('.dropdown-toggle').on("click", function(event) {
						counter = 0;
						localStorage.setItem('counter', 0);
						$('.badge').html('');
						$(".flagged_drop").effect("highlight", {}, 5500);
						$('.flagged_drop').removeClass();
						$(this).off(event);
					});
					if (counter > 0) {
						$('.badge').html(counter);
					}
				});
}
});
});
	setTimeout(function() { // update ioc alert dropdown
		(function notifications(){
			$.get("inc/getdata.php?&checkpoint=true", function(check){
				checkpoint = check;
				$.getJSON('inc/getdata.php?type=blacklist&where=null&start='+checkpoint+'&end=null', function(jsn) {
					if(jsn){ // only run if return is not NULL
						$.each(jsn, function() {
							if(checkpoint < this.added) { // Math.checkpoint
								newflags++;
								$('#notifications').prepend('<li><a class="flagged_drop" href="javascript:page(\''+this.ioc+'\',\''+defaultNotifications+'\');"><span class="label label-important"><i class="fa fa-bolt"></i></span>' + this.ioc + ' <span style="float:right" class="time" data-livestamp="'+this.added+'"></span></a></li>');
								$('.badge').html(++counter);
								newNotification(this.ioc);
								$('.notification span.more').html('<p>You have '+newflags+' new notifications</p>');
								localStorage.setItem('counter', counter);
								var all_n = $('#notifications');
								if(all_n.children('li').size() >= 5) { // remove bottom notifications if total is more than 5
									$('#notifications li:last').remove();
								}
								$('.dropdown-toggle').on("click", function( event ) {
									counter = 0;
									localStorage.setItem('counter', 0);
									$('.badge').html('');
									$(".flagged_drop").effect("highlight", {}, 5500);
									$('.flagged_drop').removeClass();
									$(this).off(event);
								});
								if (counter > 0) {
									$('.badge').html(counter);
								}
							}
						});
}
});
});
			setTimeout(notifications, 50000); //check for new updates every 5 seconds
		})();
	}, 5000);
	// KILL BOTTOM NOTIFICATIONS IF HEADER BADGE IS CLICKED
	$('.dropdown-toggle').on("click", function(event) {
		$.noty.closeAll();
	});
	// SIDEBAR WINDOW SCROLL
	$(window).scroll(function() {
		$('.page-sidebar').css({ position: 'fixed' });
	});
	// BOTTOM LEFT LOGO VISIBILITY
	$('.page-sidebar li a').click(function() {
		setTimeout(function() {
			floating_logo();
		}, 150);
	});
	$(window).bind("resize", function() {
		floating_logo();
	});
	// INITIAL GRAPH LOAD
	var	clear_bc = true;
	var type = getURLParameter('type');
	var query = getURLParameter('query');
	if (type == 'null') {
		type = defaultSearch;
		query = 'top';
	}
	var start = getURLParameter('start');
	if (start == 'null') {
		start = null;
	}
	var end = getURLParameter('end');
	if (end == 'null') {
		end = null;
	}

	page(query, type, start, end, clear_bc);
});