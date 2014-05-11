'use strict';

var fisheye = require('../constructors/fisheye'),
	config = require('../../config/config'),
	query = require('../constructors/query'),
	async = require('async');
var result = [];
var largestGroup = 0;

function handleReturn(data, max, callback) {
	if (data) {
		result.push(data);
		if (max >= largestGroup) {
			largestGroup = max;
		}
		return callback();
	} else {
		return callback();
	}
}

exports.render = function(req, res) {
	var database = req.user.database;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	if (req.query.lan_ip && req.query.remote_ip && req.query.ioc) {
		var crossfilter;
		var conn_ioc = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
				'`ioc_typeIndicator`,'+
				'`ioc_typeInfection` '+			
				'FROM `conn_ioc` '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
				'AND `remote_ip`=\''+req.query.remote_ip+'\' '
				'AND `ioc`=\''+req.query.ioc+'\' ';
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Zone", "mData": "lan_zone"},
				{"sTitle": "Machine", "mData": "machine"},
				{"sTitle": "Lan IP", "mData": "lan_ip"},
				{"sTitle": "Lan Port", "mData": "lan_port"},
				{"sTitle": "Remote IP", "mData": "remote_ip"},
				{"sTitle": "Remote Port", "mData": "remote_port"},
				{"sTitle": "Remote Country", "mData": "remote_country"},
				{"sTitle": "Remote ASN", "mData": "remote_asn_name"},
				{"sTitle": "Application", "mData": "l7_proto"},
				{"sTitle": "IOC", "mData": "ioc"},
				{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
				{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"}
			],
			database: database,
			start: start,
			end: end,
			sClass: 'conn_ioc'
		}
		var conn = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
				'`l7_proto`,'
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+			
				'FROM `conn_ioc` '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Zone", "mData": "lan_zone"},
				{"sTitle": "Machine", "mData": "machine"},
				{"sTitle": "Lan IP", "mData": "lan_ip"},
				{"sTitle": "Lan Port", "mData": "lan_port"},
				{"sTitle": "Remote IP", "mData": "remote_ip"},
				{"sTitle": "Remote Port", "mData": "remote_port"},
				{"sTitle": "Remote Country", "mData": "remote_country"},
				{"sTitle": "Remote ASN", "mData": "remote_asn_name"},
				{"sTitle": "Application", "mData": "l7_proto"},
				{"sTitle": "IOC", "mData": "ioc"},
				{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
				{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"}
			],
			database: database,
			start: start,
			end: end,
			sClass: 'conn'
		}	
		var dns_ioc = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`proto`, '+
				'`qclass_name`, '+
				'`qtype_name`, '+
				'`query`, '+
				'`answers`, '+
				'`TTLs`, '+
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+
				'FROM dns_ioc '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
				'AND `remote_ip`=\''+req.query.remote_ip+'\' '+
				'AND `ioc`=\''+req.query.ioc+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Protocall", "mData": "proto"},
				{"sTitle": "Query", "mData": "query"}
			],
			database: database,
			start: start,
			end: end,
			sClass: 'dns_ioc'
		}
		var dns = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`proto`, '+
				'`qclass_name`, '+
				'`qtype_name`, '+
				'`query`, '+
				'`answers`, '+
				'`TTLs`, '+
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+
				'FROM dns_ioc '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Protocall", "mData": "proto"},
				{"sTitle": "Query", "mData": "query"}
			],
			database: database,
			start: start,
			end: end,
			sClass: 'dns'
		}
		var http_ioc = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+
				'FROM `http_ioc` '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
				'AND `remote_ip`=\''+req.query.remote_ip+'\' '+
				'AND `ioc`=\''+req.query.ioc+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Host", "mData": "host"},
				{"sTitle": "Referrer", "mData": "referrer"},
				{"sTitle": "User Agent", "mData": "user_agent"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'http_ioc'
		}
		var http = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+
				'FROM `http_ioc` '+
				'WHERE `time` BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Host", "mData": "host"},
				{"sTitle": "Referrer", "mData": "referrer"},
				{"sTitle": "User Agent", "mData": "user_agent"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'http'
		}
		var ssl_ssl = {
			query: 'SELECT '+
				// SELECTS
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`version`, '+
				'`cipher`, '+
				'`server_name`, '+
				'`subject`, '+
				'`issuer_subject`, '+
				'from_unixtime(`not_valid_before`) AS not_valid_before, '+
				'from_unixtime(`not_valid_after`) AS not_valid_after, '+
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+	
				// !SELECTS
				'FROM ssl_ioc '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
				'AND `remote_ip`=\''+req.query.remote_ip+'\' '+
				'AND `ioc`=\''+req.query.ioc+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Version", "mData": "version"},
				{"sTitle": "cipher", "mData": "cipher"},
				{"sTitle": "Server Name", "mData": "server_name"},
				{"sTitle": "Subject", "mData": "subject"},
				{"sTitle": "Issuer Subject", "mData": "issuer_subject"},
				{"sTitle": "IOC", "mData": "ioc"},
				{"sTitle": "IOC Severity", "mData": "ioc_severity"},
				{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
				{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'ssl_ioc'
		}
		var ssl = {
			query: 'SELECT '+
				// SELECTS
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`version`, '+
				'`cipher`, '+
				'`server_name`, '+
				'`subject`, '+
				'`issuer_subject`, '+
				'from_unixtime(`not_valid_before`) AS not_valid_before, '+
				'from_unixtime(`not_valid_after`) AS not_valid_after, '+
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+	
				// !SELECTS
				'FROM ssl_ioc '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "Version", "mData": "version"},
				{"sTitle": "cipher", "mData": "cipher"},
				{"sTitle": "Server Name", "mData": "server_name"},
				{"sTitle": "Subject", "mData": "subject"},
				{"sTitle": "Issuer Subject", "mData": "issuer_subject"},
				{"sTitle": "IOC", "mData": "ioc"},
				{"sTitle": "IOC Severity", "mData": "ioc_severity"},
				{"sTitle": "IOC Type", "mData": "ioc_typeIndicator"},
				{"sTitle": "IOC Stage", "mData": "ioc_typeInfection"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'ssl'
		}
		var file_ioc = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`mime`, '+
				'`name`, '+
				'`size`, '+
				'`md5`, '+
				'`sha1`, '+
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+
				'FROM `file_ioc` '+
				'WHERE `time` BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
				'AND `remote_ip`=\''+req.query.remote_ip+'\' '+
				'AND `ioc`=\''+req.query.ioc+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "MIME", "mData": "mime"},
				{"sTitle": "Name", "mData": "name"},
				{"sTitle": "Size", "mData": "size"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'file_ioc'
		}
		var file = {
			query: 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`mime`, '+
				'`name`, '+
				'`size`, '+
				'`md5`, '+
				'`sha1`, '+
				'`ioc`, '+
				'`ioc_severity`, '+
				'`ioc_typeIndicator`, '+
				'`ioc_typeInfection` '+
				'FROM `file_ioc` '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `lan_ip`=\''+req.query.lan_ip+'\'',
			columns: [
				{"sTitle": "Time", "mData": "time"},
				{"sTitle": "MIME", "mData": "mime"},
				{"sTitle": "Name", "mData": "name"},
				{"sTitle": "Size", "mData": "size"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'file'
		}
		var endpoint = {
			query: 'SELECT '+
				// SELECTS
				'date_format(from_unixtime(`timestamp`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`src_ip`, '+
				'`dst_ip`, '+
				'`src_user`, '+
				'`alert_source`, '+
				'`program_source`, '+
				'`alert_info` '+
				// !SELECTS
				'FROM `ossec` '+
				'WHERE time BETWEEN '+start+' AND '+end+' '+
				'AND `src_ip`=\''+req.query.lan_ip+'\' ',
			columns: [
				{"sTitle": "Source IP", "mData": "src_ip"},
			],
			database: database,
			start: start,
			end: end,
			sClass: 'endpoint'
		}
		var info = {};
		var InfoSQL = 'SELECT '+
			'max(from_unixtime(`time`)) as last, '+
			'min(from_unixtime(`time`)) as first, '+
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
			'`ioc_typeIndicator` '+
			'FROM `conn_ioc` '+
			'WHERE '+
			'`lan_ip` = \''+req.query.lan_ip+'\' AND '+
			'`remote_ip` = \''+req.query.remote_ip+'\' AND '+
			'`ioc` = \''+req.query.ioc+'\' '+
			'LIMIT 1';
		var Info2SQL = 'SELECT '+
			'`description` '+
			'FROM `ioc_parent` '+
			'WHERE '+
			'`ioc_parent` = \''+req.query.ioc+'\' '+
			'LIMIT 1';
		async.parallel([
			// Table function(s)
			function(callback) { // conn_ioc
				new fisheye(conn_ioc, function(err,data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // conn
				new fisheye(conn, function(err,data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // dns_ioc
				new fisheye(dns_ioc, function(err,data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // dns
				new fisheye(dns, function(err,data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // http_ioc
				new fisheye(http_ioc, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // http
				new fisheye(http, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // ssl_ioc
				new fisheye(ssl_ioc, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // ssl
				new fisheye(ssl, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},			
			function(callback) { // file_ioc
				new fisheye(file_ioc, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // file
				new fisheye(file, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // endpoint
				new fisheye(endpoint, function(err, data, max){
					handleReturn(data, max, callback);
				});
			},
			function(callback) { // InfoSQL
				new query(InfoSQL, database, function(err,data){
					info.main = data;
					callback();
				});
			},
			function(callback) { // Info2SQL
				new query(Info2SQL, 'rp_ioc_intel', function(err,data){
					info.desc = data;
					callback();
				});
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
			// var results = {
			// 	info: info,
			// 	tables: tables
			// };
			//console.log(results);
			res.jsonp({
				info: info,
				result: result,
				max: largestGroup,
				start: start,
				end: end
			});
		});
	} else {
		res.redirect('/');
	}
};