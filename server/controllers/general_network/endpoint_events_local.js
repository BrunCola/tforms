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
			var tables = [];
			var info = [];
			var table1 = {
				query: 'SELECT '+
						'count(*) AS count,'+
						'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time,'+
						'`server_id`,'+
						'`src_user`,'+
						'`src_ip`,'+
						'`dst_ip`,'+
						'`alert_source`,'+
						'`program_source`,'+
						'`alert_id`,'+
						'`alert_info`,'+
						'`full_log` '+
					'FROM '+
						'`ossec` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
					'GROUP BY '+
						'`src_ip`',
				insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						link: {
							type: 'endpoint_events_local_by_alert_info',
							// val: the pre-evaluated values from the query above
							val: ['src_ip'],
							crumb: false
						},
					},
					{ title: 'Events', select: 'count' },
					{ title: 'Source IP', select: 'src_ip' },
					{ title: 'Alert Source', select: 'alert_source'},
					{ title: 'Program Source', select: 'program_source' },
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'Local Endpoint Events'
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
				if (err) throw console.log(err);
				var results = {
					info: info,
					tables: tables
				};
				//console.log(results);
				res.json(results);
			});
		}
	}
};