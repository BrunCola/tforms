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
							'count(*) AS count, ' +
							'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
							'`machine`, ' +
							'`lan_zone`, ' +
							'`lan_ip`, ' +
							'`lan_port`, ' +
							'`remote_ip`, ' +
							'`remote_port`, '  +
							'`remote_cc`, ' +
							'`remote_country`, ' +
							'`remote_asn_name`, ' +
							'`user`, ' +
							'`password`, ' +
							'`command`, ' +
							'`arg`, ' +
							'`mime_type`, ' +
							'`file_size`, ' +
							'`reply_code`, ' +
							'`reply_msg`, ' +
							'`dc_passive`, ' +
							'`dc_orig_h`, ' +
							'`dc_resp_h`, ' +
							'`dc_resp_p`, ' +
							'`ioc`, ' +
							'`ioc_severity`, ' +
							'`ioc_typeInfection`, ' +
							'`ioc_typeIndicator`, ' +
							'sum(`ioc_count`) AS `ioc_count` ' +
						'FROM ' +
							'`ftp` ' +
						'WHERE ' + 
							'time BETWEEN ? AND ? '+
							'AND `lan_ip` = ? '+
							'AND `lan_zone` = ? '+
						'GROUP BY '+
							'`remote_ip`',
					insert: [start, end, req.query.lan_ip, req.query.lan_zone],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'ftp_shared',
								// val: the pre-evaluated values from the query above
								val: ['lan_ip','lan_zone','remote_ip'],
								crumb: false
							}
						},
						{ title: 'Connections', select: 'count' },
						{ title: 'Machine', select: 'machine' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Local port', select: 'lan_port' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote port', select: 'remote_port' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Remote ASN Name', select: 'remote_asn_name' },
						{ title: 'User', select: 'user' },
						{ title: 'Password', select: 'password' },
						{ title: 'Command', select: 'command' },
						{ title: 'Arg', select: 'arg' },
						{ title: 'File Type', select: 'mime_type' },
						{ title: 'File Size', select: 'file_size' },
						{ title: 'Reply Code', select: 'reply_code' },
						{ title: 'Reply Message', select: 'reply_msg' },
						{ title: 'DC Passive', select: 'dc_passive' },
						{ title: 'DC Orig P', select: 'dc_orig_h' },
						{ title: 'DC Resp H', select: 'dc_resp_h' },
						{ title: 'DC Resp P', select: 'dc_resp_p' },
						{ title: 'IOC', select: 'ioc' },
						{ title: 'IOC Severity', select: 'ioc_severity' },
						{ title: 'Infection Stage', select: 'ioc_typeInfection' },
						{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Local FTP/Remote FTP'
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