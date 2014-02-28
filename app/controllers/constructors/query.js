'use strict';

var config = require('../../../config/config'),
	mysql = require('mysql');


module.exports = function (sql, database, callback) {
	// config.db.database = database;
	var connection = mysql.createConnection(config.db);

	this.sql = sql;
	connection.query(this.sql, function(err, result) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, result);
		}
	});
};