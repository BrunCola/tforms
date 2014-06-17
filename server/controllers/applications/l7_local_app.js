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
			if (req.query.lan_zone && req.query.lan_ip) {
				//var results = [];
				var tables = [];
				var crossfilter = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							// SELECTS
							'sum(`count`) AS `count`, '+
							'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) AS time, '+
							'`lan_zone`, '+
							'`machine`,'+
							'`lan_ip`, '+
							'`l7_proto`, '+
							'sum(`in_packets`) AS in_packets, '+
							'sum(`out_packets`) AS out_packets, '+
							'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
							'(sum(`out_bytes`) / 1048576) AS out_bytes, '+
							'sum(`dns`) AS `dns`, '+
							'sum(`http`) AS `http`, '+
							'sum(`ssl`) AS `ssl`, '+
							'sum(`ftp`) AS `ftp`, '+
							'sum(`irc`) AS `irc`, '+
							'sum(`smtp`) AS `smtp`, '+
							'sum(`file`) AS `file`, '+
							'sum(`ioc_count`) AS `ioc_count` '+
							// !SELECTS
						'FROM `conn_l7_meta` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone` = ? '+
							'AND `lan_ip` = ? '+
						'GROUP BY '+
							'`l7_proto`',
						insert: [start, end, req.query.lan_zone, req.query.lan_ip],
					params: [
							{
								title: 'Last Seen',
								select: 'time',
								dView: true,
								link: {
									type: 'l7_local_drill',
									// val: the pre-evaluated values from the query above
									val: ['lan_zone','lan_ip','l7_proto'],
									crumb: false
								},
							},
							{ title: 'Applications', select: 'l7_proto' },
							{ title: 'Local IP', select: 'lan_ip', dView:false },
							{ title: 'Machine Name', select: 'machine', dView:false },
							{ title: 'Zone', select: 'lan_zone', dView:false },
							{ title: 'MB to Remote', select: 'in_bytes' },
							{ title: 'MB from Remote', select: 'out_bytes'},
							{ title: 'Packets to Remote', select: 'in_packets', dView:false },
							{ title: 'Packets from Remote', select: 'out_packets', dView:false },
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
						sort: [[3, 'desc']],
						div: 'table',
						title: 'Local IP Bandwidth Usage'
					}
				}
				var crossfilterQ = {
					query: 'SELECT '+
							'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time, '+ // Last Seen
							'(sum(in_bytes + out_bytes) / 1048576) AS count '+
						'FROM `conn_l7_meta` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `lan_zone` = ? '+
							'AND `lan_ip` = ? '+
						'GROUP BY '+
							'month(from_unixtime(time)),'+
							'day(from_unixtime(time)),'+
							'hour(from_unixtime(time))',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip]
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
					if (err) throw console.log(err)
					var results = {
						info: info,
						tables: tables,
						crossfilter: crossfilter
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