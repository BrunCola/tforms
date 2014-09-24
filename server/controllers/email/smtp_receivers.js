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
			var tables = [];
			var info = [];
			var table1 = {
				query: 'SELECT '+
						'count(*) AS count,'+
						'time,'+
						'`receiptto`,'+
						'sum(`ioc_count`) AS ioc_count '+
					'FROM '+
						'`smtp` '+
					'WHERE '+
						'time BETWEEN ? AND ? '+
					'GROUP BY '+
						'`receiptto`',
				insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						 link: {
							type: 'smtp_receiver2sender', 
							val: ['receiptto'],
							crumb: false
						},
					},
					{ title: 'Connections', select: 'count' },
					{ title: 'To', select: 'receiptto' },
					{ title: 'IOC Count', select: 'ioc_count' }
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'Top Email Receivers'
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