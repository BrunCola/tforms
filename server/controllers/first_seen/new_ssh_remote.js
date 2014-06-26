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
			var info = [];
			var table1 = {
				query: 'SELECT '+
						'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
						'`lan_zone`,'+
						'`machine`,'+
						'ssh_uniq_remote_ip.lan_ip,'+
						'`remote_ip`,'+
						'`remote_country`,'+
						'`remote_cc`,'+
						'`remote_asn`,'+
						'`remote_asn_name`,'+
						'`lan_client`,'+
						'`remote_server`, '+
						'stealth_ips.stealth,'+
						'stealth_ips.stealth_groups,'+
						'stealth_ips.user '+
					'FROM '+
						'`ssh_uniq_remote_ip` '+
					'LEFT JOIN `stealth_ips` '+
					'ON ' +
						'ssh_uniq_remote_ip.lan_ip = stealth_ips.lan_ip ' +
					'WHERE '+
						'`time` BETWEEN ? AND ?',
				insert: [start, end],
				params: [
					{ title: 'Last Seen', select: 'time' },
					{ title: 'Stealth', select: 'stealth' },
					{ title: 'COI Groups', select: 'stealth_groups' },
					{ title: 'User', select: 'user' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Machine Name', select: 'machine' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Local Client', select: 'lan_client' },
					{ title: 'Remote IP', select: 'remote_ip' },
					{ title: 'Remote Server', select: 'remote_server', },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Flag', select: 'remote_cc', },
					{ title: 'Remote ASN', select: 'remote_asn_name' },
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'New Remote IP Addresses Detected'
				}
			}
			var crossfilterQ = {
				query: 'SELECT '+
						'count(*) AS count,'+
						'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
						'`remote_country` '+
					'FROM '+
						'`ssh_uniq_remote_ip` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
					'GROUP BY '+
						'month(from_unixtime(`time`)),'+
						'day(from_unixtime(`time`)),'+
						'hour(from_unixtime(`time`)),'+
						'`remote_country`',
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
				res.json(results);
			});
		}
	}
};