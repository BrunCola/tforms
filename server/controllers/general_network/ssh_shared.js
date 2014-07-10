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
			if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'date_format(from_unixtime(ssh.time), "%Y-%m-%d %H:%i:%s") AS time,'+
							'`machine`,'+
							'`lan_zone`,'+
							'ssh.lan_ip,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_cc`,'+
							'`remote_country`,'+
							'`remote_asn`,'+
							'`remote_asn_name`,'+
							'`status_code`,'+
							'`direction`,'+
							'`lan_client`,'+
							'`remote_server`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_typeInfection`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_count`, ' +
							'endpoint_tracking.stealth,'+
							'endpoint_tracking.stealth_COIs, '+
							'endpoint_tracking.user '+
						'FROM '+
							'`ssh` '+
						'LEFT JOIN `endpoint_tracking` '+
						'ON ' +
							'ssh.lan_ip = endpoint_tracking.lan_ip ' +
						'WHERE '+
							'ssh.time BETWEEN ? AND ? '+
							'AND `lan_zone` = ? '+
							'AND ssh.lan_ip = ? '+
							'AND `remote_ip` = ?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip],
					params: [
						{ title: 'Time', select: 'time' },
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_COIs' },
						{ title: 'User', select: 'user' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine Name', select: 'machine' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Local port', select: 'lan_port' },
						{ title: 'Local client', select: 'lan_client' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote port', select: 'remote_port' },
						{ title: 'Remote Server', select: 'remote_server' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote ASN', select: 'remote_asn' },
						{ title: 'Remote ASN Name', select: 'remote_asn_name' },
						{ title: 'Status Code', select: 'status_code' },
						{ title: 'IOC', select: 'ioc' },
						{ title: 'Infection Stage', select: 'ioc_typeInfection' },
						{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
						{ title: 'Severity', select: 'ioc_severity' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Common SSH Connections between Remote and Local Host'
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