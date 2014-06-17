'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			// var database = null;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			//var results = [];
			if (req.query.src_ip) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
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
						'`time` BETWEEN ? AND ? '+
						'AND src_ip = ? '+
						'GROUP BY '+
						'`alert_info`',
					insert: [start, end, req.query.src_ip],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'endpoint_events_local_alert_info_drill',
								// val: the pre-evaluated values from the query above
								val: ['alert_info','src_ip'],
								crumb: false
							}
						},
						{ title: 'Connections', select: 'count'},
						{ title: 'User', select: 'src_user'},
						{ title: 'Source IP', select: 'src_ip'},
						{ title: 'Destination IP', select: 'dst_ip'},
						{ title: 'Alert Info', select: 'alert_info' },
						{ title: 'Alert Source', select: 'alert_source'},
						{ title: 'Program Source', select: 'program_source'},
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Local Endpoints Triggering Event'
					}
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new dataTable(table1, {database: database, pool: pool}, function(err,data){
							tables.push(data);
							callback();
						});
					},
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
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
		}
	}
};