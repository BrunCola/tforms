'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	if ((req.session.passport.user.email === config.reports.email) && (req.query.database !== null)) {
		database = req.query.database;
	}
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

	switch (req.query.type) {
		case 'glossary':
			var iocType = req.query.iocType;
			new query('SELECT description FROM ioc_parent WHERE ioc_parent =\''+iocType+'\'', 'rp_ioc_intel', function(err,data){
				console.log('SELECT description FROM ioc_parent WHERE ioc_parent = '+iocType);
				if (data) {
					res.json({
						title: iocType,
						desc: data
					});
				}
			});
			break;
		case 'ioc_notifications':
			new query('SELECT count(*) AS count FROM `conn_ioc` WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL', database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		case 'ioc_groups':
			new query('SELECT `ioc` FROM `conn_ioc` WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY ioc', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'local_ips':
			new query('SELECT `lan_ip` FROM `conn_ioc` WHERE (`time` between '+start+' AND '+end+') AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `lan_zone`,`lan_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_ip':
			new query('SELECT `remote_ip` FROM `conn_ioc` WHERE (`time` between '+start+' AND '+end+') AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `remote_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_country':
			new query('SELECT `remote_country` FROM `conn_ioc` WHERE (`time` between '+start+' AND '+end+') AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `remote_country`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'query':
			new query('SELECT `query` FROM `dns_ioc` WHERE (`time` between '+start+' AND '+end+') GROUP BY `query`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'host':
			new query('SELECT `host` FROM `http_ioc` WHERE (`time` between '+start+' AND '+end+') GROUP BY `host`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_ip_ssl':
			new query('SELECT `remote_ip` FROM `ssl_ioc` WHERE (`time` between '+start+' AND '+end+') GROUP BY `remote_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'name':
			new query('SELECT `name` FROM `file_ioc` WHERE (`time` between '+start+' AND '+end+') GROUP BY `name`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'l7_proto':
			new query('SELECT `l7_proto` FROM `conn_ioc` WHERE (`time` between '+start+' AND '+end+') AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `l7_proto`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		// Info function(s) --- Network
		case 'conn_meta':
			new query('SELECT `lan_ip` FROM `conn_meta` WHERE (`time` between '+start+' AND '+end+') GROUP BY `lan_zone`,`lan_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_ip_conn_meta':
			new query('SELECT `remote_ip` FROM `conn_meta` WHERE (`time` between '+start+' AND '+end+') GROUP BY `remote_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_country_conn_meta':
			new query('SELECT `remote_country` FROM `conn_meta` WHERE (`time` between '+start+' AND '+end+') GROUP BY `remote_country`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		///
		case 'bandwidth_in':
			new query('SELECT ROUND(((sum(`in_bytes`) / 1048576) / ('+end+' - '+start+')) * 8000,2) AS `bandwidth` FROM `conn_local` WHERE `time` between '+start+' AND '+end, database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		case 'bandwidth_out':
			new query('SELECT ROUND(((sum(`out_bytes`) / 1048576) / ('+end+' - '+start+')) * 8000,2) AS `bandwidth` FROM `conn_local` WHERE `time` between '+start+' AND '+end, database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		case 'new_ip':
			new query('SELECT `remote_ip` FROM `conn_uniq_remote_ip` WHERE (`time` between '+start+' AND '+end+') GROUP BY `remote_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_dns':
			new query('SELECT `query` FROM `dns_uniq_query` WHERE (`time` between '+start+' AND '+end+') GROUP BY `query`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_http':
			new query('SELECT `host` FROM `http_uniq_host` WHERE (`time` between '+start+' AND '+end+') GROUP BY `host`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_ssl':
			new query('SELECT `remote_ip` FROM `ssl_uniq_remote_ip` WHERE (`time` between '+start+' AND '+end+') GROUP BY `remote_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_layer7':
			new query('SELECT `l7_proto` FROM `conn_l7_proto` WHERE (`time` between '+start+' AND '+end+') GROUP BY `l7_proto`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		default:
			var table1SQL = 'SELECT '+
					'count(*) AS count,'+
					'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+
					'ioc,'+
					'ioc_severity,'+
					'ioc_typeIndicator,'+
					'remote_ip,'+
					'remote_country,'+
					'remote_cc,'+
					'sum(`in_bytes`) AS icon_in_bytes,'+
					'sum(`out_bytes`) AS icon_out_bytes '+
				'FROM '+
					'`conn_ioc` '+
				'WHERE '+
					'`time` BETWEEN '+start+' AND '+end+' '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NULL '+
				'GROUP BY '+
					'`ioc_typeIndicator`,'+
					'`remote_ip`,'+
					'`ioc` '+
				'ORDER BY '+
					'ioc_severity DESC,'+
					'count DESC '+
				'LIMIT 10';
			var table1Params = [
				{ title: 'Last Seen', select: 'time' },
				{ title: 'Severity', select: 'ioc_severity' },
				{ title: 'IOC Hits', select: 'count' },
				{ title: 'IOC', select: 'ioc' },
				{ title: 'IOC Type', select: 'ioc_typeIndicator' },
				{ title: 'Remote IP', select: 'remote_ip' },
				{ title: 'Remote Country', select: 'remote_country' },
				{ title: 'Flag', select: 'remote_cc' },
				{ title: 'Traffic In/Out', select: 'icon_in_bytes' }
			];
			var table1Settings = {
				sort: [[ 1, "desc" ],[ 2, "desc" ]],
				div: 'table',
				title: 'Top 10 Highest Severity IOC Notifications',
				pagebreakBefore: false
			}
			var table2SQL = 'SELECT '+
					'count(*) AS count,'+
					'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) AS time,'+
					'ioc,'+
					'ioc_severity,'+
					'ioc_typeIndicator,'+
					'lan_zone,'+
					'machine,'+
					'lan_ip,'+
					'sum(`in_bytes`) AS icon_in_bytes,'+
					'sum(`out_bytes`) AS icon_out_bytes '+
				'FROM '+
					'`conn_ioc` '+
				'WHERE '+
					'`time` BETWEEN '+start+' AND '+end+' '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NULL '+
				'GROUP BY '+
					'`ioc_typeIndicator`,'+
					'`lan_zone`,'+
					'`lan_ip`,'+
					'`ioc` '+
				'ORDER BY '+
					'ioc_severity DESC,'+
					'count DESC';
			var table2Params = [
				{ title: 'Last Seen', select: 'time' },
				{ title: 'Severity', select: 'ioc_severity' },
				{ title: 'IOC Hits', select: 'count' },
				{ title: 'IOC', select: 'ioc' },
				{ title: 'IOC Type', select: 'ioc_typeIndicator' },
				{ title: 'Zone', select: 'lan_zone' },
				{ title: 'Machine Name', select: 'machine' },
				{ title: 'Local IP', select: 'lan_ip' },
				{ title: 'Traffic In/Out', select: 'icon_in_bytes' }
			];
			var table2Settings = {
				sort: [[ 1, "desc" ],[ 2, "desc" ]],
				div: 'table2',
				title: 'Local End Point IP Addresses Triggering IOC Notifications',
				pagebreakBefore: true
			}
			var table3SQL = 'SELECT '+
					'count(*) AS count,'+
					'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time,'+
					'l7_proto,'+
					'(sum(`in_bytes`) / 1048576) AS in_bytes,'+
					'(sum(`out_bytes`) / 1048576) AS out_bytes '+
				'FROM '+
					'`conn_l7_meta` '+
				'WHERE '+
					'`time` BETWEEN '+start+' AND '+end+' '+
					'AND `l7_proto` !=\'-\' '+
				'GROUP BY '+
					'`l7_proto` '+
				'ORDER BY '+
					'out_bytes DESC';
			var table3Params = [
				{ title: 'Last Seen', select: 'time' },
				{ title: 'Connections', select: 'count' },
				{ title: 'Layer 7 protocol', select: 'l7_proto' },
				{ title: 'MB to Remote', select: 'in_bytes' },
				{ title: 'MB from Remote', select: 'out_bytes' }
			];
			var table3Settings = {
				sort: [[ 3, "desc" ],[ 4, "desc" ]],
				div: 'table3',
				title: 'Layer 7 Protocol Bandwidth',
				pagebreakBefore: true
			}
			var crossfilterSQL = 'SELECT '+
					'count(*) AS count,'+
					'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
					'`remote_country`,'+
					'`ioc`,'+
					'`ioc_severity` '+
				'FROM '+
					'`conn_ioc` '+
				'WHERE '+
					'time BETWEEN '+start+' AND '+end+' '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NULL '+
				'GROUP BY '+
					'month(from_unixtime(`time`)),'+
					'day(from_unixtime(`time`)),'+
					'hour(from_unixtime(`time`)),'+
					'`remote_country`,'+
					'`ioc`,'+
					'`ioc_severity`';
			var glossarySQL = 'SELECT '+
				'count(*) AS `count`,'+
				'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS `time`,'+
				'`remote_country`,'+
				'`ioc`,'+
				'`ioc_severity` '+
			'FROM '+
				'`conn_ioc` '+
			'WHERE '+
				'time BETWEEN '+start+' AND '+end+' '+
				'AND `ioc_count` > 0 '+
				'AND `trash` IS NULL '+
			'GROUP BY '+
				'month(from_unixtime(`time`)),'+
				'day(from_unixtime(`time`)),'+
				'hour(from_unixtime(`time`)),'+
				'`remote_country`,'+
				'`ioc`,'+
				'`ioc_severity`';
			async.parallel([
				// Table function(s)
				function(callback) {
					new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
						tables[2] = data;
						callback();
					});
				},
				function(callback) {
					new dataTable(table2SQL, table2Params, table2Settings, database, function(err,data){
						tables[1] = data;
						callback();
					});
				},
				function(callback) {
					new dataTable(table3SQL, table3Params, table3Settings, database, function(err,data){
						tables[0] = data;
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
		break;
	}
};