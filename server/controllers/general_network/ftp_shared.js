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
			if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT ' +
							'from_unixtime(ftp.time) as time, '+ // Last Seen
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
							'`ioc_rule`, ' +
							'`ioc_count` ' +
						'FROM ' +
							'`ftp` ' +
						'WHERE '+ 
							'ftp.time BETWEEN ? AND ? ' +
							'AND `lan_zone` = ? '+
							'AND ftp.lan_ip = ? ' +
							'AND `remote_ip` = ? ',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip],
					params: [
						{
							title: 'Time',
							select: 'time'
						},
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
						{ title: 'IOC Rule', select: 'ioc_rule' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Common FTP Connections between Remote and Local Host'
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