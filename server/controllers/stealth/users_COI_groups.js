'use strict';

var force_stealth = require('../constructors/force_stealth'),
config = require('../../config/config'),
async = require('async');

var permissions = [3];

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
			if (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1) {
				var forceReturn = [];
				var info = [];
				var forceSQL = {
					query: 'SELECT '+
								'endpoint_tracking.lan_ip, '+
								'endpoint_tracking.stealth, '+
								'endpoint_tracking.stealth_COIs, '+
								'endpoint_tracking.user, '+
								'endpoint_tracking.gateway '+
							'FROM '+
								'`endpoint_tracking` '+
							'WHERE '+
								'endpoint_tracking.stealth > 0',
					insert: []
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new force_stealth(forceSQL, {database: database, pool: pool}, function(err,data){
							forceReturn = data;
							callback();
						});
					},
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err);
					var results = {
						info: info,
						force: forceReturn
					};
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};