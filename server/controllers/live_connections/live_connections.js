'use strict';

var map = require('../constructors/map'),
	config = require('../../config/config'),
	async = require('async'),
	moment = require('moment');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			var start = moment().subtract('minutes', 8).unix();
			var end = moment().subtract('minutes', 7).unix();
			var queryResult;
			var mapSQL = {
				query: 'SELECT '+
						'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
						'`remote_country`,'+
						'`remote_cc`,'+
						'`ioc_severity`,'+
						'`ioc`,'+
						'`remote_long`,'+
						'`l7_proto`,'+
						'`remote_lat`,'+
						'`ioc_count`,'+
						'`remote_ip`,'+
						'`lan_ip` '+
					'FROM '+
						'conn '+
					'WHERE '+
						'time BETWEEN ? AND ?',
				insert: [start, end]
			}
			async.parallel([
			function(callback) {
				new map(mapSQL, {database: database, pool: pool}, function(err,data){
					// console.log(data);
					queryResult = data;
					callback();
				});
			}], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
				var results = {
					map: queryResult,
					start: start*1000,
					end: end*1000
				};
				res.json(results);
			});
		}
	}
};
