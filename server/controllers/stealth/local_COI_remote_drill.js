'use strict';

var sankey = require('../constructors/sankey_new'),
	fisheye = require('../constructors/fisheye'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

var permissions = [3];

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var result = [];
			var largestGroup = 0;
			var largestIOC = 0;
			function handleReturn(data, maxConn, maxIOC, callback) {
				if (data) {
					result.push(data);
					if (maxConn >= largestGroup) {
						largestGroup = maxConn;
					}
					if (maxIOC >= largestIOC) {
						largestIOC = maxIOC;
					}
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
			if (req.query.ip && (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1)) {
				var sankeyData;
				var info = [];
				var sankey1 = {
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
						'GROUP BY '+
							'`src_ip` '+
						'ORDER BY `count` DESC ',
					insert: [start, end, req.query.ip]
				}
				var sankey2 = {
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
							'AND ((`remote_ip` = ?) '+
							'OR (`lan_ip` = ? AND remote_ip LIKE "192.168.222.%")) '+
						'GROUP BY '+
							'`lan_ip`, '+
							'`remote_ip` '+
						'ORDER BY `count` DESC ',
					insert: [start, end, req.query.ip, req.query.ip]
				}
				var sankey3 = {
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
							'AND `lan_ip` = ? '+
							'AND NOT (remote_ip LIKE "192.168.222.%") '+
						'GROUP BY '+
							'`remote_ip` '+
						'ORDER BY `count` DESC LIMIT 10',
					insert: [start, end, req.query.ip]
				}
				//The rest of the queries are for the fisheye visual
				var stealth_conn = {
					query: 'SELECT '+
							'`time`, '+
							'`src_ip`,'+
							'`dst_ip`,'+
							'`(in_bytes / 1048576) as in_bytes`,'+
							'`(out_bytes / 1048576) as out_bytes`,'+
							'`in_packets`,'+
							'`out_packets` '+
						'FROM '+
							'`stealth_conn` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `src_ip`= ? ',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "Source IP", "mData": "src_ip"},
						{"sTitle": "Destination IP", "mData": "dst_ip"},
						{"sTitle": "MB from Remote", "mData": "in_bytes"},
						{"sTitle": "MB to Remote", "mData": "out_bytes"},
						{"sTitle": "Packets from Remote", "mData": "in_packets"},
						{"sTitle": "Packets to Remote", "mData": "out_packets"}
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'stealth'
				}

				var conn = {
					query: 'SELECT '+
							'`time`, '+
							'`ioc_count`,'+
							'`lan_zone`,'+
							'`machine`,'+
							'`lan_ip`,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_country`,'+
							'`remote_asn_name`,'+
							'`(in_bytes / 1048576) as in_bytes`,'+
							'`(out_bytes / 1048576) as out_bytes`,'+
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
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "Zone", "mData": "lan_zone"},
						{"sTitle": "Machine", "mData": "machine"},
						{"sTitle": "Local IP", "mData": "lan_ip"},
						{"sTitle": "Local Port", "mData": "lan_port"},
						{"sTitle": "Remote IP", "mData": "remote_ip"},
						{"sTitle": "Remote Port", "mData": "remote_port"},
						{"sTitle": "Remote Country", "mData": "remote_country"},
						{"sTitle": "Remote ASN", "mData": "remote_asn_name"},
						{"sTitle": "Application", "mData": "l7_proto"},
						{"sTitle": "Bytes to Remote", "mData": "in_bytes"},
						{"sTitle": "Bytes from Remote", "mData": "out_bytes"},
						{"sTitle": "IOC", "mData": "ioc"},
						{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						{"sTitle": "IOC Rule", "mData": "ioc_rule"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'conn'
				}

				var dns = {
					query: 'SELECT '+
							'`time`,'+
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
							'AND `lan_ip`=?',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "Protocol", "mData": "proto"},
						{"sTitle": "Query Class", "mData": "qclass_name"},
						{"sTitle": "Query Type", "mData": "qtype_name"},
						{"sTitle": "Query", "mData": "query"},
						{"sTitle": "Answers", "mData": "answers"},
						{"sTitle": "TTLs", "mData": "TTLs"},
						{"sTitle": "IOC", "mData": "ioc"},
						{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						{"sTitle": "IOC Rule", "mData": "ioc_rule"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'dns'
				}

				var http = {
					query: 'SELECT '+
							'`time`,'+
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
							'AND `lan_ip`= ?',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "Host", "mData": "host"},
						{"sTitle": "URI", "mData": "uri"},
						{"sTitle": "Referrer", "mData": "referrer"},
						{"sTitle": "User Agent", "mData": "user_agent"},
						{"sTitle": "IOC", "mData": "ioc"},
						{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						{"sTitle": "IOC Rule", "mData": "ioc_rule"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'http'
				}

				var ssl = {
					query: 'SELECT '+
							'`time`,'+
							'`ioc_count`,'+
							'`version`,'+
							'`cipher`,'+
							'`server_name`,'+
							'`subject`,'+
							'`issuer_subject`,'+
							'from_unixtime(`not_valid_before`) AS not_valid_before,'+
							'from_unixtime(`not_valid_after`) AS not_valid_after,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_rule`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_typeInfection` '+	
						'FROM '+
							'`ssl_ioc` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ?',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "Server Name", "mData": "server_name"},
						{"sTitle": "Version", "mData": "version"},
						{"sTitle": "cipher", "mData": "cipher"},
						{"sTitle": "Subject", "mData": "subject"},
						{"sTitle": "Issuer Subject", "mData": "issuer_subject"},
						{"sTitle": "Not Valid Before", "mData": "not_valid_before"},
						{"sTitle": "Not Valid After", "mData": "not_valid_after"},
						{"sTitle": "IOC", "mData": "ioc"},
						{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						{"sTitle": "IOC Rule", "mData": "ioc_rule"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'ssl'
				}

				var file = {
					query: 'SELECT '+
							'`time`,'+
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
							'AND `lan_ip`= ?',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "File Type", "mData": "mime"},
						{"sTitle": "Name", "mData": "name"},
						{"sTitle": "Size", "mData": "size"},
						{"sTitle": "MD5", "mData": "md5"},
						{"sTitle": "SHA1", "mData": "sha1"},
						{"sTitle": "IOC", "mData": "ioc"},
						{"sTitle": "IOC Severity", "mData": "ioc_severity"},
						{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
						{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
						{"sTitle": "IOC Rule", "mData": "ioc_rule"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'file'
				}
				var endpoint = {
					query: 'SELECT '+
							'`time`,'+
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
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "User", "mData": "src_user"},
						{"sTitle": "Source IP", "mData": "src_ip"},
						{"sTitle": "Destination IP", "mData": "dst_ip"},
						{"sTitle": "Alert Source", "mData": "alert_source"},
						{"sTitle": "Program Source", "mData": "program_source"},
						{"sTitle": "Alert Info", "mData": "alert_info"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'endpoint'
				}
				var endpoint_logon = {
					query: 'SELECT '+
							'`time`,'+
							'`lan_ip`,'+
							'`user`,'+
							'`event` '+
						'FROM '+
							'`endpoint_tracking` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? '+
							'AND `event` = "Log On" ',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "User", "mData": "user"},
						{"sTitle": "IP", "mData": "lan_ip"},
						{"sTitle": "Event", "mData": "event"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'login'
				}
				var endpoint_logoff = {
					query: 'SELECT '+
							'`time`,'+
							'`lan_ip`,'+
							'`user`,'+
							'`event` '+
						'FROM '+
							'`endpoint_tracking` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_ip`= ? '+
							'AND `event` = "Log Off" ',
					insert: [start, end, req.query.ip],
					columns: [
						{"sTitle": "Time", "mData": "time"},
						{"sTitle": "User", "mData": "user"},
						{"sTitle": "IP", "mData": "lan_ip"},
						{"sTitle": "Event", "mData": "event"},
					],
					start: start,
					end: end,
					grouping: pointGroup,
					sClass: 'logout'
				}
				async.parallel([
					// FISHEYE	
					function(callback) { // stealth_conn
						new fisheye(stealth_conn, {database: database, pool:pool}, function(err,data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},				
					function(callback) { // conn
						new fisheye(conn, {database: database, pool:pool}, function(err,data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // dns
						new fisheye(dns, {database: database, pool:pool}, function(err,data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // http
						new fisheye(http, {database: database, pool:pool}, function(err, data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // ssl
						new fisheye(ssl, {database: database, pool:pool}, function(err, data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // file
						new fisheye(file, {database: database, pool:pool}, function(err, data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // endpoint
						new fisheye(endpoint, {database: database, pool:pool}, function(err, data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // endpoint_logon
						new fisheye(endpoint_logon, {database: database, pool:pool}, function(err, data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
					function(callback) { // endpoint_logoff
						new fisheye(endpoint_logoff, {database: database, pool:pool}, function(err, data, maxConn, maxIOC){
							handleReturn(data, maxConn, maxIOC, callback);
						});
					},
				//	SANKEY
					function(callback) {
						console.log(sankey3.query);
						new sankey(sankey1, sankey2, sankey3, {database: database, pool: pool}, function(err,data){
							sankeyData = data;
							callback();
						});
					}
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
					
					res.json({
						sankey: sankeyData,
						info: info,
						result: result,
						maxConn: largestGroup,
						maxIOC: largestIOC,
						start: start,
						end: end
					});
				});
			} else {
				res.redirect('/');
			}
		}
	}
};