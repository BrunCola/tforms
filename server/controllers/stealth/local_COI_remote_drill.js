'use strict';

var sankey = require('../constructors/sankey'),
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
			if (req.query.lan_ip) {
				var sankeyData;
				var crossfilter = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
							'count(*) AS `count`, '+
							'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
							'conn.remote_ip, '+
							'stealth_ips.lan_ip, '+
							'stealth_ips.stealth_groups, '+
							'stealth_ips.user '+
						'FROM '+
							'`stealth_ips` '+
						'LEFT JOIN `conn` '+
						'ON ' +
							'conn.lan_ip = stealth_ips.lan_ip ' +
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND stealth_ips.stealth > 0 '+
							'AND stealth_ips.lan_ip = ? '+
						'GROUP BY stealth_ips.lan_ip, '+
						'conn.remote_ip '+
						'ORDER BY `count` DESC '+
						'LIMIT 10',
					insert: [start, end, req.query.lan_ip]
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new sankey(table1, {database: database, pool: pool}, function(err,data){
							sankeyData = data;
							callback();
						});
					}
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
					var results = {
						info: info,
						sankey: sankeyData,
					};
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};