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
			if (req.query.alert_info && req.query.src_user) {
				var tables = [];
				var info = [];
				var table1 = {
					 query: 'SELECT '+
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`event_src`,'+
                                '`event_id`,'+
                                '`event_type`,'+
                                '`event_detail`,'+
                                '`stealth` '+
                            'FROM '+
                                '`endpoint_events` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `event_type` = ? '+
                                'AND `lan_user` = ? ',
                        // query: 'SELECT '+
						// 	'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
						// 	'`src_user`, '+
						// 	'`src_ip`, '+
						// 	'`dst_ip`, '+
						// 	'`alert_source`, '+
						// 	'`program_source`, '+
						// 	'`alert_id`, '+
						// 	'`alert_info`, '+
						// 	'`full_log` '+
						// 'FROM `ossec` '+
						// 'WHERE '+
						// 	'`time` BETWEEN ? AND ? '+
						// 	'AND `alert_info` = ? '+
						// 	'AND `src_user` = ?',
					insert: [start, end, req.query.event_type, req.query.lan_user],
					params: [
						{ title: 'Time', select: 'time' },
						{ title: 'Full Log', select: 'full_log' },
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Full Endpoint Event Logs'
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