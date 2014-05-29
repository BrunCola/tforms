'use strict';

var map = require('../constructors/map'),
	config = require('../../config/config'),
	async = require('async'),
	moment = require('moment');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	// var database = null;
	// remember 1200ms is one minute
	// var startTime = new Date().getTime()-1260000; // 21 minutes
	// var endTime = new Date().getTime()-1200000; // 20 minutes	

	// var start = moment().subtract('minutes', 21).unix();
	// var end = moment().subtract('minutes', 20).unix();	


	var start = moment().subtract('minutes', 81).unix();
	var end = moment().subtract('minutes', 80).unix();

	console.log('start: '+ start)
	console.log('end: '+ end)

	var queryResult;
	var mapSQL = 'SELECT '+
			// 'count(*) as count, '+
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'`remote_country`,'+
			'`ioc_severity`,'+
			'`ioc`,'+
			'`remote_long`,'+
			'`remote_lat`,'+
			'`ioc_count` '+
			// !SELECTS
		'FROM conn '+
			'WHERE '+
			'time BETWEEN '+start+' AND '+end;
			// 'AND `ioc_count` > 0 '+
			// 'AND `trash` IS NULL';

	async.parallel([
	function(callback) {
		new map(mapSQL, database, function(err,data){
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
		//console.log(results);
		res.json(results);
	});
};