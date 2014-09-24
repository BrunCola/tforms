'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
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
			if (req.query.remote_ip) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'count(*) AS count,'+
							'max(ssh.time) as `time`,'+
							'`lan_zone`,'+
							'`machine`,'+
							'ssh.lan_ip,'+
							'`remote_ip`,'+
							'`remote_cc`, ' +
							'`remote_country`, ' +
							'`remote_asn`, ' +
							'`remote_asn_name`, ' +
							'sum(`ioc_count`) AS ioc_count ' +
						'FROM '+
							'`ssh` '+
						'WHERE '+
							'ssh.time BETWEEN ? AND ? '+
							'AND `remote_ip` = ? '+
						'GROUP BY '+
							'`lan_zone`,'+
							'ssh.lan_ip',
					insert: [start, end, req.query.remote_ip],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'ssh_shared',
								// val: the pre-evaluated values from the query above
								val: ['lan_zone','lan_ip','remote_ip'],
								crumb: false
							}
						},
						{ title: 'Connections', select: 'count' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine Name', select: 'machine' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote ASN', select: 'remote_asn' },
						{ title: 'Remote ASN Name', select: 'remote_asn_name' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Remote To Local SSH'
					}
				}
				var table2 = {
					query: 'SELECT '+
							'time, '+ 
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