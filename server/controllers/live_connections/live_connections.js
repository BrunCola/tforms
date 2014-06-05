'use strict';

var map = require('../constructors/map'),
	config = require('../../config/config'),
	async = require('async'),
	moment = require('moment');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	var start = moment().subtract('minutes', 10).unix();
	var end = moment().subtract('minutes', 9).unix();
	var queryResult;
	var mapSQL = 'SELECT '+
			'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
			'`remote_country`,'+
			'`ioc_severity`,'+
			'`ioc`,'+
			'`remote_long`,'+
			'`remote_lat`,'+
			'`ioc_count` '+
		'FROM '+
			'conn '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end;
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
		res.json(results);
	});
};