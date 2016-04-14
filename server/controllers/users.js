'use strict';

var config = require('../config/config'),
    bcrypt = require('bcrypt'),
    jwt = jwt = require('jsonwebtoken'),
    query = require('../controllers/constructors/query');


module.exports = function(pool) {
    return {
        login: function(req, res) {
             var loginQuery = {
                query: "SELECT * FROM user WHERE email = ? limit 1",
                insert: [req.body.email]
            }
            new query(loginQuery, {database: config.db.database, pool: pool}, function(err, data){
                if (data.length !== 1) { res.send(401, 'Wrong user or password'); return; }
                var profile = data[0];
                bcrypt.compare(req.body.password, profile.password, function(err, doesMatch){
                    // if (doesMatch){
                        var token = jwt.sign(profile, config.sessionSecret, { expiresInMinutes: 60*5 });
                        res.json({ token: token, user: profile });
                        return;
                    // } else {
                        // res.send(401, 'Wrong user or password');
                        // return;
                    // }
                });
            });
        },
        loggedin: function(req, res) {
            if (req.user) {
                res.send(200, {
                    user: req.user
                })
            } else {
                console.log('NOT LOGGED IN')
                res.send(401)
            }
        }
    }
};