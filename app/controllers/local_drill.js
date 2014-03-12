'use strict';

var swimchart = require('./constructors/swimchart'),
	query = require('./constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	var swim = [];
	var swimChartSQL = 'SELECT '+
			// SELECTS
			'time,'+ // Last Seen
			'`lan_ip` '+
			// !SELECTS
		'FROM `conn_ioc` '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end+'';
			// 'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), minute(from_unixtime(time))';
	var swim1Class = 'http_ioc'

	async.parallel([
		// Table function(s)
		function(callback) {
			new swimchart(swimChartSQL, database, swim1Class, function(err,data){
				swim = data;
				callback();
			});
		}
	], function(err) { //This function gets called after the two tasks have called their "task callbacks"
		if (err) throw console.log(err);
		var results = {
			swimchart: swim
		};
		//console.log(results);
		res.jsonp(results);
	});
};