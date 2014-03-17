'use strict';

var dataTable = require('./constructors/datatable'),
	query = require('./constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	// var database = null;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	switch (req.query.type) {
		case 'ioc_notifications':
		// Info function(s) --- IOC
			new query('SELECT count(*) as count FROM conn_ioc WHERE (time between '+start+' AND '+end+') AND ioc_count > 0 AND trash IS NULL', database, function(err,data){
				if (data) {
					res.json(data);
				}
			});
			break;
		default:
			if (req.query.lan_ip) {
				//var results = [];
				var crossfilter = [];
				var crossfilterSQL = 'SELECT '+
					// SELECTS
					'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
					//'from_unixtime(time) as time, '+
					'`ioc_severity`, '+
					'`dns`, '+
					'`http`, '+
					'`ssl`, '+
					'`file`, '+
					'`remote_ip`, '+
					'`remote_cc`, '+
					'`remote_country`, '+
					'`ioc` '+
					// !SELECTS
					'FROM conn_ioc '+
					'WHERE time BETWEEN '+start+' AND '+end+' '+
					'and `lan_ip`=\''+req.query.lan_ip+'\' ';

				async.parallel([
					// Crossfilter function
					function(callback) {
						new query(crossfilterSQL, database, function(err,data){
							crossfilter = data;
							callback();
						});
					}
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err);
					var arr = []; var count;
					crossfilter.forEach(function(d){
						// Push a total connections object so we can count all that have no values associated
						// push records with values 
						//if (d.dns > 0) {
							arr.push({
								'type': 'DNS',
								'count': d.dns,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
						//}
						//if (d.http > 0) {
							arr.push({
								'type': 'HTTP',
								'count': d.http,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
						//}
						//if (d.ssl > 0) {
							arr.push({
								'type': 'SSL',
								'count': d.ssl,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
						//}
						//if (d.file > 0) {
							arr.push({
								'type': 'File',
								'count': d.file,
								'time': d.time,
								'remote_ip': d.remote_ip,
								'remote_cc': d.remote_cc,
								'remote_country': d.remote_country,
								'ioc': d.ioc
							})
					//	}
						arr.push({
							'type': 'Total Connections',
							'count': 1,
							'time': d.time,
							'remote_ip': d.remote_ip,
							'remote_cc': d.remote_cc,
							'remote_country': d.remote_country,
							'ioc': d.ioc
						})
					});
					console.log(arr);
					// console.log(crossfilter);
					var results = {
						crossfilter: arr
					};
					res.jsonp(results);
				});
			} else {
				res.redirect('/');
			}
		break;
	}
};