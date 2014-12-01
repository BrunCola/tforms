'use strict';

var dataTable = require('../constructors/datatable'),
	config = require('../../config/config'),
	async = require('async'),
    query = require('../constructors/query');

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
			var tables = [];
			var info = [];
			var table1 = {
				query: 'SELECT '+
							'count(*) AS count,'+
							'max(ssh.time) AS `time`, '+
							'`lan_stealth`,'+
							'`lan_zone`,'+
							'`lan_machine`,'+
							'`lan_user`,'+
							'`lan_ip`,'+
							'sum(`ioc_count`) AS ioc_count '+
						'FROM '+
							'`ssh` '+
						'WHERE '+
							'ssh.time BETWEEN ? AND ? '+
						'GROUP BY '+
							'`lan_zone`,'+
							'ssh.lan_ip',
				insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						link: {
							 type: 'ssh_local2remote', 
							 val: ['lan_zone','lan_ip'],
							 crumb: false
						},
					},
					{ title: 'Connections', select: 'count' },
					{ title: 'Stealth', select: 'lan_stealth', access: [3] },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Local Machine', select: 'lan_machine' },
					{ title: 'Local User', select: 'lan_user' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'IOC Count', select: 'ioc_count' }
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'SSH',
					access: req.session.passport.user.level
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
		}
	}
};