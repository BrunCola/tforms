'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.user.database;
			// var database = null;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			//var results = [];
			if (req.query.event_type) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
						'count(*) AS count,'+
						'max(`time`) AS `time`,'+
						'`lan_user`,'+
						'`lan_ip`,'+
						'`lan_machine`, ' +
						'`lan_zone`, ' +
						'`event_id`, ' +
						'`event_src`, '  +
						'`event_type`, ' +
						'`event_detail`, ' +
						'`event_full`, ' +
						'`event_level`, ' +
						'`lan_stealth` ' +
					'FROM '+
						'`sharepoint_events` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
						'AND `event_type` = ? '+
					'GROUP BY '+
						'`lan_user`, '+
						'`lan_ip`, '+
						'`lan_zone`',
					insert: [start, end, req.query.event_type],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'endpoint_events_sharepoint_full',
								val: ['event_type','lan_zone','lan_user', 'lan_ip'], // pre-evaluated values from the query above
								crumb: false
							}
						},
						{ title: 'Events', select: 'count'},
						{ title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
						{ title: 'Zone', select: 'lan_zone'},
						{ title: 'Local Machine', select: 'lan_machine'},
						{ title: 'Local User', select: 'lan_user'},
						{ title: 'Local IP', select: 'lan_ip'},
						{ title: 'Event Type', select: 'event_type' },
						{ title: 'Event Details', select: 'event_detail'},
						{ title: 'Event Source', select: 'event_src'},
						{ title: 'Event ID', select: 'event_id'},
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Full Endpoint Event Logs',
						hide_stealth: req.user.hide_stealth
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