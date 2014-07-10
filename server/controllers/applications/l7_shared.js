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
			if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip && req.query.l7_proto) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'date_format(from_unixtime(conn.time), "%Y-%m-%d %H:%i:%s") AS time,'+
							'`machine`,'+
							'`l7_proto`,'+
							'`lan_zone`,'+
							'conn.lan_ip,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_cc`,'+
							'`remote_country`,'+
							'`remote_asn`,'+
							'`remote_asn_name`,'+
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
							'`ioc_count`,'+
							'endpoint_tracking.stealth, '+
							'endpoint_tracking.user, '+
							'endpoint_tracking.stealth_COIs '+
						'FROM '+
							'`conn` ' +
						'LEFT JOIN `endpoint_tracking` '+
						'ON ' +
							'conn.lan_ip = endpoint_tracking.lan_ip ' +
						'WHERE '+
							'conn.time BETWEEN ? AND ? ' +
							'AND `lan_zone` = ? '+
							'AND conn.lan_ip = ? ' +
							'AND `remote_ip` = ? ' +
							'AND `l7_proto` = ?',
						insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.l7_proto],
					params: [
						{ title: 'Time', select: 'time' },
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_COIs' },
						{ title: 'User', select: 'user' },
						{ title: 'Applications', select: 'l7_proto' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine Name', select: 'machine' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Local port', select: 'lan_port' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote port', select: 'remote_port' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote ASN', select: 'remote_asn_name' },
						{ title: 'IOC', select: 'ioc' },
						{ title: 'Infection Stage', select: 'ioc_typeInfection' },
						{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
						{ title: 'IOC Severity', select: 'ioc_severity' },
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