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
						'count(*) AS count, ' +
						'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
						'`machine`, ' +
						'`lan_zone`, ' +
						'irc.lan_ip, ' +
						'`lan_port`, ' +
						'stealth_ips.stealth,'+
						'stealth_ips.stealth_groups, '+
						'stealth_ips.user '+
					'FROM '+
						'`irc` '+
					'LEFT JOIN `stealth_ips` '+
					'ON ' +
						'irc.lan_ip = stealth_ips.lan_ip ' +
					'WHERE '+
						'time BETWEEN ? AND ? '+
					'GROUP BY '+
						'`lan_zone`, irc.lan_ip',
				insert: [start, end],
					params: [
					{
						title: 'Last Seen',
						select: 'time',
						link: {
						 	type: 'irc_local2remote', 
						 	// val: the pre-evaluated values from the query above
						 	val: ['lan_ip', 'lan_zone'],
						 	crumb: false
						},
					},
					{ title: 'Stealth', select: 'stealth' },
					{ title: 'COI Groups', select: 'stealth_groups' },
					{ title: 'User', select: 'user' },
					{ title: 'Connections', select: 'count' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Machine', select: 'machine' },
					{ title: 'Local IP', select: 'lan_ip' }
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'Local IRC'
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