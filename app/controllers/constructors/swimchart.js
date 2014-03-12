'use strict';

var config = require('../../../config/config'),
	mysql = require('mysql');

module.exports = function (sql, database, sClass, callback) {
	config.db.database = database;
	var connection = mysql.createConnection(config.db);

	this.sql = sql;
	// connection.query(this.sql, function(err, result) {
	// 	if (err) {
	// 		callback(err, null);
	// 		connection.destroy();
	// 	} else {
	// 		callback(null, result);
	// 		connection.destroy();
	// 	}
	// });
	var dat = [];
	var count = 0;
	connection.query(this.sql)
		.on('result', function(data){
			data.class = sClass;
			data.id = count++;
			data.start = data.time;
			data.end = '';
			console.log(data);
			dat.push(data);
		})
		.on('end', function(){
			callback(null, dat)
			connection.destroy();
			console.log('DONE');
		})
		//group by type and push a main and sub-group for each time slice
};