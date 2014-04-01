'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
	force = require('./constructors/force'),
	treechart = require('./constructors/treechart'),
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
	if (req.query.lan_ip && req.query.remote_ip && req.query.ioc && req.query.ioc_attrID) {
		var forcereturn = [];
		var forceSQL = 'SELECT '+
			// SELECTS
			'`remote_ip`, '+
			'count(*) as count '+
			// !SELECTS
			'FROM conn_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
			'GROUP BY remote_ip';
		var tables = [];
		var table0SQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'`ioc_severity`, '+
			'`ioc`, '+
			'`ioc_typeIndicator`, '+
			'`ioc_typeInfection`, '+
			'`remote_ip`, '+
			'`remote_port`, '+
			'`remote_asn`, '+
			'`remote_asn_name`, '+
			'`remote_country`, '+
			'`remote_cc`, '+
			'in_packets, '+
			'`out_packets`, '+
			'`in_bytes`, '+
			'`out_bytes` '+
			// !SELECTS
			'FROM conn_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
			'AND `ioc_count` > 0 AND `trash` IS NULL';

		var table0Params = [
			{ title: 'Last Seen', select: 'time' },
			{ title: 'Severity', select: 'ioc_severity' },
			{ title: 'IOC', select: 'ioc' },
			{ title: 'IOC Type', select: 'ioc_typeIndicator' },
			{ title: 'IOC Stage', select: 'ioc_typeInfection' },
			{ title: 'Remote IP', select: 'remote_ip' },
			{ title: 'Remote Port', select: 'remote_port' },
			{ title: 'Remote ASN', select: 'remote_asn' },
			{ title: 'Remote ASN Name', select: 'remote_asn_name' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Flag', select: 'remote_cc', },
			{ title: 'Packets to Remote', select: 'in_packets' },
			{ title: 'Packets from Remote', select: 'out_packets' },
			{ title: 'Bytes to Remote', select: 'in_bytes', dView: false },
			{ title: 'Bytes from Remote', select: 'out_bytes', dView: false }
		];
		var table0Settings = {
			sort: [[0, 'desc']],
			div: 'table0',
			title: 'Total Connections Made By Local System Related to IOC Events'
		}

		var table1SQL = 'SELECT '+
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
		var table1Params = [
			{ title: 'Time', select: 'time' },
			{ title: 'Version', select: 'version' },
			{ title: 'cipher', select: 'cipher' },
			{ title: 'Server Name', select: 'server_name' },
			{ title: 'Subject', select: 'subject' },
			{ title: 'Issuer Subject', select: 'issuer_subject' },
			{ title: 'Not Valid Before', select: 'not_valid_before' },
			{ title: 'Not Valid After', select: 'not_valid_after' }
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table1',
			title: 'Visits to SSL-enabled Sites Made By Local System Related to IOC Events'
		}

		var table2SQL = 'SELECT '+
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
		var table2Params = [
			{ select: 'time', title: 'Time' },
			{ select: 'proto', title: 'Protocol' },
			{ select: 'qclass_name', title: 'Query Class' },
			{ select: 'qtype_name', title: 'Query Type' },
			{ select: 'query', title: 'Query' },
			{ select: 'answers', title: 'Answers' },
			{ select: 'TTLs', title: 'TTLs' },
			{ select: 'ioc', title: 'IOC' },
			{ select: 'ioc_typeIndicator', title: 'IOC Type' },
			{ select: 'ioc_typeInfection', title: 'IOC Stage' }
		];
		var table2Settings = {
			sort: [[0, 'desc']],
			div: 'table2',
			title: 'DNS Queries Made By Local System Related to IOC Events'
		}

		var table3SQL = 'SELECT '+
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
			'ioc,'+
			'ioc_typeIndicator,'+
			'ioc_typeInfection '+
			// !SELECTS
			'FROM http_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
		var table3Params = [
			{ select: 'time', title: 'Time' },
			{ select: 'host', title: 'Domain' },
			{ select: 'uri', title: 'URI' },
			{ select: 'referrer', title: 'Referrer' },
			{ select: 'user_agent', title: 'User Agent' },
			{ select: 'request_body_len', title: 'Request Body Length' },
			{ select: 'response_body_len', title: 'Response Body Length' },
			{ select: 'status_code', title: 'Status Code' },
			{ select: 'status_msg', title: 'Status Message' },
			{ select: 'ioc', title: 'IOC' },
			{ select: 'ioc_typeIndicator', title: 'IOC Type' },
			{ select: 'ioc_typeInfection', title: 'IOC Stage' }
		];
		var table3Settings = {
			sort: [[0, 'desc']],
			div: 'table3',
			title: 'HTTP Requests Made By Local System Related to IOC Events'
		}

		var table4SQL = 'SELECT '+
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
		var table4Params = [
			{ select: 'time', title: 'Time' },
			{ select: 'mime', title: 'MIME Type' },
			{ select: 'name', title: 'File Name' },
			{ select: 'size', title: 'File Size' },
			{ select: 'md5', title: 'MD5' },
			{ select: 'sha1', title: 'SHA1' },
			{ select: 'ioc', title: 'IOC' },
			{ select: 'ioc_typeIndicator', title: 'IOC Type' },
			{ select: 'ioc_typeInfection', title: 'IOC Stage' }
		];
		var table4Settings = {
			sort: [[0, 'desc']],
			div: 'table4',
			title: 'Files Extracted By Local System Related to IOC Events'
		}
		var ossecTableCF = [];
		var ossecTableSQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(timestamp), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'src_ip, '+
			'dst_ip, '+
			'alert_info '+
			// !SELECTS
			'FROM ossec '+
			'WHERE timestamp BETWEEN '+start+' AND '+end+' '+
			'AND `src_ip`=\''+req.query.lan_ip+'\' OR `dst_ip`=\''+req.query.lan_ip+'\' ';
		var ossecTableParams = [
			{ select: 'time', title: 'Time' },
			{ select: 'src_ip', title: 'LAN IP' },
			{ select: 'dst_ip', title: 'Remote IP' },
			{ select: 'alert_info', title: 'Endpoint Notification' }
		];
		var ossecTableSettings = {
			sort: [[0, 'desc']],
			div: 'endpoint',
			title: 'Endpoint Alerts'
		}
		var treereturn = [];
		var treeSQL = 'SELECT '+
			// SELECTS
			'ioc_attrID, '+
			'ioc_childID, '+
			'ioc_parentID, '+
			'ioc_typeIndicator, '+
			'ioc_severity, '+
			'ioc '+
			// !SELECTS
			'FROM conn_ioc '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip`=\''+req.query.lan_ip+'\' '+
			'GROUP BY ioc_attrID, ioc_childID, ioc_parentID';
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

		switch (req.query.type) {
			case 'ioc_notifications':
				// SOMETHING HERE
				break;
			default:
				//var results = [];
				var crossfilter = [];
				var crossfilterSQL = 'SELECT '+
					// SELECTS
					'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
					//'from_unixtime(time) as time, '+
					'`ioc_severity`, '+
					'`dns`, '+
					'`http`, '+
					'`ssl`, '+
					'`file`, '+
					'`remote_ip`, '+
					'`remote_cc`, '+
					'`remote_country`, '+
					'`ioc` '+
					// !SELECTS
					'FROM conn_ioc '+
					'WHERE time BETWEEN '+start+' AND '+end+' '+
					'AND `lan_ip`=\''+req.query.lan_ip+'\' ';
				var lanIP = req.query.lan_ip;
				var attrID = req.query.ioc_attrID;
				async.parallel([
					function(callback) {
						new dataTable(table0SQL, table0Params, table0Settings, database, function(err,data){
							tables[0] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
							tables[1] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table2SQL, table2Params, table2Settings, database, function(err,data){
							tables[2] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table3SQL, table3Params, table3Settings, database, function(err,data){
							tables[3] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table4SQL, table4Params, table4Settings, database, function(err,data){
							tables[4] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(ossecTableSQL, ossecTableParams, ossecTableSettings, database, function(err,data){
							tables[5] = data;
							callback();
						});
					},
					function(callback) {
						new query(ossecTableSQL, database, function(err,data){
							ossecTableCF = data;
							callback();
						});
					},
					// Crossfilter function
					function(callback) {
						new force(forceSQL, database, lanIP, function(err,data){
							forcereturn = data;
							callback();
						});
					},
					function(callback) {
						new treechart(treeSQL, database, lanIP, attrID, function(err,data){
							treereturn = data;
							callback();
						});
					},
					function(callback) {
						new query(crossfilterSQL, database, function(err,data){
							crossfilter = data;
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
					var arr = []; var count;
					crossfilter.forEach(function(d){
						// Push a total connections object so we can count all that have no values associated
						// push records with values
						arr.push({
							'type': 'DNS',
							'count': d.dns,
							'time': d.time,
							'remote_ip': d.remote_ip,
							'remote_cc': d.remote_cc,
							'remote_country': d.remote_country,
							'ioc': d.ioc
						})
						arr.push({
							'type': 'HTTP',
							'count': d.http,
							'time': d.time,
							'remote_ip': d.remote_ip,
							'remote_cc': d.remote_cc,
							'remote_country': d.remote_country,
							'ioc': d.ioc
						})
						arr.push({
							'type': 'SSL',
							'count': d.ssl,
							'time': d.time,
							'remote_ip': d.remote_ip,
							'remote_cc': d.remote_cc,
							'remote_country': d.remote_country,
							'ioc': d.ioc
						})
						arr.push({
							'type': 'File',
							'count': d.file,
							'time': d.time,
							'remote_ip': d.remote_ip,
							'remote_cc': d.remote_cc,
							'remote_country': d.remote_country,
							'ioc': d.ioc
						})
						arr.push({
							'type': 'Total Connections',
							'count': 1,
							'time': d.time,
							'remote_ip': d.remote_ip,
							'remote_cc': d.remote_cc,
							'remote_country': d.remote_country,
							'ioc': d.ioc
						})
					});
					// tCount += d.dns;
					// tCount += d.http;
					// tCount += d.ssl;
					// tCount++;
					ossecTableCF.forEach(function(d){
						arr.push({
							'type': 'Endpoint',
							'count': 1,
							'time': d.time
						})
						// tCount++;
					});
					// console.log(arr);
					// console.log(crossfilter);
					var results = {
						info: info,
						tree: treereturn,
						force: forcereturn,
						crossfilter: arr,
						tables: tables
					};
					res.jsonp(results);
				});
			break;
		}
	} else {
		res.redirect('/');
	}
};
