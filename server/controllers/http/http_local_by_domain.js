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
			if (req.query.lan_ip && req.query.lan_zone) {
				//var results = [];
				var tables = [];
				var crossfilter = [];
				var info = [];

				var table1 = {
					query: 'SELECT '+
							'sum(`count`) AS `count`, '+
							'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
							'`lan_zone`, ' +
							'`lan_ip`, ' +
							'`host`, ' +
							'sum(`ioc_count`) AS `ioc_count` ' +
						'FROM ' +
							'`http_meta` '+
						'WHERE ' +
							'time BETWEEN ? AND ? '+
							'AND `lan_zone` = \'?\' '+
							'AND `lan_ip` = \'?\' '+
						'GROUP BY '+
							'`host`',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'http_by_domain_local_drill',
								// val: the pre-evaluated values from the query above
								val: ['lan_ip','lan_zone','host'],
								crumb: false
							}
						},
						{ title: 'Connections', select: 'count' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Domain', select: 'host'},
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Local HTTP by Domain'
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
					//console.log(results);
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};