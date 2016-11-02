'use strict';

module.exports = function(readPool, writePool) {
    var database = "tform";
    return {
        client_info: function(req, res) {
            var sql = {
                query: 'SELECT '+
                        '* '+
                    'FROM '+
                        '`session` '+
                    'WHERE '+
                        '`client_id` = ?',
                insert: [req.query.id]
            }

            readPool.getConnection(function(err, connection) {
                connection.changeUser({database : database}, function(err) {
                    if (err) throw err;
                });
                connection.query(sql.query, sql.insert, function(err, data) {
                    connection.release();
                    if (err) { res.status(500).end(); return }
                    res.json(data);
                });
            });
        },
        save_session: function(req, res) {
            let values = "";
            for (let r in req.body) {
                if (r != "client_id") values += r+' = "'+req.body[r]+'",';
            }
            values = values.slice(0, -1);

            var session_query = {
                query: 'UPDATE session SET '+values+' WHERE client_id = ?',
                insert: [Number(req.body.client_id)]
            }

            writePool.getConnection(function(err, connection) {
                connection.changeUser({database : database}, function(err) {
                    if (err) throw err;
                });
                connection.query(session_query.query, session_query.insert, function(err, data) {
                    connection.release();
                    if (err) { console.log(err);res.status(500).end(); return }
                    res.json({}).end();
                    return;
                });
            });

        }
    }
}
