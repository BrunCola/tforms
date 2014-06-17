'use strict';

var dataTable = require('../constructors/datatable'),
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
							'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time,'+
							'`lan_zone`,'+
							'`machine`,'+
							'`lan_ip`,'+
							'`remote_ip`,'+
							'`remote_cc`, ' +
							'`remote_country`, ' +
							'`remote_asn`, ' +
							'`remote_asn_name`, ' +
							'sum(`ioc_count`) AS ioc_count ' +
						'FROM '+
							'`ssh` '+
						'WHERE '+
							'time BETWEEN ? AND ? '+
							'AND `remote_ip` = \'?\' '+
						'GROUP BY '+
							'`lan_zone`,'+
							'`lan_ip`',
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