'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			if ((req.session.passport.user.email === config.reports.email) && (req.query.database !== null)) {
				database = req.query.database;
			}
			// var database = null;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			//var results = [];
			var tables = [];
			var crossfilter = [];
			var info = [];

			switch (req.query.type) {
				case 'glossary':
					var iocType = req.query.iocType;
					new query({query: 'SELECT description FROM ioc_parent WHERE ioc_parent =\'?\'', insert: [iocType]}, 'rp_ioc_intel', function(err,data){
						if (data) {
							res.json({
								title: iocType,
								desc: data
							});
						}
					});
					break;
				case 'ioc_notifications':
					new query({query: 'SELECT count(*) AS count FROM `conn_ioc` WHERE (time between ? AND ?) AND ioc_count > 0 AND trash IS NULL', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data);
						}
					});
					break;
				case 'ioc_groups':
					new query({query: 'SELECT `ioc` FROM `conn_ioc` WHERE (time between ? AND ?) AND ioc_count > 0 AND trash IS NULL GROUP BY ioc', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'local_ips':
					new query({query: 'SELECT `lan_ip` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `lan_zone`,`lan_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'remote_ip':
					new query({query: 'SELECT `remote_ip` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `remote_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'remote_country':
					new query({query: 'SELECT `remote_country` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `remote_country`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'query':
					new query({query: 'SELECT `query` FROM `dns_ioc` WHERE (`time` between ? AND ?) GROUP BY `query`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'host':
					new query({query: 'SELECT `host` FROM `http_ioc` WHERE (`time` between ? AND ?) GROUP BY `host`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'remote_ip_ssl':
					new query({query: 'SELECT `remote_ip` FROM `ssl_ioc` WHERE (`time` between ? AND ?) GROUP BY `remote_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'name':
					new query({query: 'SELECT `name` FROM `file_ioc` WHERE (`time` between ? AND ?) GROUP BY `name`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'l7_proto':
					new query({query: 'SELECT `l7_proto` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `l7_proto`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				// Info function(s) --- Network
				case 'conn_meta':
					new query({query: 'SELECT `lan_ip` FROM `conn_meta` WHERE (`time` between ? AND ?) GROUP BY `lan_zone`,`lan_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'remote_ip_conn_meta':
					new query({query: 'SELECT `remote_ip` FROM `conn_meta` WHERE (`time` between ? AND ?) GROUP BY `remote_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'remote_country_conn_meta':
					new query({query: 'SELECT `remote_country` FROM `conn_meta` WHERE (`time` between ? AND ?) GROUP BY `remote_country`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				///
				case 'bandwidth_in':
					new query({query: 'SELECT ROUND(((sum(`in_bytes`) / 1048576) / (? - ?)) * 8000,2) AS `bandwidth` FROM `conn_local` WHERE `time` BETWEEN ? AND ?', insert: [end, start, start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data);
						}
					});
					break;
				case 'bandwidth_out':
					new query({query: 'SELECT ROUND(((sum(`out_bytes`) / 1048576) / (? - ?)) * 8000,2) AS `bandwidth` FROM `conn_local` WHERE `time` BETWEEN ? AND ?', insert: [end, start, start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data);
						}
					});
					break;
				case 'new_ip':
					new query({query: 'SELECT `remote_ip` FROM `conn_uniq_remote_ip` WHERE (`time` between ? AND ?) GROUP BY `remote_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'new_dns':
					new query({query: 'SELECT `query` FROM `dns_uniq_query` WHERE (`time` between ? AND ?) GROUP BY `query`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'new_http':
					new query({query: 'SELECT `host` FROM `http_uniq_host` WHERE (`time` between ? AND ?) GROUP BY `host`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'new_ssl':
					new query({query: 'SELECT `remote_ip` FROM `ssl_uniq_remote_ip` WHERE (`time` between ? AND ?) GROUP BY `remote_ip`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				case 'new_layer7':
					new query({query: 'SELECT `l7_proto` FROM `conn_l7_proto` WHERE (`time` between ? AND ?) GROUP BY `l7_proto`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
						if (data) {
							res.json(data.length);
						}
					});
					break;
				default:
					var table1 = {
						query: 'SELECT '+
								'count(*) AS count,'+
								'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+
								'ioc,'+
								'ioc_severity,'+
								'ioc_typeIndicator,'+
								'remote_ip,'+
								'remote_country,'+
								'remote_cc,'+
								'sum(`in_bytes`) AS icon_in_bytes,'+
								'sum(`out_bytes`) AS icon_out_bytes '+
							'FROM '+
								'`conn_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `ioc_count` > 0 '+
								'AND `trash` IS NULL '+
							'GROUP BY '+
								'`ioc_typeIndicator`,'+
								'`remote_ip`,'+
								'`ioc` '+
							'ORDER BY '+
								'ioc_severity DESC,'+
								'count DESC '+
							'LIMIT 10',
						insert: [start, end],
						params: [
							{ title: 'Last Seen', select: 'time' },
							{ title: 'Severity', select: 'ioc_severity' },
							{ title: 'IOC Hits', select: 'count' },
							{ title: 'IOC', select: 'ioc' },
							{ title: 'IOC Type', select: 'ioc_typeIndicator' },
							{ title: 'Remote IP', select: 'remote_ip' },
							{ title: 'Remote Country', select: 'remote_country' },
							{ title: 'Flag', select: 'remote_cc' },
							{ title: 'Traffic In/Out', select: 'icon_in_bytes' }
						],
						settings: {
							sort: [[ 1, "desc" ],[ 2, "desc" ]],
							div: 'table',
							title: 'Top 10 Highest Severity IOC Notifications',
							pagebreakBefore: false
						}
					}
					var table2SQL = {
						query: 'SELECT '+
								'count(*) AS count,'+
								'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) AS time,'+
								'ioc,'+
								'ioc_severity,'+
								'ioc_typeIndicator,'+
								'lan_zone,'+
								'machine,'+
								'lan_ip,'+
								'sum(`in_bytes`) AS icon_in_bytes,'+
								'sum(`out_bytes`) AS icon_out_bytes '+
							'FROM '+
								'`conn_ioc` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `ioc_count` > 0 '+
								'AND `trash` IS NULL '+
							'GROUP BY '+
								'`ioc_typeIndicator`,'+
								'`lan_zone`,'+
								'`lan_ip`,'+
								'`ioc` '+
							'ORDER BY '+
								'ioc_severity DESC,'+
								'count DESC',
						insert: [start, end],
						params: [
							{ title: 'Last Seen', select: 'time' },
							{ title: 'Severity', select: 'ioc_severity' },
							{ title: 'IOC Hits', select: 'count' },
							{ title: 'IOC', select: 'ioc' },
							{ title: 'IOC Type', select: 'ioc_typeIndicator' },
							{ title: 'Zone', select: 'lan_zone' },
							{ title: 'Machine Name', select: 'machine' },
							{ title: 'Local IP', select: 'lan_ip' },
							{ title: 'Traffic In/Out', select: 'icon_in_bytes' }
						],
						settings: {
							sort: [[ 1, "desc" ],[ 2, "desc" ]],
							div: 'table2',
							title: 'Local End Point IP Addresses Triggering IOC Notifications',
							pagebreakBefore: true
						}
					}
					var table3SQL = {
						query: 'SELECT '+
								'count(*) AS count,'+
								'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+
								'`l7_proto`,'+
								'`l7_proto` AS `l7_description`, '+
								'(sum(`in_bytes`) / 1048576) AS `in_bytes`,'+
								'(sum(`out_bytes`) / 1048576) AS `out_bytes` '+
							'FROM '+
								'`conn_l7_meta` '+
							'WHERE '+
								'`time` BETWEEN ? AND ? '+
								'AND `l7_proto` !=\'-\' '+
							'GROUP BY '+
								'`l7_proto` '+
							'ORDER BY '+
								'out_bytes DESC',
						insert: [start, end],
						params: [
							{ title: 'Last Seen', select: 'time' },
							{ title: 'Connections', select: 'count' },
							{ title: 'Application', select: 'l7_proto' },
							{ title: ' ', select: 'l7_description' },
							{ title: 'MB to Remote', select: 'in_bytes' },
							{ title: 'MB from Remote', select: 'out_bytes' }
						],
						settings: {
							sort: [[ 3, "desc" ],[ 4, "desc" ]],
							div: 'table3',
							title: 'Application Bandwidth',
							pagebreakBefore: true
						}
					}
					var crossfilterQ = {
						query: 'SELECT '+
								'count(*) AS count,'+
								'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
								'`remote_country`,'+
								'`ioc`,'+
								'`ioc_severity` '+
							'FROM '+
								'`conn_ioc` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `ioc_count` > 0 '+
								'AND `trash` IS NULL '+
							'GROUP BY '+
								'month(from_unixtime(`time`)),'+
								'day(from_unixtime(`time`)),'+
								'hour(from_unixtime(`time`)),'+
								'`remote_country`,'+
								'`ioc`,'+
								'`ioc_severity`',
						insert: [start, end]
					}
					var glossarySQL = {
						query: 'SELECT '+
								'count(*) AS `count`,'+
								'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS `time`,'+
								'`remote_country`,'+
								'`ioc`,'+
								'`ioc_severity` '+
							'FROM '+
								'`conn_ioc` '+
							'WHERE '+
								'time BETWEEN ? AND ? '+
								'AND `ioc_count` > 0 '+
								'AND `trash` IS NULL '+
							'GROUP BY '+
								'month(from_unixtime(`time`)),'+
								'day(from_unixtime(`time`)),'+
								'hour(from_unixtime(`time`)),'+
								'`remote_country`,'+
								'`ioc`,'+
								'`ioc_severity`',
						insert: [start, end]
					}
					async.parallel([
						// Table function(s)
						function(callback) {
							new dataTable(table1, {database: database, pool: pool}, function(err,data){
								tables[2] = data;
								callback();
							});
						},
						function(callback) {
							new dataTable(table2SQL, {database: database, pool: pool}, function(err,data){
								tables[1] = data;
								callback();
							});
						},
						function(callback) {
							new dataTable(table3SQL, {database: database, pool: pool}, function(err,data){
								tables[0] = data;
								callback();
							});
						},
						// Crossfilter function
						function(callback) {
							new query(crossfilterQ, {database: database, pool: pool}, function(err,data){
								crossfilter = data;
								callback();
							});
						}
					], function(err) { //This function gets called after the two tasks have called their "task callbacks"
						if (err) throw console.log(err);
						var results = {
							info: info,
							tables: tables,
							crossfilter: crossfilter
						};
						res.json(results);
					});
				break;
			}
		}
	}
};