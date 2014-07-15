'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
config = require('../../config/config'),
async = require('async');

var permissions = [3];

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			var crossfilter;
			if ( req.query.user && (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1)) {
				var tables = [];
				var info = [];
				var crossfilter = [];
				var table1 = {
					query: 'SELECT '+
								'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'`lan_ip`, '+
								'`event`, '+
								'endpoint_tracking.user, '+
								'stealth_policy.stealth_COIs '+ //TODO IOC Hits and Connection counts
							'FROM '+
								'`endpoint_tracking` '+
							'JOIN '+
								'`stealth_policy` '+
							'ON '+
								'endpoint_tracking.user = stealth_policy.user '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND event = "Log On" '+
								'AND endpoint_tracking.user = ? '+
							'GROUP BY `lan_ip`',
					insert: [start, end, req.query.user],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'local_COI_remote_drill',
								// val: the pre-evaluated values from the query above
								val: ['lan_ip'],
								crumb: false
							}
						},
						{ title: 'User', select: 'user' },
						{ title: 'IP', select: 'lan_ip' },						
						{ title: 'Stealth COIs', select: 'stealth_COIs' },
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Log Ons by User'
					}
				}
				// var crossfilterQ = {
				// 	query: 'SELECT '+
				// 		'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
				// 		'(sum(in_bytes + out_bytes) / 1048576) AS count, '+
				// 		'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
				// 		'(sum(`out_bytes`) / 1048576) AS out_bytes '+
				// 	'FROM '+
				// 		'`stealth_conn` '+
				// 	'WHERE '+
				// 		'`time` BETWEEN ? AND ? '+
				// 	'GROUP BY '+
				// 		'month(from_unixtime(time)),'+
				// 		'day(from_unixtime(time)),'+
				// 		'hour(from_unixtime(time))',
				// 	insert: [start, end, req.query.ip]
				// }
				async.parallel([
					// Table function(s)
					function(callback) {
						new dataTable(table1, {database: database, pool: pool}, function(err,data){
							console.log(table1.query);
							tables.push(data);
							callback();
						});
					},
					// // Crossfilter function
					// function(callback) {
					// 	new query(crossfilterQ, {database: database, pool: pool}, function(err,data){
					// 		crossfilter = data;
					// 		callback();
					// 	});
					// }
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err);
					var results = {
						info: info,
						tables: tables//,
						//crossfilter: crossfilter
					};
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};