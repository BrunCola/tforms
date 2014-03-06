'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
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
	if (req.query.lan_zone && req.query.lan_ip) {
		//var results = [];
		var tables = [];
		var crossfilter = [];
		var info = [];

		var table1SQL = 'SELECT '+
				// SELECTS
				'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
				'`lan_zone`, '+
				'`lan_ip`, '+
				'`machine`, '+
				'`remote_ip`, '+
				'`remote_asn`, '+
				'`remote_asn_name`, '+
				'`remote_country`, '+
				'`remote_cc`, '+
				'(sum(in_bytes) / 1048576) as in_bytes, '+
				'(sum(out_bytes) / 1048576) as out_bytes, '+
				'sum(in_packets) as in_packets, '+
				'sum(out_packets) as out_packets '+
				// !SELECTS
			'FROM `conn_meta` '+
			'WHERE `time` BETWEEN '+start+' AND '+end+' '+
				'AND `lan_zone` = \''+req.query.lan_zone+'\' '+
				'AND `lan_ip` = \''+req.query.lan_ip+'\' '+
			'GROUP BY `remote_ip`';

		var table1Params = [
			{ title: 'Last Seen', select: 'time' },
			{ title: 'LAN Zone', select: 'lan_zone' },
			{ title: 'LAN IP', select: 'lan_ip' },
			{ title: 'Machine Name', select: 'machine' },
			{ title: 'Machine Name', select: 'machine' },
			{ title: 'Remote IP', select: 'remote_ip' },
			{ title: 'Remote ASN', select: 'remote_asn' },
			{ title: 'Remote ASN Name', select: 'remote_asn_name' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Flag', select: 'remote_cc', },
			{ title: 'MB to Remote', select: 'in_bytes' },
			{ title: 'MB from Remote', select: 'out_bytes'},
			{ title: 'Packets to Remote', select: 'in_packets', dView:false },
			{ title: 'Packets from Remote', select: 'out_packets', dView:false }
		];
		var table1Sort = [[0, 'desc']];
		var table1Div = 'table';

		var crossfilterSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'count(*) as count, '+
			'`remote_country` '+
			// !SELECTS
			'FROM conn_meta '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country';

		async.parallel([
			// Table function(s)
			function(callback) {
				new dataTable(table1SQL, table1Params, table1Sort, table1Div, database, function(err,data){
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
	} else {
		res.redirect('/');
	}

};