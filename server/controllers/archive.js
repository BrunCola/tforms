'use strict';

var dataTable = require('./constructors/datatable'),
query = require('./constructors/query'),
config = require('../config/config'),
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
			var crossfilter = [];
			var info = [];
			var table1 = {
				query: 'SELECT '+
					// SELECTS
                    'max(`time`) AS `time`,'+ // Last Seen
					'`ioc_severity`, '+
					'count(*) AS count, '+
					'`ioc`, '+
					'`ioc_typeIndicator`, '+
					'`ioc_typeInfection`, '+
					'`ioc_rule`, '+
					'`lan_zone`, '+
					'`lan_ip`, '+
					'`machine`, '+
					'`remote_ip`, '+
					'`remote_asn`, '+
					'`remote_asn_name`, '+
					'`remote_country`, '+
					'`remote_cc`, '+
					'sum(in_packets) AS in_packets, '+
					'sum(out_packets) AS out_packets, '+
					'sum(`in_bytes`) AS in_bytes, '+
					'sum(`out_bytes`) AS out_bytes '+
					// !SELECTS
					'FROM conn_ioc '+
					'WHERE time BETWEEN ? AND ? '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NOT NULL '+
					'GROUP BY `lan_ip`,`remote_ip`,`ioc`',
				insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						dView: true,
						link: {
							type: 'ioc_drill',
							// val: the pre-evaluated values from the query above
							val: ['lan_ip','remote_ip','ioc'],
							crumb: false
						},
					},
					{ title: 'Severity', select: 'ioc_severity' },
					{ title: 'IOC Hits', select: 'count' },
					{ title: 'IOC', select: 'ioc' },
					{ title: 'IOC Type', select: 'ioc_typeIndicator' },
					{ title: 'IOC Stage', select: 'ioc_typeInfection' },
					{ title: 'IOC Rule', select: 'ioc_rule' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Machine Name', select: 'machine' },
					{ title: 'Remote IP', select: 'remote_ip' },
					{ title: 'Remote ASN', select: 'remote_asn' },
					{ title: 'Remote ASN Name', select: 'remote_asn_name' },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Flag', select: 'remote_cc', },
					{ title: 'Packets to Remote', select: 'in_packets' },
					{ title: 'Packets from Remote', select: 'out_packets' },
					{ title: 'Bytes to Remote', select: 'in_bytes', dView: false },
					{ title: 'Bytes from Remote', select: 'out_bytes', dView: false },
					{
						title: '',
						select: null,
						dView: true,
						link: {
							type: 'Restore',
						},
					}
				],
				settings: {
					sort: [[0, 'desc']],
					div: 'table',
					title: 'Archived Indicators of Compromise (IOC) Notifications'
				}
			}
			var crossfilterQ = {
				query: 'SELECT '+
					// SELECTS
					'time, '+ // Last Seen
					'`remote_country`, '+
					'ioc_severity, '+
					'count(*) as count, '+
					'`ioc` '+
					// !SELECTS
					'FROM conn_ioc '+
					'WHERE time BETWEEN ? AND ? '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NOT NULL '+
					'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity, ioc',
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
				}
			], function(err) { //This function gets called after the two tasks have called their "task callbacks"
				if (err) throw console.log(err);
				var results = {
					info: info,
					tables: tables,
					crossfilter: crossfilter
				};
				//console.log(results);
				res.jsonp(results);
			});
		}
	}
};