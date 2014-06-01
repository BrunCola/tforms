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
			'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) AS time,'+
			'`lan_zone`,'+
			'`machine`,'+
			'`lan_ip`,'+
			'(sum(`in_bytes`) / 1048576) AS in_bytes,'+
			'(sum(`out_bytes`) / 1048576) AS out_bytes,'+
			'sum(`in_packets`) AS in_packets,'+
			'sum(`out_packets`) AS out_packets,'+
			'sum(`dns`) AS `dns`,'+
			'sum(`http`) AS `http`,'+
			'sum(`ssl`) AS `ssl`,'+
			'sum(`ssh`) AS `ssh`,'+
			'sum(`ftp`) AS `ftp`,'+
			'sum(`irc`) AS `irc`,'+
			'sum(`smtp`) AS `smtp`,'+
			'sum(`file`) AS `file`,'+
			'sum(`ioc_count`) AS `ioc_count` '+
		'FROM '+
			'`conn_local` '+
		'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'`lan_zone`,'+
			'`lan_ip`';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			dView: true,
			link: {
				type: 'top_local2remote',
				// val: the pre-evaluated values from the query above
				val: ['lan_zone','lan_ip'],
				crumb: false
			},
		},
		{ title: 'Zone', select: 'lan_zone' },
		{ title: 'Machine Name', select: 'machine' },
		{ title: 'LAN IP', select: 'lan_ip' },
		{ title: 'MB to Remote', select: 'in_bytes' },
		{ title: 'MB from Remote', select: 'out_bytes'},
		{ title: 'Packets to Remote', select: 'in_packets', dView:false },
		{ title: 'Packets from Remote', select: 'out_packets', dView:false },
		{ title: 'IOC Hits', select: 'ioc_count' },
		{ title: 'Connections', select: 'count', dView:false },
		{ title: 'DNS', select: 'dns', dView:false },
		{ title: 'HTTP', select: 'http', dView:false },
		{ title: 'SSL', select: 'ssl', dView:false },
		{ title: 'SSH', select: 'ssh', dView:false },
		{ title: 'FTP', select: 'ftp', dView:false },
		{ title: 'IRC', select: 'irc', dView:false },
		{ title: 'SMTP', select: 'smtp', dView:false },
		{ title: 'File', select: 'file', dView:false },
	];
	var table1Settings = {
		sort: [[0, 'desc']],
		div: 'table',
		title: 'Local IP Traffic'
	}
	var crossfilterSQL = 'SELECT '+
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time,'+
			'(sum(`in_bytes` + `out_bytes`) / 1048576) AS count '+
		'FROM '+
			'`conn_local` '+
		'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'month(from_unixtime(`time`)),'+
			'day(from_unixtime(`time`)),'+
			'hour(from_unixtime(`time`))';
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