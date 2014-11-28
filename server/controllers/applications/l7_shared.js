'use strict';

var dataTable = require('../constructors/datatable'),
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
			if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip && req.query.l7_proto) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'`time`,'+
							'`lan_stealth`,'+
							'`lan_zone`,'+
							'`lan_machine`,'+
							'`lan_user`,'+
							'`lan_ip`,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_cc`,'+
							'`remote_country`,'+
							'`remote_asn`,'+
							'`remote_asn_name`,'+
							'`l7_proto`,'+
							'(`in_bytes` / 1024) AS `in_bytes`,'+
							'(`out_bytes` / 1024) AS `out_bytes`,'+
							'`in_packets`,'+
							'`out_packets`,'+
							'`dns`,'+
							'`http`,'+
							'`ssl`,'+
							'`ftp`,'+
							'`irc`,'+
							'`smtp`,'+
							'`file`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_typeInfection`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_rule`,'+
							'`ioc_count` '+
						'FROM '+
							'`conn` ' +
						'WHERE '+
							'conn.time BETWEEN ? AND ? ' +
							'AND `lan_zone` = ? '+
							'AND conn.lan_ip = ? ' +
							'AND `remote_ip` = ? ' +
							'AND `l7_proto` = ?',
						insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.l7_proto],
					params: [
						{ title: 'Time', select: 'time' },
						{ title: 'Applications', select: 'l7_proto' },
						{ title: 'Stealth', select: 'lan_stealth', access: [3] },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Local Machine', select: 'lan_machine' },
						{ title: 'Local User', select: 'lan_user' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Local Port', select: 'lan_port' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote Port', select: 'remote_port' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote ASN', select: 'remote_asn_name' },
						{ title: 'IOC', select: 'ioc' },
						{ title: 'Infection Stage', select: 'ioc_typeInfection' },
						{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
						{ title: 'IOC Severity', select: 'ioc_severity' },
						{ title: 'IOC Rule', select: 'ioc_rule' },
						{ title: 'IOC Count', select: 'ioc_count' },
						{ title: 'KB to Remote', select: 'in_bytes' },
						{ title: 'KB from Remote', select: 'out_bytes'},
						{ title: 'Packets to Remote', select: 'in_packets', dView:false },
						{ title: 'Packets from Remote', select: 'out_packets', dView:false },
						{ title: 'IOC Count', select: 'ioc_count' },
						{ title: 'DNS', select: 'dns' },
						{ title: 'HTTP', select: 'http' },
						{ title: 'SSL', select: 'ssl' },
						{ title: 'FTP', select: 'ftp' },
						{ title: 'IRC', select: 'irc' },
						{ title: 'SMTP', select: 'smtp' },
						{ title: 'File', select: 'file' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Common IP Connections between Remote and Local Host'
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