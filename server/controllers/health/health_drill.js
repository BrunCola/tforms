'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
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
			if (req.query.client, req.query.zone) {
				//var results = [];
				var tables = [];
				var crossfilter = [];
				var info = [];

				var table1 = {
					query: 'SELECT *, '+
							'MAX(`timestamp`) '+
						'FROM ' +
							'`system_health` '+
						'WHERE ' +
							'`client` = ? '+
							'AND `zone` = ?',
					insert: [req.query.client, req.query.zone],
					params: [
						{
							title: 'Last Seen',
							select: 'timestamp',
							// link: {
							// 	type: 'http_by_domain_local_drill',
							// 	// val: the pre-evaluated values from the query above
							// 	val: ['lan_ip','lan_zone','host'],
							// 	crumb: false
							// }
						},
						{ title: 'Client', select: 'client' },
						{ title: 'Zone', select: 'zone' },
					//	{ title: 'System Name', select: 'system_name' },
						{ title: 'System Status as reported by Monit', select: 'status' },
						{ title: 'Load Average', select: 'load_average' },
						{ title: 'CPU Usage', select: 'cpu' },
						{ title: 'Memory Usage', select: 'memory_usage' },
						{ title: 'Swap Usage', select: 'swap_usage' },
						{ title: 'Threads', select: 'thread_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'System Health'
					}
				}
				var table2 = {
					query: 'SELECT *, '+
							'MAX(`timestamp`) '+
						'FROM ' +
							'`system_disc_usage` '+
						'WHERE ' +
							'`client` = ? '+
							'AND `zone` = ? '+
						'GROUP BY ' +
							'`filesystem`, '+
							'`mounted_on`',
					insert: [req.query.client, req.query.zone],
					params: [
						{
							title: 'Last Seen',
							select: 'timestamp',
							// link: {
							// 	type: 'http_by_domain_local_drill',
							// 	// val: the pre-evaluated values from the query above
							// 	val: ['lan_ip','lan_zone','host'],
							// 	crumb: false
							// }
						},
						{ title: 'Client', select: 'client' },
						{ title: 'Zone', select: 'zone' },
						{ title: 'Filesystem', select: 'filesystem' },
						{ title: 'Size', select: 'size' },
						{ title: 'Used', select: 'used' },
						{ title: 'Available', select: 'available' },
						{ title: '% Used', select: 'use_percentage' },
						{ title: 'Mounted On', select: 'mounted_on' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table2',
						title: 'System Disc Usage'
					}
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new dataTable(table1, {database: 'rp_health', pool: pool}, function(err,data){
							console.log(table1.query);
							tables[1] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table2, {database: 'rp_health', pool: pool}, function(err,data){
							console.log(table2.query);
							tables[0] = data;
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