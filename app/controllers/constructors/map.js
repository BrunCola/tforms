'use strict';

var config = require('../../../config/config'),
	mysql = require('mysql');

module.exports = function (sql, database, callback) {
	config.db.database = database;
	var connection = mysql.createConnection(config.db);

	this.sql = sql;
	var result = [];
	var mapData = [];
	var lastResult = {};
	var index = -1;
	var mapData = {
		"type": "FeatureCollection",
		"features": []
	};
	connection.query(this.sql)
		.on('result', function(data){
			if ((data.time === lastResult.time) && (data.remote_long === lastResult.remote_long) && (data.remote_lat === lastResult.remote_lat)) {
				result[index].count++;
				if (data.ioc_severity > result[index].ioc_severity) {
					result[index].ioc_severity = data.ioc_severity;
				}
			} else {
				data.count = 1;
				result.push(data);
				index++;
			}
			lastResult = data;
		})
		.on('end', function(){
			result.forEach(function(d){
				if (d.remote_country !== '-') {
					mapData.features.push({
						"type":"Feature",
						"properties":{
							"date_filed":d.time,
							"severity":d.ioc_severity,
							// "units":d.ioc_count,
							"units": d.ioc_count,
							"count": d.count,
							// "units":d.ioc_count*10,
							"country":d.remote_country
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
			// console.log(result);
			callback(null, mapData);
			connection.destroy();
		})
};