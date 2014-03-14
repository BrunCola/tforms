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
			'WHERE `lan_ip`=\''+req.query.lan_ip+'\' ';

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
			var results = {
				crossfilter: crossfilter
			};
			res.jsonp(results);
		});
	} else {
		res.redirect('/');
	}
};
