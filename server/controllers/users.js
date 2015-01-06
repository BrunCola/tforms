'use strict';

var config = require('../config/config'),
    bcrypt = require('bcrypt'),
    jwt = jwt = require('jsonwebtoken');

module.exports = function(pool) {
    return {
        login: function(req, res) {
            pool.query("SELECT * FROM user WHERE email = ? limit 1", [req.body.email], function(err, data){
                var ts = Math.round((new Date()).getTime() / 1000);
                console.log("TEST");
                console.log('Email/login: '+data[0].email+', Database:'+data[0].database+', Time: '+ts)
                if (data.length !== 1) { res.send(401, 'Wrong user or password'); return; }
                var profile = data[0];
                bcrypt.compare(req.body.password, profile.password, function(err, doesMatch){
                    if (doesMatch){
                        var token = jwt.sign(profile, config.sessionSecret, { expiresInMinutes: 60*5 });
                        res.json({ token: token });
                        return;
                    } else {
                        res.send(401, 'Wrong user or password');
                        return;
                    }
                });
            });
        },
        loggedin: function(req, res) {
            // console.log(req.user);
            // console.log('LIMIT THIS RETURN')
            if (req.user) {
                res.send(200, req.user)
            } else {
                console.log('NOT LOGGED IN')
                res.send(401)
            }
        }
    }
};