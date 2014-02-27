'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var end = config.end;
	var start = config.start;
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	if (req.query.lan_ip && req.query.remote_ip && req.query.ioc) {
		//var results = [];
		var tables = [];
		var crossfilter = [];
		var info = [];
		var table1SQL = 'SELECT '+
			// SELECTS
			'max(date_format(from_unixtime(time), "%Y-%m-%d %l:%i:%s")) as time, '+ // Last Seen
			// 'from_unixtime(`time`) as time1, '+
			'`lan_port`, '+
			'`wan_port`, '+
			'`remote_port`, '+
			'`in_packets`, '+
			'`out_packets`, '+
			'`in_bytes`, '+
			'`out_bytes`, '+
			'`file`, '+
			'`http`, '+
			'`dns`, '+
			'`ssl`, '+
			'`conn_uids` '+
			// !SELECTS
			'FROM conn_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' AND `remote_ip`=\''+req.query.remote_ip+'\' AND `ioc`=\''+req.query.ioc+'\'';


		var table1Params = [
			{
				title: 'Time',
				select: 'time',
				dView: true,
				link: {
					type: 'ioc_event',
					// val: the pre-evaluated values from the query above
					val: ['conn_uids'],
					crumb: false
				},
			},
			{ title: 'LAN Port', select: 'lan_port' },
			{ title: 'WAN Port', select: 'wan_port' },
			{ title: 'Remote Port', select: 'remote_port' },
			{ title: 'Packets to Remote', select: 'in_packets' },
			{ title: 'Packets from Remote', select: 'out_packets' },
			{ title: 'Bytes to Remote', select: 'in_bytes' },
			{ title: 'Bytes from Remote', select: 'out_bytes' },
			{ title: 'Files Extracted', select: 'file' },
			{ title: 'HTTP Links', select: 'http' },
			{ title: 'DNS Query', select: 'dns' },
			{ title: 'SSL Query', select: 'ssl' },
			{ title: 'ID', select: 'conn_uids', dView: false }
		];

		var crossfilterSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %l:%i:%s") as time, '+ // Last Seen
			//'from_unixtime(time) as time, '+
			'count(*) as count, '+
			'`ioc_severity`, '+
			'`ioc` '+
			// !SELECTS
			'FROM conn_ioc '+
			'WHERE `lan_ip`=\''+req.query.lan_ip+'\' AND `remote_ip`=\''+req.query.remote_ip+'\' AND `ioc`=\''+req.query.ioc+'\' '+
			'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), ioc_severity';


		async.parallel([
			// Table function(s)
			function(callback) {
				new dataTable(table1SQL, table1Params, function(err,data){
					tables.push(data);
					callback();
				});
			},
			// Crossfilter function
			function(callback) {
				new query(crossfilterSQL, function(err,data){
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
	} else {
		res.redirect('/');
	}
};
