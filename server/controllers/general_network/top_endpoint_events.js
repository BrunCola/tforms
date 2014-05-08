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
	var info = [];
	var table1SQL = 'SELECT '+
		'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) AS time, '+
		'`server_id`, '+
		'`src_user`, '+
		'`src_ip`, '+
		'`dst_ip`, '+
		'`alert_source`, '+
		'`program_source`, '+
		'`alert_id`, '+
		'`alert_info`, '+
		'`full_log` '+
		'FROM `ossec` '+
		'GROUP BY '+
		'`alert_info`';

	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			dView: true,
			link: {
				type: 'top_local2remote',
				// val: the pre-evaluated values from the query above
				val: ['lan_zone','lan_ip'],
				crumb: false
			},
		},
		{ title: 'Server ID', select: 'server_id' },
		{ title: 'User', select: 'src_user' },
		{ title: 'Local IP', select: 'src_ip' },
		{ title: 'Remote IP', select: 'dst_ip' },
		{ title: 'Alert Source', select: 'alert_source'},
		{ title: 'Program Source', select: 'program_source' },
		{ title: 'Alert IP', select: 'alert_id' },
		{ title: 'Alert Info', select: 'alert_info' },
		{ title: 'Full Log', select: 'full_log' }
	];
	var table1Settings = {
		sort: [[0, 'desc']],
		div: 'table',
		title: 'Local IP Traffic'
	}
	async.parallel([
		// Table function(s)
		function(callback) {
			new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
				tables.push(data);
				callback();
			});
		},
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
