'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert, function(err, result) {
			if (err) {
				callback(err, null);
				connection.release();
			} else {
				callback(null, result);
				connection.release();
			}
		});
	});
};