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
	if (req.query.remote_ip && req.query.ioc) {
		var tables = [];
		var info = [];
		var table1SQL = 'SELECT '+
				'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+
				'`lan_zone`,'+
				'`machine`,'+
				'`lan_ip`,'+
				'`remote_ip`,'+
				'`remote_country`,'+
				'`remote_cc`,'+
				'`remote_asn_name`,'+
				'sum(`in_packets`) as in_packets,'+
				'sum(`out_packets`) as out_packets,'+
				'sum(`in_bytes`) as in_bytes,'+
				'sum(`out_bytes`) as out_bytes, '+
				'`ioc`,'+
				'`ioc_severity`,'+
				'`ioc_typeIndicator`,'+
				'`ioc_typeInfection`, '+
				'sum(`ioc_count`) AS ioc_count '+
			'FROM '+
				'`conn_ioc` '+
			'WHERE '+
				'`time` BETWEEN '+start+' AND '+end+' '+
				'AND `remote_ip` = \''+req.query.remote_ip+'\' '+
				'AND `ioc` = \''+req.query.ioc+'\' '+
				'AND `ioc_count` > 0 '+
				'AND `trash` IS NULL '+
			'GROUP BY '+
				'`lan_zone`,'+
				'`lan_ip`';
		var table1Params = [
			{
				title: 'Last Seen',
				select: 'time',
				dView: true,
				link: {
					type: 'ioc_events_drilldown',
					val: ['lan_zone','lan_ip','remote_ip','ioc'],
					crumb: false
				},
			},
			{ title: 'Severity', select: 'ioc_severity' },
			{ title: 'IOC Hits', select: 'ioc_count' },
			{ title: 'IOC', select: 'ioc' },
			{ title: 'IOC Type', select: 'ioc_typeIndicator' },
			{ title: 'IOC Stage', select: 'ioc_typeInfection' },
			{ title: 'Zone', select: 'lan_zone' },
			{ title: 'Machine', select: 'machine' },
			{ title: 'LAN IP', select: 'lan_ip' },
			{ title: 'Remote IP', select: 'remote_ip' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Flag', select: 'remote_cc', },
			{ title: 'Remote ASN', select: 'remote_asn_name' },
			{ title: 'Bytes to Remote', select: 'in_bytes' },
			{ title: 'Bytes from Remote', select: 'out_bytes' },
			{ title: 'Packets to Remote', select: 'in_packets', dView: false },
			{ title: 'Packets from Remote', select: 'out_packets', dView: false },
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table',
			title: 'Indicators of Compromise (IOC) Notifications'
		}
		async.parallel([
			// Table function(s)
			function(callback) {
				new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
					tables.push(data);
					callback();
				});
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
			var results = {
				info: info,
				tables: tables
			};
			res.json(results);
		});
	} else {
		res.redirect('/');
	}
};