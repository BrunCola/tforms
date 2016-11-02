'use strict';
let config = require('../config/config'),
bcrypt = require('bcrypt'),
jwt = require('jsonwebtoken');

module.exports = function(readPool, writePool) {
    return {
        login: function(req, res) {
            var database = "tform";
            var loginQuery = {
                query: "SELECT * FROM user WHERE email = ? limit 1",
                insert: [req.body.email]
            }

            readPool.getConnection(function(err, connection) {
                connection.changeUser({database : database}, function(err) {
                    if (err) throw err;
                });
                connection.query(loginQuery.query, loginQuery.insert, function(err, data) {
                    connection.release();
                    if (err) { res.status(500).end(); return }
                    if (data.length !== 1) { res.send(401, 'Wrong user or password'); return; }
                    var profile = data[0];
                    bcrypt.compare(String(req.body.passord), profile.password, function(err, doesMatch, x){
                        if (doesMatch){
                            var token = jwt.sign(profile, config.sessionSecret, { });
                            res.json({ token: token, user: profile }).end();
                            return; 
                        } else {
                            res.send(401, 'Wrong user or password');
                            return;
                        }
                    });
                });
            });

        }
    }
}
