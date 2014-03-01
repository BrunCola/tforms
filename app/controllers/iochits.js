'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	// var database = req.user.database;
	var database = null;
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
		'max(date_format(from_unixtime(time), "%Y-%m-%d %l:%i:%s")) as time, '+ // Last Seen
		'`ioc_severity`, '+
		'count(*) as count, '+
		'`ioc`, '+
		'`ioc_type`, '+
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
				type: 'ioc_drill',
				// val: the pre-evaluated values from the query above
				val: ['lan_ip','remote_ip','ioc'],
				crumb: false
			},
		},
		{ title: 'Severity', select: 'ioc_severity' },
		{ title: 'IOC Hits', select: 'count' },
		{ title: 'IOC', select: 'ioc' },
		{ title: 'IOC Type', select: 'ioc_type' },
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
		{ title: 'Bytes from Remote', select: 'out_bytes', dView: false }
	];

	var crossfilterSQL = 'SELECT '+
		// SELECTS
		'date_format(from_unixtime(time), "%Y-%m-%d %l:%i:%s") as time, '+ // Last Seen
		'`remote_country`, '+
		'ioc_severity, '+
		'count(*) as count, '+
		'`ioc` '+
		// !SELECTS
		'FROM conn_ioc '+
		'WHERE time BETWEEN '+start+' AND '+end+' '+
		'AND `ioc_count` > 0 AND `trash` IS NULL '+
		'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity, ioc';


	async.parallel([
		// Table function(s)
		function(callback) {
			new dataTable(table1SQL, table1Params, database, function(err,data){
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



// switch (req.query.type) {
// 		case 'ioc_notifications':
// 		// Info function(s) --- IOC
// 			new query('SELECT count(*) as count FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL', function(err,data){
// 				res.json(data);
// 			});
// 			break;
// 		case 'ioc_groups':
// 			new query('SELECT ioc FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY ioc', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'local_ips':
// 			new query('SELECT lan_ip FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY lan_ip', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'remote_ip':
// 			new query('SELECT remote_ip FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY remote_ip', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'remote_country':
// 			new query('SELECT remote_country FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY remote_country', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'query':
// 			new query('SELECT query FROM dns_ioc WHERE (time between '+start+' AND '+end+') GROUP BY query', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'host':
// 			new query('SELECT host FROM http_ioc WHERE (time between '+start+' AND '+end+') GROUP BY host', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'remote_ip_ssl':
// 			new query('SELECT remote_ip FROM ssl_ioc WHERE (time between '+start+' AND '+end+') GROUP BY remote_ip', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'name':
// 			new query('SELECT name FROM file_ioc WHERE (time between '+start+' AND '+end+') GROUP BY name', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'l7_proto':
// 			new query('SELECT `l7_proto` FROM `conn_ioc` WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL GROUP BY `l7_proto`', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		// Info function(s) --- Network
// 		case 'conn_meta':
// 			new query('SELECT lan FROM conn_meta WHERE (time between '+start+' AND '+end+') GROUP BY lan_ip', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'remote_ip_conn_meta':
// 			new query('SELECT remote_ip FROM conn_meta WHERE (time between '+start+' AND '+end+') GROUP BY remote_ip', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'remote_country_conn_meta':
// 			new query('SELECT remote_country FROM conn_meta WHERE (time between '+start+' AND '+end+') GROUP BY remote_country', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		///
// 		case 'bandwidth_in':
// 			new query('SELECT ROUND(((sum(in_bytes) / 1048576) / ('+end+' - '+start+')) * 8000,2)  as bandwidth FROM conn_meta WHERE time between '+start+' AND '+end, function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'bandwidth_out':
// 			new query('SELECT ROUND(((sum(out_bytes) / 1048576) / ('+end+' - '+start+')) * 8000,2) as bandwidth FROM conn_meta WHERE time between '+start+' AND '+end, function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'new_ip':
// 			new query('SELECT remote_ip FROM conn_remote_ip WHERE (time between '+start+' AND '+end+') GROUP BY remote_ip', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'new_dns':
// 			new query('SELECT query FROM dns_query WHERE (time between '+start+' AND '+end+') GROUP BY query', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'new_http':
// 			new query('SELECT `host` FROM `http_host` WHERE (time between '+start+' AND '+end+') GROUP BY `host`', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'new_ssl':
// 			new query('SELECT `remote_ip` FROM `ssl_remote_ip` WHERE (time between '+start+' AND '+end+') GROUP BY `remote_ip`', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		case 'new_layer7':
// 			new query('SELECT `l7_proto` FROM `conn_l7` WHERE (time between '+start+' AND '+end+') GROUP BY `l7_proto`', function(err,data){
// 				res.json(data.length);
// 			});
// 			break;
// 		default:
// 			var table1SQL = 'SELECT '+
// 				// SELECTS
// 				'max(date_format(from_unixtime(time), "%Y-%m-%d %l:%i:%s")) as time, '+ // Last Seen
// 				'`ioc_severity`, '+
// 				'count(*) as count, '+
// 				'`ioc`, '+
// 				'`ioc_type`, '+
// 				'`lan_zone`, '+
// 				'`lan_ip`, '+
// 				'`machine`, '+
// 				'`remote_ip`, '+
// 				'`remote_asn`, '+
// 				'`remote_asn_name`, '+
// 				'`remote_country`, '+
// 				'`remote_cc`, '+
// 				'sum(in_packets) as in_packets, '+
// 				'sum(out_packets) as out_packets, '+
// 				'sum(`in_bytes`) as in_bytes, '+
// 				'sum(`out_bytes`) as out_bytes '+
// 				// !SELECTS
// 				'FROM conn_ioc '+
// 				'WHERE time BETWEEN '+start+' AND '+end+' '+
// 				'AND `ioc_count` > 0 AND `trash` IS NULL '+
// 				'GROUP BY `lan_ip`,`remote_ip`,`ioc`';

// 			var table1Params = [
// 				{
// 					title: 'Last Seen',
// 					select: 'time',
// 					dView: true,
// 					link: {
// 						type: 'ioc_drill',
// 						// val: the pre-evaluated values from the query above
// 						val: ['lan_ip','remote_ip','ioc'],
// 						crumb: false
// 					},
// 				},
// 				{ title: 'Severity', select: 'ioc_severity' },
// 				{ title: 'IOC Hits', select: 'count' },
// 				{ title: 'IOC', select: 'ioc' },
// 				{ title: 'IOC Type', select: 'ioc_type' },
// 				{ title: 'LAN Zone', select: 'lan_zone' },
// 				{ title: 'LAN IP', select: 'lan_ip' },
// 				{ title: 'Machine Name', select: 'machine' },
// 				{ title: 'Remote IP', select: 'remote_ip' },
// 				{ title: 'Remote ASN', select: 'remote_asn' },
// 				{ title: 'Remote ASN Name', select: 'remote_asn_name' },
// 				{ title: 'Remote Country', select: 'remote_country' },
// 				{ title: 'Flag', select: 'remote_cc', },
// 				{ title: 'Packets to Remote', select: 'in_packets' },
// 				{ title: 'Packets from Remote', select: 'out_packets' },
// 				{ title: 'Bytes to Remote', select: 'in_bytes', dView: false },
// 				{ title: 'Bytes from Remote', select: 'out_bytes', dView: false }
// 			];

// 			var crossfilterSQL = 'SELECT '+
// 				// SELECTS
// 				'date_format(from_unixtime(time), "%Y-%m-%d %l:%i:%s") as time, '+ // Last Seen
// 				'`remote_country`, '+
// 				'ioc_severity, '+
// 				'count(*) as count, '+
// 				'`ioc` '+
// 				// !SELECTS
// 				'FROM conn_ioc '+
// 				'WHERE time BETWEEN '+start+' AND '+end+' '+
// 				'AND `ioc_count` > 0 AND `trash` IS NULL '+
// 				'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity, ioc';
// 			async.parallel([
// 				// Table function(s)
// 				function(callback) {
// 					new dataTable(table1SQL, table1Params, function(err,data){
// 						tables.push(data);
// 						callback();
// 					});
// 				},
// 				// Crossfilter function
// 				function(callback) {
// 					new query(crossfilterSQL, function(err,data){
// 						crossfilter = data;
// 						callback();
// 					});
// 				},
// 			], function(err) { //This function gets called after the two tasks have called their "task callbacks"
// 				if (err) throw console.log(err);
// 				var results = {
// 					//info: info,
// 					tables: tables,
// 					crossfilter: crossfilter
// 				};
// 				//console.log(results);
// 				res.json(results);
// 			});
// 		break;
