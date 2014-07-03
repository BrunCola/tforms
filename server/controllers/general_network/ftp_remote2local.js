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
			if (req.query.remote_ip) {
				//var results = [];
				var tables = [];
				var info = [];

				var table1 = {
					query: 'SELECT '+
							'count(*) AS count, ' +
							'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
							'`machine`, ' +
							'`lan_zone`, ' +
							'ftp.lan_ip, ' +
							'`lan_port`, ' +
							'`remote_ip`, ' +
							'`remote_port`, '  +
							'`remote_cc`, ' +
							'`remote_country`, ' +
							'`remote_asn_name`, ' +
							'ftp.user AS `ftp_user`, ' +
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
							'sum(`ioc_count`) AS `ioc_count`, ' +
							'stealth_ips.stealth,'+
							'stealth_ips.stealth_groups, '+
							'stealth_ips.user '+
						'FROM ' +
							'`ftp` ' +
						'LEFT JOIN `stealth_ips` '+
						'ON ' +
							'ftp.lan_ip = stealth_ips.lan_ip ' +
						'WHERE ' + 
							'time BETWEEN ? AND ? '+
							'AND `remote_ip` = ? '+
						'GROUP BY '+
							'ftp.lan_ip',
					insert: [start, end, req.query.remote_ip],
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
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_groups' },
						{ title: 'User', select: 'user' },
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
						{ title: 'User', select: 'ftp_user' },
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
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Remote FTP/Local FTP'
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