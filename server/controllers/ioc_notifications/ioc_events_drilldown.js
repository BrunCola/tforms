'use strict';

var query = require('../constructors/query'),
	config = require('../../config/config'),
	query = require('../constructors/query'),
	force = require('../constructors/force'),
	treechart = require('../constructors/treechart'),
	async = require('async');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var result = [];
			function handleReturn(data, callback) {
				if ((data !== null) && (data.length > 0)) {
					result.push(data);
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
				pointGroup = 1;
			}

			if (req.query.type === 'drill') {
				var conn_ioc = {
					query: 'SELECT '+
							'\'conn_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`conn` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ? '+
							'AND `lan_ip`= ? '+
							'AND `remote_ip`= ? '+
							'AND `ioc`=? ',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var conn = {
					query: 'SELECT '+
							'\'conn\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`conn` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ? '+
							'AND `lan_ip`= ? ',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var dns_ioc = {
					query: 'SELECT '+
							'\'dns_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`dns` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ? '+
							'AND `lan_ip`= ? '+
							'AND `remote_ip`= ? '+
							'AND `ioc`=?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var dns = {
					query: 'SELECT '+
							'\'dns\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`dns` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`=?'+
							'AND `lan_ip`=?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var http_ioc = {
					query: 'SELECT '+
							'\'http_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`http` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ? '+
							'AND `lan_ip`= ? '+
							'AND `remote_ip`= ? '+
							'AND `ioc`=?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var http = {
					query: 'SELECT '+
							'\'http\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`http` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ?'+
							'AND `lan_ip`= ?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var ssl_ioc = {
					query: 'SELECT '+
							'\'ssl_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`ssl` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ? '+
							'AND `lan_ip`= ? '+
							'AND `remote_ip`= ? '+
							'AND `ioc`=?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var ssl = {
					query: 'SELECT '+
							'\'ssl\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`ssl` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ?'+
							'AND `lan_ip`= ?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var file_ioc = {
					query: 'SELECT '+
							'\'file_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`file` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ? '+
							'AND `lan_ip`=? '+
							'AND `remote_ip`= ? '+
							'AND `ioc`=?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var file = {
					query: 'SELECT '+
							'\'file\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`file` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone`= ?'+
							'AND `lan_ip`= ?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var endpoint = {
					query: 'SELECT '+
							'\'endpoint\' AS type, '+
							'`time` as raw_time, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
						'FROM '+
							'`ossec` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `src_ip`= ? ',
					insert: [start, end, req.query.lan_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}

				var stealth_conn = {
					query: 'SELECT '+
							'\'stealth\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
							'`src_ip`,'+
							'`dst_ip`,'+
							'(`in_bytes` / 1048576) as in_bytes,'+
							'(`out_bytes` / 1048576) as out_bytes,'+
							'`in_packets`,'+
							'`out_packets` '+
						'FROM '+
							'`stealth_conn` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `src_ip`= ? '+
							'AND `in_bytes` > 0 '+
							'AND `out_bytes` > 0 ',
					insert: [start, end, req.query.src_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var stealth1 = {
					query: 'SELECT '+
							'\'stealth_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
							'`src_ip`, '+
							'`dst_ip`, '+
							'(`in_bytes` / 1048576) as in_bytes, '+
							'(`out_bytes` / 1048576) as out_bytes, '+
							'`in_packets`, '+
							'`out_packets` '+
						'FROM '+
							'`stealth_conn` '+
						'WHERE '+
							'time BETWEEN ? AND ? '+
							'AND `dst_ip` = ? '+
							'AND `in_bytes` = 0 ',
					insert: [start, end, req.query.src_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var stealth2 = {
					query: 'SELECT '+
							'\'stealth_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
							'`lan_ip`, '+
							'`remote_ip`, '+
							'(`in_bytes` / 1048576) as in_bytes, '+
							'(`out_bytes` / 1048576) as out_bytes, '+
							'`in_packets`, '+
							'`out_packets` '+
						'FROM '+
							'`conn_meta` '+
						'WHERE '+
							'time BETWEEN ? AND ? '+
							'AND ((`remote_ip` = ? AND `out_bytes` = 0 ) '+
							'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%" AND `in_bytes` = 0 )) ',
					insert: [start, end, req.query.src_ip, req.query.src_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}
				var stealth3 = {
					query:'SELECT '+
							'\'stealth_ioc\' AS type, '+
							'`time` as raw_time, '+
							'`ioc_count` as ioc_count, '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
							'`lan_ip`, '+
							'`remote_ip`, '+
							'(`in_bytes` / 1048576) as in_bytes, '+
							'(`out_bytes` / 1048576) as out_bytes, '+
							'`in_packets`, '+
							'`out_packets` '+
						'FROM '+
							'`conn_meta` '+
						'WHERE '+
							'time BETWEEN ? AND ? '+
							'AND `out_bytes` = 0 '+
							'AND `lan_ip` = ? ',
					insert: [start, end, req.query.src_ip, req.query.src_ip],
					start: start,
					end: end,
					grouping: pointGroup
				}


				async.parallel([
					// Table function(s)
					function(callback) { // conn_ioc
						new query(conn_ioc, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // conn
						new query(conn, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // dns_ioc
						new query(dns_ioc, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // dns
						new query(dns, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // http_ioc
						new query(http_ioc, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // http
						new query(http, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // ssl_ioc
						new query(ssl_ioc, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // ssl
						new query(ssl, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // file_ioc
						new query(file_ioc, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // file
						new query(file, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // endpoint
						new query(endpoint, {database: database, pool:pool}, function(err, data){
							handleReturn(data, callback);
						});
					},
					function(callback) { // stealth
						if (req.session.passport.user.level === 3) {
							new query(stealth_conn, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						} else {
							callback();
						}
					},
					function(callback) { // stealth
						if (req.session.passport.user.level === 3) {
							new query(stealth1, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						} else {
							callback();
						}
					},
					function(callback) { // stealth
						if (req.session.passport.user.level === 3) {
							new query(stealth2, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						} else {
							callback();
						}
					},
					function(callback) { // stealth
						if (req.session.passport.user.level === 3) {
							new query(stealth3, {database: database, pool:pool}, function(err, data){
								handleReturn(data, callback);
							});
						} else {
							callback();
						}
					}
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err);
					res.json({
						laneGraph: result
					});
				});
			} else if (req.query.type === 'assets') {
				if (req.query.lan_ip && req.query.lan_zone) {
					var sql = {
						query: 'SELECT `file` FROM assets where lan_ip = ? AND lan_zone = ?',
						insert: [req.query.lan_ip, req.query.lan_zone]
					}
					new query(sql, {database: database, pool: pool}, function(err,data){
						res.json(data)
					});
				}
			} else {
				if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip && req.query.ioc && req.query.ioc_attrID) {
						var crossfilter;
						// var conn_ioc = {
						// 	query: 'SELECT '+
						// 			'`time`, '+ // Last Seen
						// 			'`ioc_count`,'+
						// 			'`lan_zone`,'+
						// 			'`machine`,'+
						// 			'`lan_ip`,'+
						// 			'`lan_port`,'+
						// 			'`remote_ip`,'+
						// 			'`remote_port`,'+
						// 			'`remote_country`,'+
						// 			'`remote_asn_name`,'+
						// 			'`in_bytes`,'+
						// 			'`out_bytes`,'+
						// 			'`l7_proto`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`conn_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ? '+
						// 			'AND `lan_ip`= ? '+
						// 			'AND `remote_ip`= ? '+
						// 			'AND `ioc`=? ',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Zone", "mData": "lan_zone"},
						// 		{"sTitle": "Machine", "mData": "machine"},
						// 		{"sTitle": "Local IP", "mData": "lan_ip"},
						// 		{"sTitle": "Local Port", "mData": "lan_port"},
						// 		{"sTitle": "Remote IP", "mData": "remote_ip"},
						// 		{"sTitle": "Remote Port", "mData": "remote_port"},
						// 		{"sTitle": "Remote Country", "mData": "remote_country"},
						// 		{"sTitle": "Remote ASN", "mData": "remote_asn_name"},
						// 		{"sTitle": "Application", "mData": "l7_proto"},
						// 		{"sTitle": "Bytes to Remote", "mData": "in_bytes"},
						// 		{"sTitle": "Bytes from  Remote", "mData": "out_bytes"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'conn_ioc'
						// }
						// var conn = {
						// 	query: 'SELECT '+
						// 			'`time`, '+
						// 			'`ioc_count`,'+
						// 			'`lan_zone`,'+
						// 			'`machine`,'+
						// 			'`lan_ip`,'+
						// 			'`lan_port`,'+
						// 			'`remote_ip`,'+
						// 			'`remote_port`,'+
						// 			'`remote_country`,'+
						// 			'`remote_asn_name`,'+
						// 			'`in_bytes`,'+
						// 			'`out_bytes`,'+
						// 			'`l7_proto`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`conn_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ? '+
						// 			'AND `lan_ip`= ? ',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Zone", "mData": "lan_zone"},
						// 		{"sTitle": "Machine", "mData": "machine"},
						// 		{"sTitle": "Local IP", "mData": "lan_ip"},
						// 		{"sTitle": "Local Port", "mData": "lan_port"},
						// 		{"sTitle": "Remote IP", "mData": "remote_ip"},
						// 		{"sTitle": "Remote Port", "mData": "remote_port"},
						// 		{"sTitle": "Remote Country", "mData": "remote_country"},
						// 		{"sTitle": "Remote ASN", "mData": "remote_asn_name"},
						// 		{"sTitle": "Application", "mData": "l7_proto"},
						// 		{"sTitle": "Bytes to Remote", "mData": "in_bytes"},
						// 		{"sTitle": "Bytes from Remote", "mData": "out_bytes"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'conn'
						// }
						// var dns_ioc = {
						// 	query: 'SELECT '+
						// 			'`time`, '+
						// 			'`ioc_count`,'+
						// 			'`proto`, '+
						// 			'`qclass_name`, '+
						// 			'`qtype_name`, '+
						// 			'`query`, '+
						// 			'`answers`, '+
						// 			'`TTLs`, '+
						// 			'`ioc`, '+
						// 			'`ioc_severity`, '+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`, '+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`dns_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ? '+
						// 			'AND `lan_ip`= ? '+
						// 			'AND `remote_ip`= ? '+
						// 			'AND `ioc`=?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Protocol", "mData": "proto"},
						// 		{"sTitle": "Query Class", "mData": "qclass_name"},
						// 		{"sTitle": "Query Type", "mData": "qtype_name"},
						// 		{"sTitle": "Query", "mData": "query"},
						// 		{"sTitle": "Answers", "mData": "answers"},
						// 		{"sTitle": "TTLs", "mData": "TTLs"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'dns_ioc'
						// }
						// var dns = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`proto`,'+
						// 			'`qclass_name`,'+
						// 			'`qtype_name`,'+
						// 			'`query`,'+
						// 			'`answers`,'+
						// 			'`TTLs`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`dns_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`=?'+
						// 			'AND `lan_ip`=?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Protocol", "mData": "proto"},
						// 		{"sTitle": "Query Class", "mData": "qclass_name"},
						// 		{"sTitle": "Query Type", "mData": "qtype_name"},
						// 		{"sTitle": "Query", "mData": "query"},
						// 		{"sTitle": "Answers", "mData": "answers"},
						// 		{"sTitle": "TTLs", "mData": "TTLs"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'dns'
						// }
						// var http_ioc = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`host`,'+
						// 			'`uri`,'+
						// 			'`referrer`,'+
						// 			'`user_agent`,'+
						// 			'`request_body_len`,'+
						// 			'`response_body_len`,'+
						// 			'`status_code`,'+
						// 			'`status_msg`,'+
						// 			'`info_code`,'+
						// 			'`info_msg`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`http_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ? '+
						// 			'AND `lan_ip`= ? '+
						// 			'AND `remote_ip`= ? '+
						// 			'AND `ioc`=?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Host", "mData": "host"},
						// 		{"sTitle": "URI", "mData": "uri"},
						// 		{"sTitle": "Referrer", "mData": "referrer"},
						// 		{"sTitle": "User Agent", "mData": "user_agent"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'http_ioc'
						// }
						// var http = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`host`,'+
						// 			'`uri`,'+
						// 			'`referrer`,'+
						// 			'`user_agent`,'+
						// 			'`request_body_len`,'+
						// 			'`response_body_len`,'+
						// 			'`status_code`,'+
						// 			'`status_msg`,'+
						// 			'`info_code`,'+
						// 			'`info_msg`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`http_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ?'+
						// 			'AND `lan_ip`= ?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Host", "mData": "host"},
						// 		{"sTitle": "URI", "mData": "uri"},
						// 		{"sTitle": "Referrer", "mData": "referrer"},
						// 		{"sTitle": "User Agent", "mData": "user_agent"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'http'
						// }
						// var ssl_ioc = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`version`,'+
						// 			'`cipher`,'+
						// 			'`server_name`,'+
						// 			'`subject`,'+
						// 			'`issuer_subject`,'+
						// 			'from_unixtime(`not_valid_before`) AS not_valid_before,'+
						// 			'from_unixtime(`not_valid_after`) AS not_valid_after,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+	
						// 		'FROM '+
						// 			'`ssl_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ? '+
						// 			'AND `lan_ip`= ? '+
						// 			'AND `remote_ip`= ? '+
						// 			'AND `ioc`=?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Server Name", "mData": "server_name"},
						// 		{"sTitle": "Version", "mData": "version"},
						// 		{"sTitle": "cipher", "mData": "cipher"},
						// 		{"sTitle": "Subject", "mData": "subject"},
						// 		{"sTitle": "Issuer Subject", "mData": "issuer_subject"},
						// 		{"sTitle": "Not Valid Before", "mData": "not_valid_before"},
						// 		{"sTitle": "Not Valid After", "mData": "not_valid_after"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'ssl_ioc'
						// }
						// var ssl = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`version`,'+
						// 			'`cipher`,'+
						// 			'`server_name`,'+
						// 			'`subject`,'+
						// 			'`issuer_subject`,'+
						// 			'from_unixtime(`not_valid_before`) AS not_valid_before,'+
						// 			'from_unixtime(`not_valid_after`) AS not_valid_after,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+	
						// 		'FROM '+
						// 			'`ssl_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ?'+
						// 			'AND `lan_ip`= ?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "Server Name", "mData": "server_name"},
						// 		{"sTitle": "Version", "mData": "version"},
						// 		{"sTitle": "cipher", "mData": "cipher"},
						// 		{"sTitle": "Subject", "mData": "subject"},
						// 		{"sTitle": "Issuer Subject", "mData": "issuer_subject"},
						// 		{"sTitle": "Not Valid Before", "mData": "not_valid_before"},
						// 		{"sTitle": "Not Valid After", "mData": "not_valid_after"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'ssl'
						// }
						// var file_ioc = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`mime`,'+
						// 			'`name`,'+
						// 			'`size`,'+
						// 			'`md5`,'+
						// 			'`sha1`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`file_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ? '+
						// 			'AND `lan_ip`=? '+
						// 			'AND `remote_ip`= ? '+
						// 			'AND `ioc`=?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "File Type", "mData": "mime"},
						// 		{"sTitle": "Name", "mData": "name"},
						// 		{"sTitle": "Size", "mData": "size"},
						// 		{"sTitle": "MD5", "mData": "md5"},
						// 		{"sTitle": "SHA1", "mData": "sha1"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'file_ioc'
						// }
						// var file = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`ioc_count`,'+
						// 			'`mime`,'+
						// 			'`name`,'+
						// 			'`size`,'+
						// 			'`md5`,'+
						// 			'`sha1`,'+
						// 			'`ioc`,'+
						// 			'`ioc_severity`,'+
						// 			'`ioc_rule`,'+
						// 			'`ioc_typeIndicator`,'+
						// 			'`ioc_typeInfection` '+
						// 		'FROM '+
						// 			'`file_ioc` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `lan_zone`= ?'+
						// 			'AND `lan_ip`= ?',
						// 	insert: [start, end, req.query.lan_zone, req.query.lan_ip],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "File Type", "mData": "mime"},
						// 		{"sTitle": "Name", "mData": "name"},
						// 		{"sTitle": "Size", "mData": "size"},
						// 		{"sTitle": "MD5", "mData": "md5"},
						// 		{"sTitle": "SHA1", "mData": "sha1"},
						// 		{"sTitle": "IOC", "mData": "ioc"},
						// 		{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						// 		{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						// 		{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						// 		{"sTitle": "IOC Rule", "mData": "ioc_rule"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'file'
						// }
						// var endpoint = {
						// 	query: 'SELECT '+
						// 			'`time`,'+
						// 			'`src_ip`,'+
						// 			'`dst_ip`,'+
						// 			'`src_user`,'+
						// 			'`alert_source`,'+
						// 			'`program_source`,'+
						// 			'`alert_info` '+
						// 		'FROM '+
						// 			'`ossec` '+
						// 		'WHERE '+
						// 			'`time` BETWEEN ? AND ? '+
						// 			'AND `src_ip`= ? ',
						// 	insert: [start, end, req.query.lan_ip],
						// 	columns: [
						// 		{"sTitle": "Time", "mData": "time"},
						// 		{"sTitle": "User", "mData": "src_user"},
						// 		{"sTitle": "Source IP", "mData": "src_ip"},
						// 		{"sTitle": "Destination IP", "mData": "dst_ip"},
						// 		{"sTitle": "Alert Source", "mData": "alert_source"},
						// 		{"sTitle": "Program Source", "mData": "program_source"},
						// 		{"sTitle": "Alert Info", "mData": "alert_info"},
						// 	],
						// 	start: start,
						// 	end: end,
						// 	grouping: pointGroup,
						// 	sClass: 'endpoint'
						// }











						var conn_ioc = {
							query: 'SELECT '+
									'\'conn_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`conn_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ? '+
									'AND `lan_ip`= ? '+
									'AND `remote_ip`= ? '+
									'AND `ioc`=? ',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var conn = {
							query: 'SELECT '+
									'\'conn\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`conn_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ? '+
									'AND `lan_ip`= ? ',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var dns_ioc = {
							query: 'SELECT '+
									'\'dns_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`dns_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ? '+
									'AND `lan_ip`= ? '+
									'AND `remote_ip`= ? '+
									'AND `ioc`=?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var dns = {
							query: 'SELECT '+
									'\'dns\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`dns_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`=?'+
									'AND `lan_ip`=?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var http_ioc = {
							query: 'SELECT '+
									'\'http_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`http_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ? '+
									'AND `lan_ip`= ? '+
									'AND `remote_ip`= ? '+
									'AND `ioc`=?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var http = {
							query: 'SELECT '+
									'\'http\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`http_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ?'+
									'AND `lan_ip`= ?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var ssl_ioc = {
							query: 'SELECT '+
									'\'ssl_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`ssl_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ? '+
									'AND `lan_ip`= ? '+
									'AND `remote_ip`= ? '+
									'AND `ioc`=?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var ssl = {
							query: 'SELECT '+
									'\'ssl\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`ssl_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ?'+
									'AND `lan_ip`= ?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var file_ioc = {
							query: 'SELECT '+
									'\'file_ioc\' AS type, '+
									'`ioc_count` as ioc_count, '+
									'`time` as raw_time, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`file_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ? '+
									'AND `lan_ip`=? '+
									'AND `remote_ip`= ? '+
									'AND `ioc`=?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var file = {
							query: 'SELECT '+
									'\'file\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`file_ioc` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `lan_zone`= ?'+
									'AND `lan_ip`= ?',
							insert: [start, end, req.query.lan_zone, req.query.lan_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var endpoint = {
							query: 'SELECT '+
									'\'endpoint\' AS type, '+
									'`time` as raw_time, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
								'FROM '+
									'`ossec` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `src_ip`= ? ',
							insert: [start, end, req.query.lan_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}

						var stealth_conn = {
							query: 'SELECT '+
									'\'stealth\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
									'`src_ip`,'+
									'`dst_ip`,'+
									'(`in_bytes` / 1048576) as in_bytes,'+
									'(`out_bytes` / 1048576) as out_bytes,'+
									'`in_packets`,'+
									'`out_packets` '+
								'FROM '+
									'`stealth_conn` '+
								'WHERE '+
									'`time` BETWEEN ? AND ? '+
									'AND `src_ip`= ? '+
									'AND `in_bytes` > 0 '+
									'AND `out_bytes` > 0 ',
							insert: [start, end, req.query.src_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var stealth1 = {
							query: 'SELECT '+
									'\'stealth_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
									'`src_ip`, '+
									'`dst_ip`, '+
									'(`in_bytes` / 1048576) as in_bytes, '+
									'(`out_bytes` / 1048576) as out_bytes, '+
									'`in_packets`, '+
									'`out_packets` '+
								'FROM '+
									'`stealth_conn` '+
								'WHERE '+
									'time BETWEEN ? AND ? '+
									'AND `dst_ip` = ? '+
									'AND `in_bytes` = 0 ',
							insert: [start, end, req.query.src_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var stealth2 = {
							query: 'SELECT '+
									'\'stealth_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
									'`lan_ip`, '+
									'`remote_ip`, '+
									'(`in_bytes` / 1048576) as in_bytes, '+
									'(`out_bytes` / 1048576) as out_bytes, '+
									'`in_packets`, '+
									'`out_packets` '+
								'FROM '+
									'`conn_meta` '+
								'WHERE '+
									'time BETWEEN ? AND ? '+
									'AND ((`remote_ip` = ? AND `out_bytes` = 0 ) '+
									'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%" AND `in_bytes` = 0 )) ',
							insert: [start, end, req.query.src_ip, req.query.src_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}
						var stealth3 = {
							query:'SELECT '+
									'\'stealth_ioc\' AS type, '+
									'`time` as raw_time, '+
									'`ioc_count` as ioc_count, '+
									'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time '+
									'`lan_ip`, '+
									'`remote_ip`, '+
									'(`in_bytes` / 1048576) as in_bytes, '+
									'(`out_bytes` / 1048576) as out_bytes, '+
									'`in_packets`, '+
									'`out_packets` '+
								'FROM '+
									'`conn_meta` '+
								'WHERE '+
									'time BETWEEN ? AND ? '+
									'AND `out_bytes` = 0 '+
									'AND `lan_ip` = ? ',
							insert: [start, end, req.query.src_ip, req.query.src_ip],
							start: start,
							end: end,
							grouping: pointGroup
						}


						var info = {};
						var InfoSQL = {
							query: 'SELECT '+
									'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as last, '+
									'date_format(min(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as first, '+
									'sum(`in_packets`) as in_packets, '+
									'sum(`out_packets`) as out_packets, '+
									'sum(`in_bytes`) as in_bytes, '+
									'sum(`out_bytes`) as out_bytes, '+
									'`machine`, '+
									'`lan_zone`, '+
									'`lan_port`, '+
									'`remote_port`, '+
									'`remote_cc`, '+
									'`remote_country`, '+
									'`remote_asn`, '+
									'`remote_asn_name`, '+
									'`l7_proto`, '+
									'`ioc_rule`, '+
									'`ioc_typeIndicator` '+
								'FROM `conn_ioc` '+
								'WHERE '+
									'`lan_ip` = ? AND '+
									'`remote_ip` = ? AND '+
									'`ioc` = ? '+
								'LIMIT 1',
							insert: [req.query.lan_ip, req.query.remote_ip, req.query.ioc]
						}
						var Info2SQL = {
							query: 'SELECT '+
								'`description` '+
								'FROM `ioc_parent` '+
								'WHERE '+
								'`ioc_parent` = ? '+
								'LIMIT 1',
							insert: [req.query.ioc]
						}
						var treereturn = [];
						var treeSQL = {
							query: 'SELECT '+
								// SELECTS
									'ioc_attrID, '+
									'ioc_childID, '+
									'ioc_parentID, '+
									'ioc_typeIndicator, '+
									'ioc_severity, '+
									'conn_ioc.ioc '+
							//		'id_attr, '+
							//		'typeIndicator '+
								// !SELECTS
								'FROM conn_ioc '+
							//	'JOIN cyrin.ioc '+
							//		'ON ioc_childID = id_child '+
								'WHERE time BETWEEN ? AND ? '+
									'AND `lan_ip`= ? '+
								'GROUP BY  ioc_parentID, ioc_childID, ioc_attrID',// id_attr',
							insert: [start, end, req.query.lan_ip]
						}
						var forcereturn = [];
						var forceSQL = {
							query: 'SELECT '+
								// SELECTS
								'`remote_ip`, '+
								'count(*) as count '+
								// !SELECTS
								'FROM conn_ioc '+
								'WHERE time BETWEEN ? AND ? '+
								'AND `lan_ip`= ? '+
								'GROUP BY remote_ip',
							insert: [start, end, req.query.lan_ip]
						}
						var lanIP = req.query.lan_ip;
						var attrID = req.query.ioc_attrID;
						async.parallel([
							// Table function(s)
							function(callback) { // conn_ioc
								new query(conn_ioc, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // conn
								new query(conn, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // dns_ioc
								new query(dns_ioc, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // dns
								new query(dns, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // http_ioc
								new query(http_ioc, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // http
								new query(http, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // ssl_ioc
								new query(ssl_ioc, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // ssl
								new query(ssl, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // file_ioc
								new query(file_ioc, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // file
								new query(file, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // endpoint
								new query(endpoint, {database: database, pool:pool}, function(err, data){
									handleReturn(data, callback);
								});
							},
							function(callback) { // InfoSQL
								new query(InfoSQL, {database: database, pool: pool}, function(err,data){
									info.main = data;
									callback();
								});
							},
							function(callback) { // Info2SQL
								new query(Info2SQL, {database: 'rp_ioc_intel', pool: pool}, function(err,data){
									info.desc = data;
									callback();
								});
							},
							function(callback) {
								new force(forceSQL, {database: database, pool: pool}, lanIP, function(err,data){
									forcereturn = data;
									callback();
								});
							},
							function(callback) {
								new treechart(treeSQL, {database: database, pool: pool}, lanIP, attrID, function(err,data){
									treereturn = data;
									callback();
								});
							},
							function(callback) { // stealth
								if (req.session.passport.user.level === 3) {
									new query(stealth_conn, {database: database, pool:pool}, function(err, data){
										handleReturn(data, callback);
									});
								} else {
									callback();
								}
							},
							function(callback) { // stealth
								if (req.session.passport.user.level === 3) {
									new query(stealth1, {database: database, pool:pool}, function(err, data){
										handleReturn(data, callback);
									});
								} else {
									callback();
								}
							},
							function(callback) { // stealth
								if (req.session.passport.user.level === 3) {
									new query(stealth2, {database: database, pool:pool}, function(err, data){
										handleReturn(data, callback);
									});
								} else {
									callback();
								}
							},
							function(callback) { // stealth
								if (req.session.passport.user.level === 3) {
									new query(stealth3, {database: database, pool:pool}, function(err, data){
										handleReturn(data, callback);
									});
								} else {
									callback();
								}
							}
						], function(err) { //This function gets called after the two tasks have called their "task callbacks"
							if (err) throw console.log(err);
							// var results = {
							// 	info: info,
							// 	tables: tables
							// };
							//console.log(results);
							res.json({
								info: info,
								laneGraph: result,
								start: start,
								end: end,
								tree: treereturn,
								force: forcereturn
							});
						});
					} else {
						res.redirect('/');
					}
				}
			}
	}
};