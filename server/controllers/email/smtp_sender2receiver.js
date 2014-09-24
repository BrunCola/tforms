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
			if (req.query.mailfrom) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
								'count(*) AS count, ' +
								'max(smtp.time) as `time`, '+ // Last Seen
								'`stealth`,'+
								'`machine`,'+
								'`lan_zone`,'+
								'`lan_user`,'+
								'`lan_ip`,'+
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
								'`ioc_rule`,'+
								'`ioc_count` '+
							'FROM '+
								'`smtp` '+
							'WHERE ' +
								'`time` BETWEEN ? AND ? '+
								'AND `mailfrom` = ? '+
							'GROUP BY '+
								'`receiptto`',
					insert: [start, end, req.query.mailfrom],
					params: [
						{
							title: 'Last Seen',
							select: 'time',
							link: {
								type: 'smtp_from_sender',
								val: ['mailfrom','receiptto'],
								crumb: false
							}
						},
						{ title: 'Connections', select: 'count' },
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
						{ title: 'IOC Rule', select: 'ioc_rule' },
						{ title: 'IOC Count', select: 'ioc_count' },
						{ title: 'Stealth', select: 'stealth', access: [3] },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine', select: 'machine' },
						{ title: 'Local User', select: 'lan_user' },
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
						title: 'Sender/Receiver SMTP',
						access: req.session.passport.user.level
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
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};