'use strict';

var dataTable = require('../constructors/datatable'),
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
			if (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
								'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
								'stealth_ips.lan_ip, '+
								'stealth_ips.stealth, '+
								'stealth_ips.stealth_groups, '+
								'stealth_ips.user '+
							'FROM '+
								'`stealth_ips` '+
							'LEFT JOIN `conn` '+
							'ON ' +
								'conn.lan_ip = stealth_ips.lan_ip ' +
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND stealth_ips.stealth > 0 '+
							'GROUP BY stealth_ips.lan_ip',
					insert: [start, end],
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
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_groups' },
						{ title: 'User', select: 'user' },
						{ title: 'Local IP', select: 'lan_ip' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Stealth'
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
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};