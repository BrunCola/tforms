'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
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
			//var results = [];
			var tables = [];
			var table1 = {
				query: 'SELECT '+
						'sum(`count`) AS `count`,'+
						'date_format(max(from_unixtime(file_local.time)), "%Y-%m-%d %H:%i:%s") AS time,'+
						'`lan_zone`,'+
						'`machine`,'+
						'file_local.lan_ip,'+
						'(sum(size) / 1048576) AS size,'+
						'sum(ioc_count) AS ioc_count '+
					'FROM '+
						'`file_local` '+
					'WHERE '+
						'file_local.time BETWEEN ? AND ? '+
					'GROUP BY '+
						'`lan_zone`,'+
						'file_local.lan_ip',
				insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						dView: true,
						link: {
							type: 'by_file_name',
							// val: the pre-evaluated values from the query above
							val: ['lan_zone','lan_ip'],
							crumb: false
						},
					},
					{ title: 'Total Extracted Files', select: 'count' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Machine', select: 'machine' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Total Size (MB)', select: 'size' },
					{ title: 'Total IOC Hits', select: 'ioc_count' }
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'Local User Extracted Files'
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
				}
			], function(err) { //This function gets called after the two tasks have called their "task callbacks"
				if (err) throw console.log(err);
				var results = {
					tables: tables
				};
				//console.log(results);
				res.json(results);
			});
		}
	}
};
