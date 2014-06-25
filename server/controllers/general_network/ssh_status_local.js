'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

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
			if (req.query.status_code) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'count(*) AS count,'+
							'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") AS time,'+
							'`status_code`, '+
							'`lan_zone`,'+
							'`machine`,'+
							'ssh.lan_ip,'+
							'sum(`ioc_count`) AS ioc_count, ' +
							'stealth_ips.stealth,'+
							'stealth_ips.stealth_groups, '+
							'stealth_ips.user '+
						'FROM '+
							'`ssh` '+
						'LEFT JOIN `stealth_ips` '+
						'ON ' +
							'ssh.lan_ip = stealth_ips.lan_ip ' +
						'WHERE '+
							'time BETWEEN ? AND ? '+
							'AND `status_code` = ? '+
						'GROUP BY '+
							'`lan_zone`, '+
							'ssh.lan_ip',
					insert: [start, end, req.query.status_code],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'ssh_status_local_drill',
								val: ['lan_zone','lan_ip','status_code'],
								crumb: false
							}
						},
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_groups' },
						{ title: 'User', select: 'user' },
						{ title: 'Connections', select: 'count' },
						{ title: 'Status', select: 'status_code' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine Name', select: 'machine' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Local SSH Status'
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
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};