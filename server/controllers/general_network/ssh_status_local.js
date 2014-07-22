'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
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
							'date_format(max(from_unixtime(ssh.time)), "%Y-%m-%d %H:%i:%s") AS time,'+
							'`status_code`, '+
							'`lan_zone`,'+
							'`machine`,'+
							'ssh.lan_ip,'+
							'sum(`ioc_count`) AS ioc_count ' +
						'FROM '+
							'`ssh` '+
						'LEFT JOIN `endpoint_tracking` '+
						'ON ' +
							'ssh.lan_ip = endpoint_tracking.lan_ip ' +
						'WHERE '+
							'ssh.time BETWEEN ? AND ? '+
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
				var table2 = {
					query: 'SELECT '+
							'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ 
							'`stealth_COIs`, ' +
							'`stealth`, '+
							'`lan_ip`, ' +
							'`event`, ' +
							'`user` ' +
						'FROM ' + 
							'`endpoint_tracking` '+
						'WHERE ' + 
							'stealth > 0 '+
							'AND event = "Log On" ',
					insert: [],
					params: [
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_COIs' },
						{ title: 'User', select: 'user' }
					],
					settings: {}
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new datatable_stealth(table1, table2, parseInt(req.session.passport.user.level), {database: database, pool: pool}, function(err,data){
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