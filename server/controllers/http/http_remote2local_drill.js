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
			if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT ' +
							'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
							'`lan_zone`, ' +
							'`lan_ip`, ' +
							'`remote_ip`, ' +
							'`remote_port`, ' +
							'`remote_cc`, ' +
							'`remote_country`, ' +
							'`remote_asn_name`, ' +
							'`ioc_count` ' +
						'FROM ' +
							'`http_meta` ' +
						'WHERE '+
							'time BETWEEN ? AND ? ' +
							'AND `lan_zone` = \'?\' '+
							'AND `lan_ip` = \'?\' ' +
							'AND `remote_ip` = \'?\' ',
					insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip],
					params: [
						{
							title: 'Time',
							select: 'time'
						},
						{ title: 'Zone', select: 'lan_zone' },
						{ title: 'LAN IP', select: 'lan_ip' },
						{ title: 'Remote IP', select: 'remote_ip'},
						{ title: 'Remote port', select: 'remote_port' },
						{ title: 'Flag', select: 'remote_cc' },
						{ title: 'Remote Country', select: 'remote_country' },
						{ title: 'Remote ASN Name', select: 'remote_asn_name' },
						{ title: 'IOC Count', select: 'ioc_count' }
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Common HTTP Connections between Remote and Local Host'
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