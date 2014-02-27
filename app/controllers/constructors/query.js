'use strict';

var config = require('../../../config/config'),
	mysql = require('mysql');

var connection = mysql.createConnection(config.db);

module.exports = function (sql, callback) {
	this.sql = sql;
	connection.query(this.sql, function(err, result) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, result);
		}
	});
};