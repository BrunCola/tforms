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
			if (req.query.http_host, req.query.lan_ip, req.query.lan_zone) {
				var tables = [];
				var table1 = {
					query: 'SELECT '+
							'count(*) as count, '+
							'date_format(max(from_unixtime(file.time)), "%Y-%m-%d %H:%i:%s") AS time,'+
							'file.lan_ip,'+
							'`lan_zone`,'+
							'`http_host`,'+
							'`mime`,'+
							'(sum(`size`) / 1048576) AS size,'+
							'sum(`ioc_count`) AS ioc_count '+
						'FROM '+
							'`file` '+
						'WHERE '+
							'file.time BETWEEN ? AND ? '+
							'AND `http_host` = ? '+
							'AND file.lan_ip = ? '+
							'AND `lan_zone` = ? '+
						'GROUP BY '+
							'`mime`',
					insert: [start, end, req.query.http_host, req.query.lan_ip, req.query.lan_zone],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							dView: true,
							link: {
								type: 'by_domain_local_mime_drill',
								// val: the pre-evaluated values from the query above
								val: ['http_host', 'lan_ip', 'lan_zone', 'mime'],
								crumb: false
							},
						},
						{ title: 'Total Extracted Files', select: 'count' },
						{ title: 'Domain', select: 'http_host' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'File Type', select: 'mime' },
						// { title: 'File Name', select: 'name', sClass:'file' },
						{ title: 'Total Size (MB)', select: 'size' },
						{ title: 'Total IOC Hits', select: 'ioc_count' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Extracted File Types'
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
						new datatable_stealth(table1, table2, {database: database, pool: pool}, function(err,data){
							tables.push(data);
							callback();
						});
					}
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
					var results = {
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