'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	var tables = [];
	var crossfilter = [];
	var info = [];
	var table1SQL = 'SELECT '+
			'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+ // Last Seen
			'`ioc_severity`,'+
			'`ioc`,'+
			'`ioc_typeIndicator`,'+
			'`ioc_typeInfection`,'+
			'sum(`ioc_count`) AS ioc_count,'+
			'`remote_ip`,'+
			'`remote_asn_name`,'+
			'`remote_country`,'+
			'`remote_cc`,'+
			'sum(`in_packets`) AS in_packets,'+
			'sum(`out_packets`) AS out_packets,'+
			'sum(`in_bytes`) AS in_bytes,'+
			'sum(`out_bytes`) AS out_bytes '+
		'FROM '+
			'`conn_ioc` '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end+' '+
			'AND `ioc_count` > 0 '+
			'AND `trash` IS NULL '+
		'GROUP BY '+
			'`remote_ip`,'+
			'`ioc`';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			dView: true,
			link: {
				type: 'ioc_top_remote2local',
				val: ['remote_ip','ioc'],
				crumb: false
			},
		},
		{ title: 'Severity', select: 'ioc_severity' },
		{ title: 'IOC Hits', select: 'ioc_count' },
		{ title: 'IOC', select: 'ioc' },
		{ title: 'IOC Type', select: 'ioc_typeIndicator' },
		{ title: 'IOC Stage', select: 'ioc_typeInfection' },
		{ title: 'Remote IP', select: 'remote_ip' },
		{ title: 'Remote Country', select: 'remote_country' },
		{ title: 'Flag', select: 'remote_cc' },
		{ title: 'Remote ASN', select: 'remote_asn_name' },
		{ title: 'Bytes to Remote', select: 'in_bytes' },
		{ title: 'Bytes from Remote', select: 'out_bytes' },
		{ title: 'Packets to Remote', select: 'in_packets', dView: false },
		{ title: 'Packets from Remote', select: 'out_packets', dView: false },		
	];
	var table1Settings = {
		sort: [[2, 'desc']],
		div: 'table',
		title: 'Indicators of Compromise (IOC) Notifications'
	}
	var crossfilterSQL = 'SELECT '+
			'count(*) as count,'+
			'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
			'`remote_country`,'+
			'`ioc`,'+
			'`ioc_severity` '+
		'FROM '+
			'`conn_ioc` '+
		'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
			'AND `ioc_count` > 0 '+
			'AND `trash` IS NULL '+
		'GROUP BY '+
			'month(from_unixtime(time)),'+
			'day(from_unixtime(time)),'+
			'hour(from_unixtime(time)),'+
			'remote_country,'+
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
		res.json(results);
	});
};