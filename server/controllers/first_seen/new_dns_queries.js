'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.user.database;
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
	var table1SQL = 'SELECT '+
		// SELECTS
		'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
		'`lan_zone`, '+
		'`lan_ip`, '+
		'`machine`, '+
		'`remote_ip`, '+
		'`remote_port`, '+
		'`remote_asn`, '+
		'`remote_asn_name`, '+
		'`remote_country`, '+
		'`remote_cc`, '+
		'`proto`, '+
		'`qtype`, '+
		'`qclass`, '+
		'`rcode`, '+
		'`query` '+
		// !SELECTS
		'FROM dns_query '+
		'WHERE time BETWEEN '+start+' AND '+end;

	var table1Params = [
		{ title: 'First Seen', select: 'time' },
		{ title: 'Query Type', select: 'qtype' },
		{ title: 'Query Class', select: 'qclass', dView: false },
		{ title: 'Response Code', select: 'rcode', dView: false },
		{ title: 'DNS Query', select: 'query' },
		{ title: 'Remote Port', select: 'remote_port' },
		{ title: 'Protocol', select: 'proto' },
		{ title: 'DNS Server', select: 'remote_ip' },
		{ title: 'Remote Port', select: 'remote_port' },
		{ title: 'Remote ASN', select: 'remote_asn' },
		{ title: 'Remote ASN Name', select: 'remote_asn_name' },
		{ title: 'Remote Country', select: 'remote_country' },
		{ title: 'Flag', select: 'remote_cc', },
		{ title: 'LAN Zone', select: 'lan_zone' },
		{ title: 'LAN IP', select: 'lan_ip' },
		{ title: 'Machine Name', select: 'machine' }
	];
	var table1Settings = {
		sort: [[0, 'desc']],
		div: 'table',
		title: 'New Remote IP Addresses Detected'
	}

	var crossfilterSQL = 'SELECT '+
		// SELECTS
		'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
		'count(*) as count, '+
		'remote_country '+
		// !SELECTS
		'FROM dns_query '+
		'WHERE time BETWEEN '+start+' AND '+end+' '+
		'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))';

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
		res.jsonp(results);
	});

};