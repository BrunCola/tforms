'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
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
	if (req.query.remote_ip && req.query.l7_proto) {
		//var results = [];
		var tables = [];
		var crossfilter = [];
		var info = [];

		var table1SQL = 'SELECT '+
				// SELECTS
				'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time, '+ // Last Seen
				'`l7_proto`, '+
				'`lan_zone`, '+
				'`lan_ip`, '+
				'`machine`, '+
				'`remote_ip`, '+
				'`remote_asn`, '+
				'`remote_asn_name`, '+
				'`remote_country`, '+
				'`remote_cc`, '+
				'sum(`in_packets`) AS in_packets, '+
				'sum(`out_packets`) AS out_packets, '+
				'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
				'(sum(`out_bytes`) / 1048576) AS out_bytes '+
				// !SELECTS
			'FROM conn_l7 '+
			'WHERE '+
				'`time` BETWEEN '+start+' AND '+end+' '+
				'AND `remote_ip` = \''+req.query.remote_ip+'\' '+
				'AND `l7_proto` = \''+req.query.l7_proto+'\' '+
			'GROUP BY `remote_ip`';

			var table1Params = [
				{ title: 'Last Seen', select: 'time' },
				{ title: 'Applications', select: 'l7_proto' },
				{ title: 'LAN Zone', select: 'lan_zone' },
				{ title: 'LAN IP', select: 'lan_ip' },
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
			var table1Settings = {
				sort: [[0, 'desc']],
				div: 'table',
				title: 'Remote IP/Local IP Bandwidth Usage'
			};

			var crossfilterSQL = 'SELECT '+
					// SELECTS
					'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
					'count(*) as count, '+
					'`remote_country` '+
					// !SELECTS
				'FROM `conn_l7` '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
					'AND `remote_ip` = \''+req.query.remote_ip+'\' '+
					'AND `l7_proto` = \''+req.query.l7_proto+'\' '+
				'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country';

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
			res.json(results);
		});
	} else {
		res.redirect('/');
	}
};