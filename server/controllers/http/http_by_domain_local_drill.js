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
			if (req.query.lan_zone && req.query.lan_ip && req.query.host) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT ' +
							'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
							//'`stealth`, ' +
							'`machine`, ' +
							'`lan_zone`, ' +
							'http.lan_ip, ' +
							'`remote_ip`, ' +
							'`remote_port`, ' +
							'`remote_cc`, ' +
							'`remote_country`, ' +
							'`remote_asn_name`, ' +
							'`depth`, ' +
							'`method`, ' +
							'`host`, ' +
							'`uri`, ' +
							'`url`, ' +
							'`referrer`, ' +
							'`user_agent`, ' +
							'`request_body_len`, ' +
							'`response_body_len`, ' +
							'`status_code`, ' +
							'`status_msg`, ' +
							'`info_code`, ' +
							'`info_msg`, ' +
							'`filename`, ' +
							'`tags`, ' +
							'`proxied`, ' +
							'`local_mime_types`, ' +
							'`remote_mime_types`, ' +
							'`ioc_count`, ' +
							'stealth_ips.stealth, '+
							'stealth_ips.stealth_groups '+
						'FROM ' +
							'`http` ' +
						'LEFT JOIN `stealth_ips` '+
						'ON ' +
							'http.lan_ip = stealth_ips.lan_ip ' +
						'WHERE '+ 
							'time BETWEEN ? AND ? ' +
							'AND `lan_zone` = ? '+
							'AND http.lan_ip = ? ' +
							'AND `host` = ?',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.host],
					params: [
						{
							title: 'Time',
							select: 'time'
						},
						{ title: 'Stealth', select: 'stealth' },
						{ title: 'COI Groups', select: 'stealth_groups' },
						//{ title: 'Stealth', select: 'stealth', dView:false },
						{ title: 'Domain', select: 'host' },
						{ title: 'URI', select: 'uri' },
						{ title: 'URL', select: 'url' },
						{ title: 'Referrer', select: 'referrer' },
						{ title: 'User Agent', select: 'user_agent' },
						{ title: 'Depth', select: 'depth' },
						{ title: 'Method', select: 'method' },
						{ title: 'Machine Name', select: 'machine' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'LAN IP', select: 'lan_ip' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote port', select: 'remote_port' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Remote ASN Name', select: 'remote_asn_name' },
						{ title: 'Request Body Length', select: 'request_body_len', dView:false },
						{ title: 'Response Body Length', select: 'response_body_len', dView:false },
						{ title: 'Status Code', select: 'status_code', dView:false },
						{ title: 'Status Message', select: 'status_msg', dView:false },
						{ title: 'Info Code', select: 'info_code', dView:false },
						{ title: 'Info Message', select: 'info_msg', dView:false },
						{ title: 'File Name', select: 'filename', dView:false },
						{ title: 'Tags', select: 'tags', dView:false },
						{ title: 'Proxied', select: 'proxied', dView:false },
						{ title: 'Local File Type', select: 'local_mime_types', dView:false },
						{ title: 'Reemote File Type', select: 'remote_mime_types', dView:false },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Common HTTP Connections between Domain and Local Host'
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