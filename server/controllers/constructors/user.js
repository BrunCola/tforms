'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
    conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            if (err) throw err;
        });
        connection.query(sql.query, sql.insert, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                for (var r in result) {
                    delete result[r].database;
                }
                var passed = null;
                if (sql.passed !== undefined) { passed = sql.passed; }
                callback(null, result, passed);
            }
        });
    });
};