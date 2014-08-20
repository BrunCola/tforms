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
						'`lan_zone`,'+
						'`machine`,'+
						'`lan_ip`,'+
						'`operating_system`,'+
						'`mac_address`,'+
						'`endpoint_agent`,'+
						'`username`,'+
						'`stealth`,'+
						'`vendor`,'+
						'`ioc_count` '+
					'FROM '+
						'`users` ',//+
					// 'WHERE '+
						// 'conn_local.time BETWEEN ? AND ? '+
					// 'GROUP BY '+
						// '`lan_zone`,'+
						// 'conn_local.lan_ip',
				insert: [start, end],
				params: [
					// {
					// 	title: 'Last Seen',
					// 	select: 'time',
					// 	dView: true,
					// 	link: {
					// 		type: 'local2remote',
					// 		// val: the pre-evaluated values from the query above
					// 		val: ['lan_zone','lan_ip'],
					// 		crumb: false
					// 	},
					// },
					{ title: 'Username', select: 'username' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Machine Name', select: 'machine' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'OS', select: 'operating_system' },
					{ title: 'Vendor', select: 'vendor' },
					{ title: 'MAC Address', select: 'mac_address'},
					{ title: 'Endpoint Agent', select: 'endpoint_agent' },
					{ title: 'Stealth', select: 'stealth' },
					{ title: 'IOC Hits', select: 'ioc_count' }					
				],
				settings: {
					sort: [[0, 'desc']],
					div: 'table',
					title: 'Users'
				}
			}
			// var table2 = {
			// 	query: 'SELECT '+
			// 			'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ 
			// 			'`stealth_COIs`, ' +
			// 			'`stealth`, '+
			// 			'`lan_ip`, ' +
			// 			'`event`, ' +
			// 			'`user` ' +
			// 		'FROM ' + 
			// 			'`endpoint_tracking` '+
			// 		'WHERE ' + 
			// 			'stealth > 0 '+
			// 			'AND event = "Log On" ',
			// 	insert: [],
			// 	params: [
			// 		{ title: 'Stealth', select: 'stealth' },
			// 		{ title: 'COI Groups', select: 'stealth_COIs' },
			// 		{ title: 'User', select: 'user' }
			// 	],
			// 	settings: {}
			// }
			async.parallel([
				// Table function(s)
				function(callback) {
					// new datatable_stealth(table1, table2, parseInt(req.session.passport.user.level), {database: database, pool: pool}, function(err,data){
					new dataTable(table1, {database: database, pool: pool}, function(err,data){
						tables.push(data);
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
				res.json(results);
			});
		}
	}
};