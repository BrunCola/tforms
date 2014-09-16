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
								'count(*) AS `count`, '+
								'`lan_ip` AS `ip`, '+
								'E.event, '+
								'E.user, '+
								'E.stealth_COIs, '+ 
								'sum(`ioc_count`) AS `ioc_count` ' +
							'FROM '+
							'conn_meta JOIN (SELECT ' +
								'`lan_ip` AS `ip`, '+
								'`event`, '+
								'endpoint_tracking.user, '+
								'stealth_policy.stealth_COIs '+ 
							'FROM ' +
								'`endpoint_tracking` '+
							'JOIN '+
								'`stealth_policy` '+
							'ON '+
								'endpoint_tracking.user = stealth_policy.user ) E ON E.ip = conn_meta.lan_ip '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND E.event = "Log On" '+
								'AND E.user = ? '+
							'GROUP BY `lan_ip`',
					insert: [start, end, req.query.user],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'local_COI_remote_drill',
								// val: the pre-evaluated values from the query above
								val: ['ip'],
								crumb: false
							}
						},
						{ title: 'Connections', select: 'count' },
						{ title: 'User', select: 'user' },
						{ title: 'IP', select: 'ip' },						
						{ title: 'Stealth COIs', select: 'stealth_COIs' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Log Ons by User'
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