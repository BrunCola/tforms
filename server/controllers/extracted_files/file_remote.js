'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
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
			if (req.query.remote_ip && req.query.mime) {
				var tables = [];
				var table1 = {
					query: 'SELECT '+
							'date_format(from_unixtime(file.time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
							'`mime`, '+
							'`name`, '+
							'`lan_zone`, '+
							'`machine`, '+
							'file.lan_ip, '+
							'`lan_port`, '+
							'`remote_ip`, '+
							'`remote_port`, '+
							'`remote_asn`, '+
							'`remote_asn_name`, '+
							'`remote_country`, '+
							'`remote_cc`, '+
							'(`size` / 1024) AS `size`, '+
							'`proto`, '+
							'`md5`, '+
							'`http_host`, '+
							'`ioc`, '+
							'`ioc_typeIndicator`, '+
							'`ioc_typeInfection` '+
						'FROM '+
							'`file` '+
						'WHERE '+
							'file.time BETWEEN ? AND ? '+
							'AND `remote_ip` = ? '+
							'AND `mime` = ? ',
					insert: [start, end, req.query.remote_ip, req.query.mime],
					params: [
						{ title: 'Last Seen', select: 'time' },
						{ title: 'File Type', select: 'mime' },
						{ title: 'Name', select: 'name', sClass:'file'},
						{ title: 'Size (KB)', select: 'size' },
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'Machine', select: 'machine' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Local Port', select: 'lan_port' },
						{ title: 'Remote IP', select: 'remote_ip' },
						{ title: 'Remote Port', select: 'remote_port' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'ASN', select: 'remote_asn' },
						{ title: 'ASN Name', select: 'remote_asn_name' },
						{ title: 'Protocol', select: 'proto' },
						{ title: 'Domain', select: 'http_host' },
						{ title: 'IOC', select: 'ioc' },
						{ title: 'IOC Type', select: 'ioc_typeIndicator' },
						{ title: 'IOC Stage', select: 'ioc_typeInfection' },
						{ title: 'MD5', select: 'md5' }
					],
					settings: {
						sort: [[1, 'desc']],
						div: 'table',
						title: 'Extracted Files by Remote IP'
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
					}
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
					var results = {
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