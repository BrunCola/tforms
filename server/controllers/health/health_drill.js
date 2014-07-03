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
			// var database = null;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			if ((req.query.client, req.query.zone) && (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1)) {
				//var results = [];
				var tables = [];
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
						{ title: 'System Name', select: 'system_name' },
						{ title: 'System Status as reported by Monit', select: 'status' },
						{ title: 'Load Average', select: 'load_average' },
						{ title: 'CPU Usage', select: 'cpu' },
						{ title: 'Memory Usage', select: 'memory_usage' },
						{ title: 'Swap Usage', select: 'swap_usage' },
						{ title: 'Threads', select: 'thread_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table1',
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
				var table3 = {
					query: 'SELECT *, '+
							'MAX(`timestamp`) '+
						'FROM ' +
							'`log2sql_stats` '+
						'WHERE ' +
							'`client` = ?',
					insert: [req.query.client],
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
						{ title: 'Connections', select: 'count_conn' },
						{ title: 'Files', select: 'count_file' },
						{ title: 'HTTP Connections', select: 'count_http' },
						{ title: 'DNS Connections', select: 'count_dns' },
						{ title: 'SSL Connections', select: 'count_ssl' },
						{ title: 'Unique Remote Connections ', select: 'count_uniq_remote' },
						{ title: 'Unique Domains', select: 'count_uniq_domain' },
						{ title: 'Unique Queries', select: 'count_uniq_query' },
						{ title: 'Unique SSL Connections', select: 'count_uniq_ssl' },
						{ title: 'IOCs', select: 'ioc_count_total' },
						{ title: 'SSH Connections', select: 'count_ssh' },
						{ title: 'IRC Connections', select: 'count_irc' },
						{ title: 'SMTP Connections', select: 'count_smtp' },
						{ title: 'FTP Connections', select: 'count_ftp' },
						{ title: 'Unique SSH Connections', select: 'count_uniq_ssh' },
						{ title: 'Unique FTP Connections', select: 'count_uniq_ftp' },
						{ title: 'Conn File', select: 'conn_file' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table3',
						title: 'Log2Sql Statistics'
					}
				}
				var table4 = {
					query: 'SELECT *, '+
							'MAX(`timestamp`) '+
						'FROM ' +
							'`process_health` '+
						'WHERE ' +
							'`client` = ? '+
							'AND `zone` = ? '+
						'GROUP BY ' +
							'`process_name`',
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
						{ title: 'Process Name', select: 'process_name' },
						{ title: 'Status as Reported by Monit', select: 'status' },
						{ title: 'PID', select: 'pid' },
						{ title: 'Parent PID', select: 'parent_pid' },
						{ title: 'Uptime as Reported by Monit', select: 'uptime' },
						{ title: 'Memory (kB)', select: 'memory_kB' },
						{ title: 'Memory (kB) Total', select: 'memory_kB_total' },
						{ title: 'Memory %', select: 'memory_percent' },
						{ title: 'Memory % Total', select: 'memory_percent_total' },
						{ title: 'CPU %', select: 'cpu_percent' },
						{ title: 'CPU % Total', select: 'cpu_percent_total' },
						{ title: 'Thread Count', select: 'thread_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table4',
						title: 'Process Health'
					}
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new dataTable(table1, {database: 'rp_health', pool: pool}, function(err,data){
							tables[3] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table2, {database: 'rp_health', pool: pool}, function(err,data){
							tables[2] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table3, {database: 'rp_health', pool: pool}, function(err,data){
							tables[1] = data;
							callback();
						});
					},
					function(callback) {
						new dataTable(table4, {database: 'rp_health', pool: pool}, function(err,data){
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
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};