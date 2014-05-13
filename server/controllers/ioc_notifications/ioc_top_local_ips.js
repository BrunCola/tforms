'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.user.database;
	// var database = null;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	//var results = [];
	var tables = [];
	var crossfilter = [];
	var info = [];
	var table1SQL = 'SELECT '+
			// SELECTS
			'count(*) AS count,'+
			'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+ // Last Seen
			'`ioc_severity`,'+
			'`ioc`,'+
			'`ioc_typeIndicator`,'+
			'`ioc_typeInfection`,'+
			'`lan_zone`,'+
			'`lan_ip`,'+
			'sum(`in_packets`) AS in_packets,'+
			'sum(`out_packets`) AS out_packets,'+
			'sum(`in_bytes`) AS in_bytes,'+
			'sum(`out_bytes`) AS out_bytes '+
			// !SELECTS
		'FROM `conn_ioc` '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end+' '+
			'AND `ioc_count` > 0 '+
			'AND `trash` IS NULL '+
		'GROUP BY '+
			'`lan_ip`,'+
			'`ioc`';

	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			dView: true,
			link: {
				type: 'ioc_top_local_ips_drill',
				// val: the pre-evaluated values from the query above
				val: ['lan_zone','lan_ip'],
				crumb: false
			},
		},
		{ title: 'Severity', select: 'ioc_severity' },
		{ title: 'IOC Hits', select: 'count' },
		{ title: 'IOC', select: 'ioc' },
		{ title: 'IOC Type', select: 'ioc_typeIndicator' },
		{ title: 'IOC Stage', select: 'ioc_typeInfection' },
		{ title: 'Remote IP', select: 'lan_ip' },
		{ title: 'Packets From LAN', select: 'in_packets' },
		{ title: 'Packets To LAN', select: 'out_packets' },
		{ title: 'Bytes From LAN', select: 'in_bytes', dView: false },
		{ title: 'Bytes To LAN', select: 'out_bytes', dView: false }
	];
	var table1Settings = {
		sort: [[2, 'desc']],
		div: 'table',
		title: 'Indicators of Compromise (IOC) Notifications'
	}

	var crossfilterSQL = 'SELECT '+
		// SELECTS
		'count(*) as count,'+
		'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+ // Last Seen
		'`ioc_severity`,'+
		'`ioc` '+
		// !SELECTS
		'FROM `conn_ioc` '+
		'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
			'AND `ioc_count` > 0 '+
			'AND `trash` IS NULL '+
		'GROUP BY '+
			'month(from_unixtime(time)),'+
			'day(from_unixtime(time)),'+
			'hour(from_unixtime(time)),'+
			'ioc,'+
			'ioc_severity';

	async.parallel([
		// Table function(s)
		function(callback) {
			new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
				tables.push(data);
				callback();
			});
		},
		// Crossfilter function
		function(callback) {
			new query(crossfilterSQL, database, function(err,data){
				crossfilter = data;
				callback();
			});
		}
	], function(err) { //This function gets called after the two tasks have called their "task callbacks"
		if (err) throw console.log(err);
		var results = {
			info: info,
			tables: tables,
			crossfilter: crossfilter
		};
		//console.log(results);
		res.jsonp(results);
	});
};