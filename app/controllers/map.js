'use strict';

var query = require('./constructors/query'),
config = require('../../config/config'),
async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	// var database = null;
	var startTime = new Date().getTime()-1800000; // 30 minutes
	var endTime = new Date().getTime()-1500000; // 25 minutes
	var start = Math.round(startTime / 1000);
	var end = Math.round(endTime / 1000);
	console.log(start);
	console.log(end);
	var queryResult;
	var mapData = {
		"type": "FeatureCollection",
		"features": []
	};
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
		new query(mapSQL, database, function(err,data){
			console.log(data.length);
			queryResult = data;
			callback();
		});
	}], function(err) { //This function gets called after the two tasks have called their "task callbacks"
	if (err) throw console.log(err);
		queryResult.forEach(function(d){
			if (d.remote_country !== '-') {
				mapData.features.push({
					"type":"Feature",
					"properties":{
						"date_filed":d.time,
						"severity":d.ioc_severity,
						"units":10,
						// "units":d.ioc_count*10,
						"address_1":"2019 Lake Street"
					},
					"geometry":{
						"type":"Point",
						"coordinates":[
							d.remote_long,
							d.remote_lat
						]
					}
				});
			}
		});
		var results = {
			map: mapData
		};
		//console.log(results);
		res.jsonp(results);
	});

};