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
	if (req.query.alert_info) {
		var tables = [];
		var info = [];
		var table1SQL = 'SELECT '+
			'count(*) AS count,' +
			'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
			'AND alert_info = \''+req.query.alert_info+'\' '+
			'GROUP BY '+
			'`src_user`';
		var table1Params = [
			{
				title: 'Last Seen',
				select: 'time',
				link: {
					type: 'top_endpoint_events_user_drill',
					// val: the pre-evaluated values from the query above
					val: ['alert_info','src_user'],
					crumb: false
				}
			},
			{ title: 'Count', select: 'count'},
			{ title: 'User', select: 'src_user'},
			{ title: 'Source IP', select: 'src_ip'},
			{ title: 'Destination IP', select: 'dst_ip'},
			{ title: 'Alert Info', select: 'alert_info' },
			{ title: 'Alert Source', select: 'alert_source'},
			{ title: 'Program Source', select: 'program_source'},
		];
		var table1Settings = {
			sort: [[1, 'desc']],
			div: 'table',
			title: 'Local Endpoints Triggering Event'
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