'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
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
			var crossfilter = [];
			var piechart = [];
			var info = [];
			var table1 = {
				query: 'SELECT '+
						'sum(`count`) AS `count`, '+
						'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time, '+ // LASt Seen
						'`l7_proto`, '+
						'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
						'(sum(`out_bytes`) / 1048576) AS out_bytes, '+
						'sum(`in_packets`) AS in_packets, '+
						'sum(`out_packets`) AS out_packets, '+
						'sum(`dns`) AS `dns`, '+
						'sum(`http`) AS `http`, '+
						'sum(`ssl`) AS `ssl`, '+
						'sum(`ftp`) AS `ftp`, '+
						'sum(`irc`) AS `irc`, '+
						'sum(`smtp`) AS `smtp`, '+
						'sum(`file`) AS `file`, '+
						'sum(`ioc_count`) AS `ioc_count` '+
					'FROM '+
						'`conn_l7_proto` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
						'AND `l7_proto` !=\'-\' '+
					'GROUP BY '+
						'`l7_proto`',
					insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						dView: true,
						link: {
							type: 'application_drill',
							val: ['l7_proto'],
							crumb: false
						},
					},
					{ title: 'Applications', select: 'l7_proto' },
					{ title: 'MB to Remote', select: 'in_bytes' },
					{ title: 'MB from Remote', select: 'out_bytes' },
					{ title: 'Packets to Remote', select: 'in_packets', dView: false },
					{ title: 'Packets from Remote', select: 'out_packets', dView: false },
					{ title: 'IOC Count', select: 'ioc_count' },	
					{ title: 'Connections', select: 'count' },
					{ title: 'DNS', select: 'dns' },
					{ title: 'HTTP', select: 'http' },
					{ title: 'SSL', select: 'ssl' },
					{ title: 'FTP', select: 'ftp' },
					{ title: 'IRC', select: 'irc' },
					{ title: 'SMTP', select: 'smtp' },
					{ title: 'File', select: 'file' },
				],
				settings: {
					sort: [[2, 'desc']],
					div: 'table',
					title: 'Application Bandwidth Usage'
				}
			}
			var crossfilterQ = {
				query: 'SELECT '+
						'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
						'(sum(in_bytes + out_bytes) / 1048576) AS count, '+
						'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
						'(sum(`out_bytes`) / 1048576) AS out_bytes '+
					'FROM '+
						'`conn_l7_proto` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
					'GROUP BY '+
						'month(from_unixtime(time)),'+
						'day(from_unixtime(time)),'+
						'hour(from_unixtime(time))',
				insert: [start, end]
			}
			var piechartQ = {
				query: 'SELECT '+
						'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
						'`l7_proto`, '+
						'(sum(in_bytes + out_bytes) / 1048576) AS count '+
					'FROM '+
						'`conn_l7_proto` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
						'AND `l7_proto` !=\'-\' '+
					'GROUP BY '+
						'`l7_proto`',
				insert: [start, end]
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
				},
				// Piechart function
				function(callback) {
					new query(piechartQ, {database: database, pool: pool}, function(err,data){
						piechart = data;
						console.log(piechart);
						callback();
					});
				}
			], function(err) { //This function gets called after the two tasks have called their "task callbacks"
				if (err) throw console.log(err);
				var results = {
					info: info,
					tables: tables,
					crossfilter: crossfilter,
					piechart: piechart
				};
				res.json(results);
			});
		}
	}
};