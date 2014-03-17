'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
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
	if (req.query.lan_ip) {
		var tables = [];
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
			title: 'SSL'
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
			title: 'DNS'
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
			'info_code,'+
			'info_msg,'+
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
			{ select: 'info_code', title: 'Info Code' },
			{ select: 'info_msg', title: 'Info Message' },
			{ select: 'ioc', title: 'IOC' },
			{ select: 'ioc_typeIndicator', title: 'IOC Type' },
			{ select: 'ioc_typeInfection', title: 'IOC Stage' }
		];
		var table3Settings = {
			sort: [[0, 'desc']],
			div: 'table3',
			title: 'HTTP'
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
			title: 'File'
		}

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

				async.parallel([
					function(callback) {
						new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
							tables[0] = data;
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
							tables[2] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table4SQL, table4Params, table4Settings, database, function(err,data){
							tables[3] = data;
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
					var arr = []; var count;
					crossfilter.forEach(function(d){
						// Push a total connections object so we can count all that have no values associated
						// push records with values
						//if (d.dns > 0) {
							arr.push({
								'type': 'DNS',
								'count': d.dns,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
						//}
						//if (d.http > 0) {
							arr.push({
								'type': 'HTTP',
								'count': d.http,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
						//}
						//if (d.ssl > 0) {
							arr.push({
								'type': 'SSL',
								'count': d.ssl,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
						//}
						//if (d.file > 0) {
							arr.push({
								'type': 'File',
								'count': d.file,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
					//	}
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
					// console.log(arr);
					// console.log(crossfilter);
					var results = {
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