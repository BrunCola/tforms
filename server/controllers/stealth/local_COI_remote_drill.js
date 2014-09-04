'use strict';

var sankey = require('../constructors/sankey_new'),
	datatable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

var permissions = [3];

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var result = [];
			var columns = {};
			function handleReturn(data, callback) {
				if ((data !== null) && (data.aaData.length > 0)) {
					// data.aaData.columns = data.params;
					columns[data.aaData[0].type] = data.params;
					result.push(data.aaData);
					return callback();
				} else {
					return callback();
				}
			}
			var database = req.session.passport.user.database;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			var pointGroup;
			if (req.query.group) {
				pointGroup = req.query.group;
			} else {
				pointGroup = 60;
			}

			if (req.query.type === 'drill') {
				var conn = {
					query: 'SELECT '+
							'\'conn\' AS type, '+
							'`time` as raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
							'`ioc_count`,'+
							'`lan_zone`,'+
							'`machine`,'+
							'`lan_ip`,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_country`,'+
							'`remote_asn_name`,'+
							'`in_bytes`,'+
							'`out_bytes`,'+
							'`l7_proto`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_rule`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_typeInfection` '+
						'FROM '+
							'`conn` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "Zone", select: "lan_zone"},
						{title: "Machine", select: "machine"},
						{title: "Local IP", select: "lan_ip"},
						{title: "Local Port", select: "lan_port"},
						{title: "Remote IP", select: "remote_ip"},
						{title: "Remote Port", select: "remote_port"},
						{title: "Remote Country", select: "remote_country"},
						{title: "Remote ASN", select: "remote_asn_name"},
						{title: "Application", select: "l7_proto"},
						{title: "Bytes to Remote", select: "in_bytes"},
						{title: "Bytes from Remote", select: "out_bytes"},
						{title: "IOC", select: "ioc"},
						{title: "IOC Severity", select: "ioc_severity"},
						{title: "IOC Type", select: "ioc_typeIndicator"},
						{title: "IOC Stage", select: "ioc_typeInfection"},
						{title: "IOC Rule", select: "ioc_rule"},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var dns = {
					query: 'SELECT '+
							'\'dns\' AS type, '+
							'`time` AS raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time, '+
							'`ioc_count`,'+
							'`proto`,'+
							'`qclass_name`,'+
							'`qtype_name`,'+
							'`query`,'+
							'`answers`,'+
							'`TTLs`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_rule`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_typeInfection` '+
						'FROM '+
							'`dns` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "Protocol", select: "proto"},
						{title: "Query Class", select: "qclass_name"},
						{title: "Query Type", select: "qtype_name"},
						{title: "Query", select: "query"},
						{title: "Answers", select: "answers"},
						{title: "TTLs", select: "TTLs"},
						{title: "IOC", select: "ioc"},
						{title: "IOC Severity", select: "ioc_severity"},
						{title: "IOC Type", select: "ioc_typeIndicator"},
						{title: "IOC Stage", select: "ioc_typeInfection"},
						{title: "IOC Rule", select: "ioc_rule"},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var http = {
					query: 'SELECT '+
							'\'http\' AS type, '+
							'`time` as raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
							'`ioc_count`,'+
							'`host`,'+
							'`uri`,'+
							'`referrer`,'+
							'`user_agent`,'+
							'`request_body_len`,'+
							'`response_body_len`,'+
							'`status_code`,'+
							'`status_msg`,'+
							'`info_code`,'+
							'`info_msg`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_rule`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_typeInfection` '+
						'FROM '+
							'`http` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "Host", select: "host"},
						{title: "URI", select: "uri"},
						{title: "Referrer", select: "referrer"},
						{title: "User Agent", select: "user_agent"},
						{title: "IOC", select: "ioc"},
						{title: "IOC Severity", select: "ioc_severity"},
						{title: "IOC Type", select: "ioc_typeIndicator"},
						{title: "IOC Stage", select: "ioc_typeInfection"},
						{title: "IOC Rule", select: "ioc_rule"},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var ssl = {
					query: 'SELECT '+
							'\'ssl\' AS type, '+
							'`time` as raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
							'`ioc_count`,'+
							'`version`,'+
							'`cipher`,'+
							'`server_name`,'+
							'`subject`,'+
							'`issuer_subject`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_rule`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_typeInfection` '+	
						'FROM '+
							'`ssl` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "Server Name", select: "server_name"},
						{title: "Version", select: "version"},
						{title: "cipher", select: "cipher"},
						{title: "Subject", select: "subject"},
						{title: "Issuer Subject", select: "issuer_subject"},
						{title: "IOC", select: "ioc"},
						{title: "IOC Severity", select: "ioc_severity"},
						{title: "IOC Type", select: "ioc_typeIndicator"},
						{title: "IOC Stage", select: "ioc_typeInfection"},
						{title: "IOC Rule", select: "ioc_rule"},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var file = {
					query: 'SELECT '+
							'\'file\' AS type, '+
							'`time` as raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
							'`ioc_count`,'+
							'`mime`,'+
							'`name`,'+
							'`size`,'+
							'`md5`,'+
							'`sha1`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_rule`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_typeInfection` '+
						'FROM '+
							'`file` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "File Type", select: "mime"},
						{title: "Name", select: "name"},
						{title: "Size", select: "size"},
						{title: "MD5", select: "md5"},
						{title: "SHA1", select: "sha1"},
						{title: "IOC", select: "ioc"},
						{title: "IOC Severity", select: "ioc_severity"},
						{title: "IOC Type", select: "ioc_typeIndicator"},
						{title: "IOC Stage", select: "ioc_typeInfection"},
						{title: "IOC Rule", select: "ioc_rule"},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var endpoint = {
					query: 'SELECT '+
							'\'endpoint\' AS type, '+
							'`time` as raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
							'`src_ip`,'+
							'`dst_ip`,'+
							'`src_user`,'+
							'`alert_source`,'+
							'`program_source`,'+
							'`alert_info` '+
						'FROM '+
							'`ossec` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `src_ip`= ? ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "User", select: "src_user"},
						{title: "Source IP", select: "src_ip"},
						{title: "Destination IP", select: "dst_ip"},
						{title: "Alert Source", select: "alert_source"},
						{title: "Program Source", select: "program_source"},
						{title: "Alert Info", select: "alert_info"},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var stealth_conn = {
					query: 'SELECT '+
							'\'stealth\' AS type, '+
							'`time` AS raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time, '+
							'`src_ip`,'+
							'`dst_ip`,'+
							'(`in_bytes` / 1048576) AS in_bytes,'+
							'(`out_bytes` / 1048576) AS out_bytes,'+
							'`in_packets`,'+
							'`out_packets` '+
						'FROM '+
							'`stealth_conn_meta` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `src_ip`= ? '+
							'AND `in_bytes` > 0 '+
							'AND `out_bytes` > 0 ',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "Source IP", select: "src_ip"},
						{title: "Destination IP", select: "dst_ip"},
						{title: "MB from Remote", select: "in_bytes"},
						{title: "MB to Remote", select: "out_bytes"},
						{title: "Packets from Remote", select: "in_packets"},
						{title: "Packets to Remote", select: "out_packets"}
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}
				var stealth_block = {
					query: 'SELECT '+
							'\'stealth_block\' AS type, '+
							'`time` AS raw_time,'+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
							'`src_ip`, '+
							'`dst_ip`, '+
							'(`in_bytes` / 1048576) AS in_bytes,'+
							'(`out_bytes` / 1048576) AS out_bytes,'+
							'`in_packets`, '+
							'`out_packets` '+
						'FROM '+
							'`stealth_conn_meta` '+
						'WHERE '+
							'time BETWEEN ? AND ? '+
							'AND `src_ip` = ? '+
							'AND (`in_bytes` = 0 OR `out_bytes` = 0)',
					insert: [start, end, req.query.src_ip],
					params: [
						{title: "Time", select: "time"},
						{title: "Source IP", select: "src_ip"},
						{title: "Destination IP", select: "dst_ip"},
						{title: "MB from Remote", select: "in_bytes"},
						{title: "MB to Remote", select: "out_bytes"},
						{title: "Packets from Remote", select: "in_packets"},
						{title: "Packets to Remote", select: "out_packets"}
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Indicators of Compromise (IOC) Notifications',
						pageBreakBefore: false
					}
				}

				async.parallel([
					// Table function(s)
					function(callback) { // conn
						new datatable(conn, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // dns
						new datatable(dns, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // http
						new datatable(http, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // ssl
						new datatable(ssl, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // file
						new datatable(file, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // endpoint
						new datatable(endpoint, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // stealth
						if (req.session.passport.user.level === 3) {
							new datatable(stealth_conn, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						} else {
							callback();
						}
					},
					function(callback) { // stealth
						if (req.session.passport.user.level === 3) {
							new datatable(stealth_block, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						} else {
							callback();
						}
					},
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err);
					res.json({
						laneGraph: result,
						columns: columns
					});
				});
			} else {
				if (req.query.src_ip && (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1)) {
					var sankeyData;
					var info = [];
					var sankey_auth1 = {
						query: 'SELECT '+
								'count(*) AS `count`, '+
								'max(date_format(from_unixtime(stealth_conn.time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`src_ip`, '+
								'`dst_ip`, '+
								'(sum(in_bytes) / 1048576) as in_bytes, '+
								'(sum(out_bytes) / 1048576) as out_bytes, '+
								'sum(in_packets) as in_packets, '+
								'sum(out_packets) as out_packets '+
							'FROM '+
								'`stealth_conn` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `dst_ip` = ? '+
								// 'AND `out_bytes` > 0 '+
								'AND `in_bytes` > 0 '+
							'GROUP BY '+
								'`src_ip` '+
							'ORDER BY `count` DESC ',
						insert: [start, end, req.query.src_ip]
					}
					//from center node to local (center node is the lan) AUTH
					var sankey_auth2 = {
						query: 'SELECT '+
								'count(*) AS `count`, '+
								'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`lan_ip`, '+
								'`remote_ip`, '+
								'(sum(in_bytes) / 1048576) as in_bytes, '+
								'(sum(out_bytes) / 1048576) as out_bytes, '+
								'sum(in_packets) as in_packets, '+
								'sum(out_packets) as out_packets '+
							'FROM '+
								'`conn_meta` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								// 'AND `in_bytes` > 0 '+
								// 'AND ((`remote_ip` = ?) '+
								// 'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%")) '+
								'AND ((`remote_ip` = ? AND `out_bytes` > 0 ) '+
								'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%" AND `in_bytes` > 0 )) '+
							'GROUP BY '+
								'`lan_ip`, '+
								'`remote_ip` '+
							'ORDER BY `count` DESC ',
						insert: [start, end, req.query.src_ip, req.query.src_ip]
					}
					//from center to remote (center is the lan) AUTH
					var sankey_auth3 = {
						query: 'SELECT '+
								'count(*) AS `count`, '+
								'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`lan_ip`, '+
								'`remote_ip`, '+
								'(sum(in_bytes) / 1048576) as in_bytes, '+
								'(sum(out_bytes) / 1048576) as out_bytes, '+
								'sum(in_packets) as in_packets, '+
								'sum(out_packets) as out_packets '+
							'FROM '+
								'`conn_meta` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `out_bytes` > 0 '+
								'AND `lan_ip` = ? '+
								// 'AND NOT (remote_ip LIKE "192.168.222.%") '+
							'GROUP BY '+
								'`remote_ip` '+
							'ORDER BY `count` DESC LIMIT 10',
						insert: [start, end, req.query.src_ip]
					}
					var sankey_unauth1 = {
						query: 'SELECT '+
								'count(*) AS `count`, '+
								'max(date_format(from_unixtime(stealth_conn.time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`src_ip`, '+
								'`dst_ip`, '+
								'(sum(in_bytes) / 1048576) as in_bytes, '+
								'(sum(out_bytes) / 1048576) as out_bytes, '+
								'sum(in_packets) as in_packets, '+
								'sum(out_packets) as out_packets '+
							'FROM '+
								'`stealth_conn` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `dst_ip` = ? '+
								// 'AND `out_bytes` = 0 '+
								'AND `in_bytes` = 0 '+
							'GROUP BY '+
								'`src_ip` '+
							'ORDER BY `count` DESC ',
						insert: [start, end, req.query.src_ip]
					}
					//from center node to local (center node is the lan) AUTH
					var sankey_unauth2 = {
						query: 'SELECT '+
								'count(*) AS `count`, '+
								'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`lan_ip`, '+
								'`remote_ip`, '+
								'(sum(in_bytes) / 1048576) as in_bytes, '+
								'(sum(out_bytes) / 1048576) as out_bytes, '+
								'sum(in_packets) as in_packets, '+
								'sum(out_packets) as out_packets '+
							'FROM '+
								'`conn_meta` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								// 'AND `in_bytes` = 0 '+
								'AND ((`remote_ip` = ? AND `out_bytes` = 0 ) '+
								'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%" AND `in_bytes` = 0 )) '+
							'GROUP BY '+
								'`lan_ip`, '+
								'`remote_ip` '+
							'ORDER BY `count` DESC ',
						insert: [start, end, req.query.src_ip, req.query.src_ip]
					}
					//from center to remote (center is the lan) AUTH
					var sankey_unauth3 = {
						query: 'SELECT '+
								'count(*) AS `count`, '+
								'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`lan_ip`, '+
								'`remote_ip`, '+
								'(sum(in_bytes) / 1048576) as in_bytes, '+
								'(sum(out_bytes) / 1048576) as out_bytes, '+
								'sum(in_packets) as in_packets, '+
								'sum(out_packets) as out_packets '+
							'FROM '+
								'`conn_meta` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `out_bytes` = 0 '+
								'AND `lan_ip` = ? '+
								// 'AND NOT (remote_ip LIKE "192.168.222.%") '+
							'GROUP BY '+
								'`remote_ip` '+
							'ORDER BY `count` DESC LIMIT 10',
						insert: [start, end, req.query.src_ip]
					}
					//The rest of the queries are for the fisheye visual
					var conn = {
						query: 'SELECT '+
								'\'conn\' AS type, '+
								'`time` as raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
								'`ioc_count`,'+
								'`lan_zone`,'+
								'`machine`,'+
								'`lan_ip`,'+
								'`lan_port`,'+
								'`remote_ip`,'+
								'`remote_port`,'+
								'`remote_country`,'+
								'`remote_asn_name`,'+
								'`in_bytes`,'+
								'`out_bytes`,'+
								'`l7_proto`,'+
								'`ioc`,'+
								'`ioc_severity`,'+
								'`ioc_rule`,'+
								'`ioc_typeIndicator`,'+
								'`ioc_typeInfection` '+
							'FROM '+
								'`conn_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "Zone", select: "lan_zone"},
							{title: "Machine", select: "machine"},
							{title: "Local IP", select: "lan_ip"},
							{title: "Local Port", select: "lan_port"},
							{title: "Remote IP", select: "remote_ip"},
							{title: "Remote Port", select: "remote_port"},
							{title: "Remote Country", select: "remote_country"},
							{title: "Remote ASN", select: "remote_asn_name"},
							{title: "Application", select: "l7_proto"},
							{title: "Bytes to Remote", select: "in_bytes"},
							{title: "Bytes from Remote", select: "out_bytes"},
							{title: "IOC", select: "ioc"},
							{title: "IOC Severity", select: "ioc_severity"},
							{title: "IOC Type", select: "ioc_typeIndicator"},
							{title: "IOC Stage", select: "ioc_typeInfection"},
							{title: "IOC Rule", select: "ioc_rule"},
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var dns = {
						query: 'SELECT '+
								'\'dns\' AS type, '+
								'`time` as raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
								'`ioc_count`,'+
								'`proto`,'+
								'`qclass_name`,'+
								'`qtype_name`,'+
								'`query`,'+
								'`answers`,'+
								'`TTLs`,'+
								'`ioc`,'+
								'`ioc_severity`,'+
								'`ioc_rule`,'+
								'`ioc_typeIndicator`,'+
								'`ioc_typeInfection` '+
							'FROM '+
								'`dns_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "Protocol", select: "proto"},
							{title: "Query Class", select: "qclass_name"},
							{title: "Query Type", select: "qtype_name"},
							{title: "Query", select: "query"},
							{title: "Answers", select: "answers"},
							{title: "TTLs", select: "TTLs"},
							{title: "IOC", select: "ioc"},
							{title: "IOC Severity", select: "ioc_severity"},
							{title: "IOC Type", select: "ioc_typeIndicator"},
							{title: "IOC Stage", select: "ioc_typeInfection"},
							{title: "IOC Rule", select: "ioc_rule"},
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var http = {
						query: 'SELECT '+
								'\'http\' AS type, '+
								'`time` as raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
								'`ioc_count`,'+
								'`host`,'+
								'`uri`,'+
								'`referrer`,'+
								'`user_agent`,'+
								'`request_body_len`,'+
								'`response_body_len`,'+
								'`status_code`,'+
								'`status_msg`,'+
								'`info_code`,'+
								'`info_msg`,'+
								'`ioc`,'+
								'`ioc_severity`,'+
								'`ioc_rule`,'+
								'`ioc_typeIndicator`,'+
								'`ioc_typeInfection` '+
							'FROM '+
								'`http_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "Host", select: "host"},
							{title: "URI", select: "uri"},
							{title: "Referrer", select: "referrer"},
							{title: "User Agent", select: "user_agent"},
							{title: "IOC", select: "ioc"},
							{title: "IOC Severity", select: "ioc_severity"},
							{title: "IOC Type", select: "ioc_typeIndicator"},
							{title: "IOC Stage", select: "ioc_typeInfection"},
							{title: "IOC Rule", select: "ioc_rule"},
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var ssl = {
						query: 'SELECT '+
								'\'ssl \' AS type, '+
								'`time` as raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
								'`ioc_count`,'+
								'`version`,'+
								'`cipher`,'+
								'`server_name`,'+
								'`subject`,'+
								'`issuer_subject`,'+
								'`ioc`,'+
								'`ioc_severity`,'+
								'`ioc_rule`,'+
								'`ioc_typeIndicator`,'+
								'`ioc_typeInfection` '+	
							'FROM '+
								'`ssl_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "Server Name", select: "server_name"},
							{title: "Version", select: "version"},
							{title: "cipher", select: "cipher"},
							{title: "Subject", select: "subject"},
							{title: "Issuer Subject", select: "issuer_subject"},
							{title: "IOC", select: "ioc"},
							{title: "IOC Severity", select: "ioc_severity"},
							{title: "IOC Type", select: "ioc_typeIndicator"},
							{title: "IOC Stage", select: "ioc_typeInfection"},
							{title: "IOC Rule", select: "ioc_rule"},
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var file = {
						query: 'SELECT '+
								'\'file\' AS type, '+
								'`time` as raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
								'`ioc_count`,'+
								'`mime`,'+
								'`name`,'+
								'`size`,'+
								'`md5`,'+
								'`sha1`,'+
								'`ioc`,'+
								'`ioc_severity`,'+
								'`ioc_rule`,'+
								'`ioc_typeIndicator`,'+
								'`ioc_typeInfection` '+
							'FROM '+
								'`file_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "File Type", select: "mime"},
							{title: "Name", select: "name"},
							{title: "Size", select: "size"},
							{title: "MD5", select: "md5"},
							{title: "SHA1", select: "sha1"},
							{title: "IOC", select: "ioc"},
							{title: "IOC Severity", select: "ioc_severity"},
							{title: "IOC Type", select: "ioc_typeIndicator"},
							{title: "IOC Stage", select: "ioc_typeInfection"},
							{title: "IOC Rule", select: "ioc_rule"},
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var endpoint = {
						query: 'SELECT '+
								'\'endpoint\' AS type, '+
								'`time` as raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
								'`src_ip`,'+
								'`dst_ip`,'+
								'`src_user`,'+
								'`alert_source`,'+
								'`program_source`,'+
								'`alert_info` '+
							'FROM '+
								'`ossec` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "User", select: "src_user"},
							{title: "Source IP", select: "src_ip"},
							{title: "Destination IP", select: "dst_ip"},
							{title: "Alert Source", select: "alert_source"},
							{title: "Program Source", select: "program_source"},
							{title: "Alert Info", select: "alert_info"},
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var stealth_conn = {
						query: 'SELECT '+
								'\'stealth\' AS type,'+
								'`time` AS raw_time,'+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
								'`src_ip`,'+
								'`dst_ip`,'+
								'(`in_bytes` / 1048576) AS in_bytes,'+
								'(`out_bytes` / 1048576) AS out_bytes,'+
								'`in_packets`,'+
								'`out_packets` '+
							'FROM '+
								'`stealth_conn_meta` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `lan_ip`= ? ',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "Source IP", select: "src_ip"},
							{title: "Destination IP", select: "dst_ip"},
							{title: "MB from Remote", select: "in_bytes"},
							{title: "MB to Remote", select: "out_bytes"},
							{title: "Packets from Remote", select: "in_packets"},
							{title: "Packets to Remote", select: "out_packets"}
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
					var stealth_block = {
						query: 'SELECT '+
								'\'stealth_block\' AS type,'+
								'`time` AS raw_time, '+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
								'`src_ip`,'+
								'`dst_ip`,'+
								'(`in_bytes` / 1048576) AS in_bytes,'+
								'(`out_bytes` / 1048576) AS out_bytes,'+
								'`in_packets`,'+
								'`out_packets` '+
							'FROM '+
								'`stealth_conn_meta` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `src_ip` = ? '+
								'AND (`in_bytes` = 0 OR `out_bytes` = 0)',
						insert: [start, end, req.query.src_ip],
						params: [
							{title: "Time", select: "time"},
							{title: "Source IP", select: "src_ip"},
							{title: "Destination IP", select: "dst_ip"},
							{title: "MB from Remote", select: "in_bytes"},
							{title: "MB to Remote", select: "out_bytes"},
							{title: "Packets from Remote", select: "in_packets"},
							{title: "Packets to Remote", select: "out_packets"}
						],
						settings: {
							sort: [[1, 'desc']],
							div: 'table',
							title: 'Indicators of Compromise (IOC) Notifications',
							pageBreakBefore: false
						}
					}
                    var sankeyData;
                    var info = [];
                    var sankey_auth1 = {
                        query: 'SELECT '+
                                'count(*) AS `count`, '+
                                'max(date_format(from_unixtime(stealth_conn.time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                                '`src_ip`, '+
                                '`dst_ip`, '+
                                '(sum(in_bytes) / 1048576) as in_bytes, '+
                                '(sum(out_bytes) / 1048576) as out_bytes, '+
                                'sum(in_packets) as in_packets, '+
                                'sum(out_packets) as out_packets '+
                            'FROM '+
                                '`stealth_conn` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `dst_ip` = ? '+
                                // 'AND `out_bytes` > 0 '+
                                'AND `in_bytes` > 0 '+
                            'GROUP BY '+
                                '`src_ip` '+
                            'ORDER BY `count` DESC ',
                        insert: [start, end, req.query.src_ip]
                    }
                    //from center node to local (center node is the lan) AUTH
                    var sankey_auth2 = {
                        query: 'SELECT '+
                                'count(*) AS `count`, '+
                                'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                                '`lan_ip`, '+
                                '`remote_ip`, '+
                                '(sum(in_bytes) / 1048576) as in_bytes, '+
                                '(sum(out_bytes) / 1048576) as out_bytes, '+
                                'sum(in_packets) as in_packets, '+
                                'sum(out_packets) as out_packets '+
                            'FROM '+
                                '`conn_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                // 'AND `in_bytes` > 0 '+
                                // 'AND ((`remote_ip` = ?) '+
                                // 'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%")) '+
                                'AND ((`remote_ip` = ? AND `out_bytes` > 0 ) '+
                                'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%" AND `in_bytes` > 0 )) '+
                            'GROUP BY '+
                                '`lan_ip`, '+
                                '`remote_ip` '+
                            'ORDER BY `count` DESC ',
                        insert: [start, end, req.query.src_ip, req.query.src_ip]
                    }
                    //from center to remote (center is the lan) AUTH
                    var sankey_auth3 = {
                        query: 'SELECT '+
                                'count(*) AS `count`, '+
                                'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                                '`lan_ip`, '+
                                '`remote_ip`, '+
                                '(sum(in_bytes) / 1048576) as in_bytes, '+
                                '(sum(out_bytes) / 1048576) as out_bytes, '+
                                'sum(in_packets) as in_packets, '+
                                'sum(out_packets) as out_packets '+
                            'FROM '+
                                '`conn_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `out_bytes` > 0 '+
                                'AND `lan_ip` = ? '+
                                // 'AND NOT (remote_ip LIKE "192.168.222.%") '+
                            'GROUP BY '+
                                '`remote_ip` '+
                            'ORDER BY `count` DESC LIMIT 10',
                        insert: [start, end, req.query.src_ip]
                    }
                    var sankey_unauth1 = {
                        query: 'SELECT '+
                                'count(*) AS `count`, '+
                                'max(date_format(from_unixtime(stealth_conn.time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                                '`src_ip`, '+
                                '`dst_ip`, '+
                                '(sum(in_bytes) / 1048576) as in_bytes, '+
                                '(sum(out_bytes) / 1048576) as out_bytes, '+
                                'sum(in_packets) as in_packets, '+
                                'sum(out_packets) as out_packets '+
                            'FROM '+
                                '`stealth_conn` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `dst_ip` = ? '+
                                // 'AND `out_bytes` = 0 '+
                                'AND `in_bytes` = 0 '+
                            'GROUP BY '+
                                '`src_ip` '+
                            'ORDER BY `count` DESC ',
                        insert: [start, end, req.query.src_ip]
                    }
                    //from center node to local (center node is the lan) AUTH
                    var sankey_unauth2 = {
                        query: 'SELECT '+
                                'count(*) AS `count`, '+
                                'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                                '`lan_ip`, '+
                                '`remote_ip`, '+
                                '(sum(in_bytes) / 1048576) as in_bytes, '+
                                '(sum(out_bytes) / 1048576) as out_bytes, '+
                                'sum(in_packets) as in_packets, '+
                                'sum(out_packets) as out_packets '+
                            'FROM '+
                                '`conn_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                // 'AND `in_bytes` = 0 '+
                                'AND ((`remote_ip` = ? AND `out_bytes` = 0 ) '+
                                'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%" AND `in_bytes` = 0 )) '+
                            'GROUP BY '+
                                '`lan_ip`, '+
                                '`remote_ip` '+
                            'ORDER BY `count` DESC ',
                        insert: [start, end, req.query.src_ip, req.query.src_ip]
                    }
                    //from center to remote (center is the lan) AUTH
                    var sankey_unauth3 = {
                        query: 'SELECT '+
                                'count(*) AS `count`, '+
                                'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                                '`lan_ip`, '+
                                '`remote_ip`, '+
                                '(sum(in_bytes) / 1048576) as in_bytes, '+
                                '(sum(out_bytes) / 1048576) as out_bytes, '+
                                'sum(in_packets) as in_packets, '+
                                'sum(out_packets) as out_packets '+
                            'FROM '+
                                '`conn_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `out_bytes` = 0 '+
                                'AND `lan_ip` = ? '+
                                // 'AND NOT (remote_ip LIKE "192.168.222.%") '+
                            'GROUP BY '+
                                '`remote_ip` '+
                            'ORDER BY `count` DESC LIMIT 10',
                        insert: [start, end, req.query.src_ip]
                    }

					async.parallel([
						// SWIMLANE	
						function(callback) { // conn
							new datatable(conn, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						},
						function(callback) { // dns
							new datatable(dns, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						},
						function(callback) { // http
							new datatable(http, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						},
						function(callback) { // ssl
							new datatable(ssl, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						},
						function(callback) { // file
							new datatable(file, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						},
						function(callback) { // endpoint
							new datatable(endpoint, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						},
						function(callback) { // stealth
							if (req.session.passport.user.level === 3) {
								new datatable(stealth_conn, {database: database, pool:pool}, function(err, data){
									console.log(data)
									handleReturn(data, callback);
								});
							} else {
								callback();
							}
						},
						function(callback) { // stealth block
							if (req.session.passport.user.level === 3) {
								new datatable(stealth_block, {database: database, pool:pool}, function(err, data){
									console.log(data)
									handleReturn(data, callback);
								});
							} else {
								callback();
							}
						},
                        function(callback) {
                            new sankey(sankey_auth1, sankey_auth2, sankey_auth3, sankey_unauth1, sankey_unauth2, sankey_unauth3, {database: database, pool: pool}, function(err,data){
                                sankeyData = data;
                                callback();
                            });
                        }
					], function(err) { //This function gets called after the two tasks have called their "task callbacks"
						if (err) throw console.log(err)
						res.json({
							sankey: sankeyData,
							info: info,
							columns: columns,
							laneGraph: result,
							start: start,
							end: end
						});
					});
				} else {
					res.redirect('/');
				}
			}
		}
	}
};