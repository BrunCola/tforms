'use strict';

var dataTable = require('../constructors/datatable'),
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
	//var results = [];
	if (req.query.alert_info && req.query.src_ip) {
		var tables = [];
		var info = [];
		var table1SQL = 'SELECT '+
			'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
			'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
			'AND `alert_info` = \''+req.query.alert_info+'\' '+
			'AND `src_ip` = \''+req.query.src_ip+'\'';
		var table1Params = [
			{ title: 'Time', select: 'time' },
			{ title: 'Full Log', select: 'full_log' },
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table',
			title: 'Full Endpoint Event Logs'
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
				tables: tables
			};
			//console.log(results);
			res.json(results);
		});
	} else {
		res.redirect('/');
	}
};