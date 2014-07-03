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
								'`ip`, '+
								'sum(`in_packets`) AS `in_packets`, '+
								'sum(`out_packets`) AS `out_packets`, '+
								'sum(`in_bytes`) AS `in_bytes`, '+
								'sum(`out_bytes`) AS `out_bytes` '+
							'FROM '+
								'`stealth_user` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
							'GROUP BY `ip`',
					insert: [start, end],
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
						{ title: 'IP', select: 'ip' },
						{ title: 'MB to Remote', select: 'in_bytes' },
						{ title: 'MB from Remote', select: 'out_bytes' },
						{ title: 'Packets to Remote', select: 'in_packets' },
						{ title: 'Packets from Remote', select: 'out_packets' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Stealth IPs'
					}
				}
				var crossfilterQ = {
					query: 'SELECT '+
						'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
						'(sum(in_bytes + out_bytes) / 1048576) AS count, '+
						'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
						'(sum(`out_bytes`) / 1048576) AS out_bytes '+
					'FROM '+
						'`stealth_conn` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
					'GROUP BY '+
						'month(from_unixtime(time)),'+
						'day(from_unixtime(time)),'+
						'hour(from_unixtime(time))',
					insert: [start, end, req.query.ip]
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new dataTable(table1, {database: database, pool: pool}, function(err,data){
							tables.push(data);
							callback();
						});
					},
					// Crossfilter function
					function(callback) {
						new query(crossfilterQ, {database: database, pool: pool}, function(err,data){
							crossfilter = data;
							callback();
						});
					}
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