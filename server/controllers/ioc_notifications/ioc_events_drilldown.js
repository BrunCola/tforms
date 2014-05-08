'use strict';

var fisheye = require('../constructors/fisheye'),
	config = require('../../config/config'),
	query = require('../constructors/query'),
	async = require('async');

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
		var sslSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'version, '+
			'cipher, '+
			'server_name, '+
			'subject, '+
			'issuer_subject, '+
			'from_unixtime(not_valid_before) AS not_valid_before, '+
			'from_unixtime(not_valid_after) AS not_valid_after '+
			// !SELECTS
			'FROM ssl_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
		var sslParams = [
			{"sTitle": "Time", "mData": "time"},
			{"sTitle": "Version", "mData": "version"},
			{"sTitle": "cipher", "mData": "cipher"},
			{"sTitle": "Server Name", "mData": "server_name"},
			{"sTitle": "Subject", "mData": "subject"},
			{"sTitle": "Issuer Subject", "mData": "issuer_subject"},
		];
		var dnsSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'proto, '+
			'qclass_name, '+
			'qtype_name, '+
			'query, '+
			'answers, '+
			'TTLs, '+
			'ioc, '+
			'ioc_typeIndicator, '+
			'ioc_typeInfection '+
			// !SELECTS
			'FROM dns_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
		var dnsParams = [
			{"sTitle": "Time", "mData": "time"},
			{"sTitle": "Protocall", "mData": "proto"},
			{"sTitle": "Query", "mData": "query"}
		];
		var httpSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'host,'+
			'uri,'+
			'referrer,'+
			'user_agent,'+
			'request_body_len,'+
			'response_body_len,'+
			'status_code,'+
			'status_msg,'+
			'info_code,'+
			'info_msg,'+
			'ioc,'+
			'ioc_typeIndicator,'+
			'ioc_typeInfection '+
			// !SELECTS
			'FROM http_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
		var httpParams = [
			{"sTitle": "Time", "mData": "time"},
			{"sTitle": "Host", "mData": "host"},
			{"sTitle": "Referrer", "mData": "referrer"},
			{"sTitle": "User Agent", "mData": "user_agent"},
		];
		var fileSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'mime, '+
			'name, '+
			'size, '+
			'md5, '+
			'sha1, '+
			'ioc, '+
			'ioc_typeIndicator, '+
			'ioc_typeInfection '+
			// !SELECTS
			'FROM file_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
		var fileParams = [
			{"sTitle": "Time", "mData": "time"},
			{"sTitle": "MIME", "mData": "mime"},
			{"sTitle": "Name", "mData": "name"},
			{"sTitle": "Size", "mData": "Size"},
		];
		var info = {};
		var InfoSQL = 'SELECT '+
			'max(from_unixtime(time)) as last, '+
			'min(from_unixtime(time)) as first, '+
			'sum(in_packets) as in_packets, '+
			'sum(out_packets) as out_packets, '+
			'sum(in_bytes) as in_bytes, '+
			'sum(out_bytes) as out_bytes, '+
			'machine, '+
			'lan_zone, '+
			'lan_port, '+
			'remote_port, '+
			'remote_cc, '+
			'remote_country, '+
			'remote_asn, '+
			'remote_asn_name, '+
			'l7_proto, '+
			'ioc_typeIndicator '+
		'FROM `conn_ioc` '+
		'WHERE '+
			'lan_ip = \''+req.query.lan_ip+'\' AND '+
			'remote_ip = \''+req.query.remote_ip+'\' AND '+
			'ioc = \''+req.query.ioc+'\' '+
		'LIMIT 1';

		var Info2SQL = 'SELECT '+
				'description '+
			'FROM `ioc_parent` '+
			'WHERE '+
				'ioc_parent = \''+req.query.ioc+'\' '+
			'LIMIT 1';

		var result = [];
		var largestGroup = 0;
		async.parallel([
			// Table function(s)
			function(callback) {
				new fisheye(sslSQL, { database: database, sClass: 'ssl', start: start, end: end, columns: sslParams }, function(err, data, max){
					result.push(data);
					if (max >= largestGroup) {
						largestGroup = max;
					}
					callback();
				});
			},
			function(callback) {
				new fisheye(dnsSQL, { database: database, sClass: 'dns', start: start, end: end, columns: dnsParams }, function(err,data, max){
					result.push(data);
					if (max >= largestGroup) {
						largestGroup = max;
					}
					callback();
				});
			},
			function(callback) {
				new fisheye(httpSQL, { database: database, sClass: 'http', start: start, end: end, columns: httpParams }, function(err, data, max){
					result.push(data);
					if (max >= largestGroup) {
						largestGroup = max;
					}
					callback();
				});
			},
			function(callback) {
				new fisheye(fileSQL, { database: database, sClass: 'file', start: start, end: end, columns: fileParams }, function(err, data, max){
					result.push(data);
					if (max >= largestGroup) {
						largestGroup = max;
					}
					callback();
				});
			},
			function(callback) {
				new query(InfoSQL, database, function(err,data){
					info.main = data;
					callback();
				});
			},
			function(callback) {
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