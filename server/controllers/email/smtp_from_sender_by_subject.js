'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
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
			if (req.query.mailfrom && req.query.receiptto && req.query.subject) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'date_format(from_unixtime(smtp.time), "%Y-%m-%d %H:%i:%s") AS time,'+
							'`lan_zone`,'+
							'`machine`,'+
							'smtp.lan_ip,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_country`,'+
							'`remote_cc`,'+
							'`remote_asn_name`,'+
							'`mailfrom`,'+
							'`receiptto`,'+
							'`reply_to`,'+
							'`in_reply_to`,'+
							'`subject`,'+
							'`user_agent`,'+
							'`fuids`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_typeInfection`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_count` '+
						'FROM '+
							'`smtp` '+
						'WHERE '+
							'smtp.time BETWEEN ? AND ? '+
							'AND `mailfrom` = ? '+
							'AND `receiptto` = ? '+
							'AND `subject` = ?',
					insert: [start, end, req.query.mailfrom, req.query.receiptto, req.query.subject],
					params: [
						{ title: 'Time', select: 'time' },
						{ title: 'From', select: 'mailfrom' },
						{ title: 'To', select: 'receiptto' },
						{ title: 'Reply To', select: 'reply_to' },
						{ title: 'In Reply To', select: 'in_reply_to' },
						{ title: 'Subject', select: 'subject' },
						{ title: 'User Agent', select: 'user_agent' },
						{ title: 'FUIDS', select: 'fuids' },
						{ title: 'IOC', select: 'ioc' },
						{ title: 'IOC Severity', select: 'ioc_severity' },
						{ title: 'Infection Stage', select: 'ioc_typeInfection' },
						{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
						{ title: 'IOC Count', select: 'ioc_count' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine Name', select: 'machine' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Local port', select: 'lan_port' },
						{ title: 'Remote IP', select: 'remote_ip' },
						{ title: 'Remote port', select: 'remote_port' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote ASN Name', select: 'remote_asn_name' },
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Emails From Sender to Receiver by Subject'
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
					},
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
					var results = {
						info: info,
						tables: tables
					};
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};