'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	// var database = req.user.database;
	var database = null;
	// var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	// var end = Math.round(new Date().getTime() / 1000);
	// if (req.query.start && req.query.end) {
	// 	start = req.query.start;
	// 	end = req.query.end;
	// }
	if (req.query.conn_uids) {
		//var results = [];
		var tables = [];
		var crossfilter = [];
		var info = {};

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
			'WHERE `conn_uids`=\''+req.query.conn_uids+'\'';
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
		var table1Sort = [[0, 'desc']];
		var table1Div = 'table1';

		var table2SQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'proto, '+
			'qclass_name, '+
			'qtype_name, '+
			'query, '+
			'answers, '+
			'TTL, '+
			'ioc, '+
			'ioc_typeIndicator, '+
			'ioc_typeInfection '+
			// !SELECTS
			'FROM dns_ioc '+
			'WHERE `conn_uids`=\''+req.query.conn_uids+'\'';
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
		var table2Sort = [[0, 'desc']];
		var table2Div = 'table2';

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
			'WHERE `conn_uids`=\''+req.query.conn_uids+'\'';
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
		var table3Sort = [[0, 'desc']];
		var table3Div = 'table3';

		var table4SQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'mime, '+
			'name, '+
			'size, '+
			'md5, '+
			'sha1, '+
			'ioc, '+
			'ioc_typeIndicator '+
			'ioc_typeInfection '+
			// !SELECTS
			'FROM file_ioc '+
			'WHERE `conn_uids`=\''+req.query.conn_uids+'\'';
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
		var table4Sort = [[0, 'desc']];
		var table4Div = 'table4';

		var InfoSQL = 'SELECT '+
				'from_unixtime(time) as time, '+
				'machine, '+
				'lan_zone, '+
				'lan_ip, '+
				'lan_port, '+
				'remote_ip, '+
				'remote_port, '+
				'remote_country, '+
				'remote_cc, '+
				'remote_asn, '+
				'remote_asn_name, '+
				'l7_proto, '+
				'in_packets, '+
				'out_packets, '+
				'in_bytes, '+
				'out_bytes, '+
				'ioc, '+
				'ioc_typeIndicator, '+
				'ioc_typeInfection '+
			'FROM `conn_ioc` '+
			'WHERE conn_uids = \''+req.query.conn_uids+'\' '+
			'LIMIT 1';

			var Info2SQL = 'SELECT, '+
					'i.description, '+
				'FROM ioc_group i JOIN conn_ioc c ON (i.ioc_group=c.ioc), '+
				'WHERE, '+
					'c.conn_uids = \''+req.query.conn_uids+'\', '+
				'LIMIT 1';

		async.parallel([
			// Table function(s)
			function(callback) {
				new dataTable(table1SQL, table1Params, table1Sort, table1Div, database, function(err,data){
					tables[0] = data;
					callback();
				});
			},
			function(callback) {
				new dataTable(table2SQL, table2Params, table2Sort, table2Div, database, function(err,data){
					tables[1] = data;
					callback();
				});
			},
			function(callback) {
				new dataTable(table3SQL, table3Params, table3Sort, table3Div, database, function(err,data){
					tables[2] = data;
					callback();
				});
			},
			function(callback) {
				new dataTable(table4SQL, table4Params, table4Sort, table4Div, database, function(err,data){
					tables[3] = data;
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
				new query(Info2SQL, database, function(err,data){
					info.desc = data;
					callback();
				});
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
			var results = {
				info: info,
				tables: tables,
			};
			//console.log(results);
			res.jsonp(results);
		});
	} else {
		res.redirect('/');
	}
};
