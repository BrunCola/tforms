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
	//var results = [];
	var tables = [];
	var crossfilter = [];
	var info = [];

	switch (req.query.type) {
		case 'ioc_notifications':
		// Info function(s) --- IOC
			new query('SELECT count(*) as count FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL', database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		case 'ioc_groups':
			new query('SELECT ioc FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY ioc', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'local_ips':
			new query('SELECT lan_ip FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY lan_ip', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_ip':
			new query('SELECT remote_ip FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY remote_ip', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_country':
			new query('SELECT remote_country FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY remote_country', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'query':
			new query('SELECT query FROM dns_ioc WHERE (time between '+start+' AND '+end+') GROUP BY query', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'host':
			new query('SELECT host FROM http_ioc WHERE (time between '+start+' AND '+end+') GROUP BY host', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_ip_ssl':
			new query('SELECT remote_ip FROM ssl_ioc WHERE (time between '+start+' AND '+end+') GROUP BY remote_ip', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'name':
			new query('SELECT name FROM file_ioc WHERE (time between '+start+' AND '+end+') GROUP BY name', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'l7_proto':
			new query('SELECT `l7_proto` FROM `conn_ioc` WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY `l7_proto`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		// Info function(s) --- Network
		case 'conn_meta':
			new query('SELECT lan_ip FROM conn_meta WHERE (time between '+start+' AND '+end+') GROUP BY lan_ip', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_ip_conn_meta':
			new query('SELECT remote_ip FROM conn_meta WHERE (time between '+start+' AND '+end+') GROUP BY remote_ip', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'remote_country_conn_meta':
			new query('SELECT remote_country FROM conn_meta WHERE (time between '+start+' AND '+end+') GROUP BY remote_country', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		///
		case 'bandwidth_in':
			new query('SELECT ROUND(((sum(in_bytes) / 1048576) / ('+end+' - '+start+')) * 8000,2)  as bandwidth FROM conn_meta WHERE time between '+start+' AND '+end, database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		case 'bandwidth_out':
			new query('SELECT ROUND(((sum(out_bytes) / 1048576) / ('+end+' - '+start+')) * 8000,2) as bandwidth FROM conn_meta WHERE time between '+start+' AND '+end, database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		case 'new_ip':
			new query('SELECT remote_ip FROM conn_remote_ip WHERE (time between '+start+' AND '+end+') GROUP BY remote_ip', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_dns':
			new query('SELECT query FROM dns_query WHERE (time between '+start+' AND '+end+') GROUP BY query', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_http':
			new query('SELECT `host` FROM `http_host` WHERE (time between '+start+' AND '+end+') GROUP BY `host`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_ssl':
			new query('SELECT `remote_ip` FROM `ssl_remote_ip` WHERE (time between '+start+' AND '+end+') GROUP BY `remote_ip`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		case 'new_layer7':
			new query('SELECT `l7_proto` FROM `conn_l7` WHERE (time between '+start+' AND '+end+') GROUP BY `l7_proto`', database, function(err,data){
				if (data) {
					res.json(data.length);
				}
			});
			break;
		default:
			var table1SQL = 'SELECT '+
				// SELECTS
				'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
				'`ioc_severity`, '+
				'count(*) as count, '+
				'`ioc`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection`, '+
				'`ioc_attrID`, '+
				'`lan_zone`, '+
				'`lan_ip`, '+
				'`machine`, '+
				'`remote_ip`, '+
				'`remote_asn`, '+
				'`remote_asn_name`, '+
				'`remote_country`, '+
				'`remote_cc`, '+
				'sum(`in_packets`) as in_packets, '+
				'sum(`out_packets`) as out_packets, '+
				'sum(`in_bytes`) as in_bytes, '+
				'sum(`out_bytes`) as out_bytes '+
				// !SELECTS
				'FROM conn_ioc '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `ioc_count` > 0 AND `trash` IS NULL '+
				'GROUP BY `lan_ip`,`remote_ip`,`ioc`';

			var table1Params = [
				{
					title: 'Last Seen',
					select: 'time',
					dView: true,
					link: {
						type: 'ioc_events_drilldown',
						// val: the pre-evaluated values from the query above
						val: ['lan_ip','remote_ip','ioc','ioc_attrID'],
						crumb: false
					},
				},
				{ title: 'Severity', select: 'ioc_severity' },
				{ title: 'IOC Hits', select: 'count' },
				{ title: 'IOC', select: 'ioc' },
				{ title: 'IOC Type', select: 'ioc_typeIndicator' },
				{ title: 'IOC Stage', select: 'ioc_typeInfection' },
				{ title: 'LAN Zone', select: 'lan_zone' },
				{ title: 'LAN IP', select: 'lan_ip' },
				{ title: 'Machine Name', select: 'machine' },
				{ title: 'Remote IP', select: 'remote_ip' },
				{ title: 'Remote ASN', select: 'remote_asn' },
				{ title: 'Remote ASN Name', select: 'remote_asn_name' },
				{ title: 'Remote Country', select: 'remote_country' },
				{ title: 'Flag', select: 'remote_cc', },
				{ title: 'Packets to Remote', select: 'in_packets' },
				{ title: 'Packets from Remote', select: 'out_packets' },
				{ title: 'Bytes to Remote', select: 'in_bytes', dView: false },
				{ title: 'Bytes from Remote', select: 'out_bytes', dView: false },
				{
					title: '',
					select: null,
					dView: true,
					link: {
						type: 'Archive',
					},
				},
			];
			var table1Settings = {
				sort: [[0, 'desc']],
				div: 'table',
				title: 'Indicators of Compromise (IOC) Notifications'
			};

			var crossfilterSQL = 'SELECT '+
					// SELECTS
					'count(*) as count, '+
					'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
					'`remote_country`,'+
					'`ioc_severity`,'+
					'`ioc` '+
					// !SELECTS
				'FROM conn_ioc '+
				'WHERE '+
					'time BETWEEN '+start+' AND '+end+' '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NULL '+
				'GROUP BY '+
					'month(from_unixtime(time)),'+
					'day(from_unixtime(time)),'+
					'hour(from_unixtime(time)),'+
					'remote_country,'+
					'ioc_severity,'+
					'ioc';
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
		break;
	}
};