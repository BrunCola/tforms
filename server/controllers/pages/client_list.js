'use strict';

module.exports = function(readPool, writePool) {
    return {
        client_list: function(req, res) {
            var database = "tform";

            var sql = {
                query: 'SELECT '+
                        '* '+
                    'FROM '+
                        '`client` ',
                insert: []
            }

            readPool.getConnection(function(err, connection) {
                connection.changeUser({database : database}, function(err) {
                    if (err) throw err;
                });
                connection.query(sql.query, sql.insert, function(err, data) {
                    connection.release();
                    if (err) { res.status(500).end(); return }
                    // console.log(data);
                    res.json(data);
                });
            });
        }
    }
}
