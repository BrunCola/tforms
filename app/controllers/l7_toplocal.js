'use strict';

var dataTable = require('./constructors/datatable'),
query = require('./constructors/query'),
config = require('../../config/config'),
async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
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
			'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
			'count(*) AS count, '+
			'`lan_zone`, '+
			'`lan_ip`, '+
			'`machine`, '+
			'`l7_proto`, '+
			'sum(`in_packets`) as in_packets, '+
			'sum(`out_packets`) as out_packets, '+
			'(sum(`in_bytes`) / 1048576) as in_bytes, '+
			'(sum(`out_bytes`) / 1048576) as out_bytes '+
			// !SELECTS
		'FROM `conn_l7` '+
		'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
			'AND `l7_proto` !=\'-\' '+
		'GROUP BY `lan_ip`';

	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			dView: true,
			link: {
				type: 'l7_toplocal_app',
				// val: the pre-evaluated values from the query above
				val: ['l7_proto', 'lan_ip'],
				crumb: false
			},
		},
		{ title: 'Connections', select: 'count' },
		{ title: 'LAN Zone', select: 'lan_zone' },
		{ title: 'LAN IP', select: 'lan_ip' },
		{ title: 'Machine Name', select: 'machine' },
		{ title: 'MB to Remote', select: 'in_bytes' },
		{ title: 'MB from Remote', select: 'out_bytes' },
		{ title: 'Packets to Remote', select: 'in_packets' },
		{ title: 'Packets from Remote', select: 'out_packets' }
	];
	var table1Settings = {
		sort: [[0, 'desc']],
		div: 'table',
		title: 'Local IP Layer 7 Protocol Bandwidth Usage'
	};

	var crossfilterSQL = 'SELECT '+
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+ // Last Seen
			'(sum(in_bytes + out_bytes) / 1048576) AS count '+
		'FROM `conn_l7` '+
		'WHERE time BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'month(from_unixtime(time)),'+
			'day(from_unixtime(time)),'+
			'hour(from_unixtime(time))';

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