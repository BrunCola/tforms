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
	if (req.query.l7_proto && req.query.remote_ip) {
		//var results = [];
		var tables = [];
		var crossfilter = [];
		var info = [];
		var table1SQL = 'SELECT '+
				// SELECTS
				'count(*) AS count,'+
				'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+
				'`l7_proto`,'+
				'`remote_ip`,'+
				'sum(`in_packets`) AS in_packets,'+
				'sum(`out_packets`) AS out_packets,'+
				'(sum(`in_bytes`) / 1048576) AS in_bytes,'+
				'(sum(`out_bytes`) / 1048576) AS out_bytes,'+
				'sum(`dns`) AS `dns`,'+
				'sum(`http`) AS `http`,'+
				'sum(`ssl`) AS `ssl`,'+
				'sum(`ftp`) AS `ftp`,'+
				'sum(`irc`) AS `irc`,'+
				'sum(`smtp`) AS `smtp`,'+
				'sum(`file`) AS `file`,'+
				'sum(`ioc_count`) AS `ioc_count` '+
				// !SELECTS
			'FROM `conn_l7_meta` '+
			'WHERE '+
				'`time` BETWEEN '+start+' AND '+end+' '+
				'AND `remote_ip` = \''+req.query.remote_ip+'\' '+
			'GROUP '+
				'BY `l7_proto`';

		var table1Params = [
			{
				title: 'Last Seen',
				select: 'time',
				dView: true,
				link: {
					type: 'l7_topremote_drill',
					// val: the pre-evaluated values from the query above
					val: ['remote_ip','l7_proto'],
					crumb: false
				},
			},
			{ title: 'Applications', select: 'l7_proto' },
			{ title: 'MB to Remote', select: 'in_bytes' },
			{ title: 'MB from Remote', select: 'out_bytes'},
			{ title: 'Packets to Remote', select: 'in_packets', dView:false },
			{ title: 'Packets from Remote', select: 'out_packets', dView:false },
			{ title: 'Connections', select: 'count' },
			{ title: 'DNS', select: 'dns' },
			{ title: 'HTTP', select: 'http' },
			{ title: 'SSL', select: 'ssl' },
			{ title: 'FTP', select: 'ftp' },
			{ title: 'IRC', select: 'irc' },
			{ title: 'SMTP', select: 'smtp' },
			{ title: 'Files', select: 'files' },
			{ title: 'IOC Count', select: 'ioc_count' }
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table',
			title: 'Remote IP Bandwidth Usage'
		};

		var crossfilterSQL = 'SELECT '+
				'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time, '+ // Last Seen
				'(sum(in_bytes + out_bytes) / 1048576) AS count '+
			'FROM `conn_l7_meta` '+
			'WHERE `time` BETWEEN '+start+' AND '+end+' '+
			'AND `l7_proto` = \''+req.query.l7_proto+'\' '+
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
			res.json(results);
		});
	} else {
		res.redirect('/');
	}
};