'use strict';

var config = require('../config/config'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    jsSHA = require('jssha'),
    speakeasy = require('speakeasy'),
    query = require('./constructors/query');

// we put our 2factor function outside our module exports so it can be sued by multiple controllers
var TOTP = function() {
    var dec2hex = function(s) {
        return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
    };
    var hex2dec = function(s) {
        return parseInt(s, 16);
    };
    var leftpad = function(s, l, p) {
        if(l + 1 >= s.length) {
            s = Array(l + 1 - s.length).join(p) + s;
        }
        return s;
    };
    var base32tohex = function(base32) {
        var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var bits = "";
        var hex = "";
        for(var i = 0; i < base32.length; i++) {
            var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            bits += leftpad(val.toString(2), 5, '0');
        }
        for(var i = 0; i + 4 <= bits.length; i+=4) {
            var chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16) ;
        }
        return hex;
    };
    this.getOTP = function(secret) {
        try {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0");
            var hmacObj = new jsSHA(time, "HEX");
            var hmac = hmacObj.getHMAC(base32tohex(secret), "HEX", "SHA-1", "HEX");
            var offset = hex2dec(hmac.substring(hmac.length - 1));
            var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
            otp = (otp).substr(otp.length - 6, 6);
        } catch (error) {
            throw error;
        }
        return otp;
    };
}

module.exports = function(pool) {
    return {
        login: function(req, res) {
            pool.query("SELECT * FROM user WHERE email = ? limit 1", [req.body.email], function(err, data){
                if (data.length !== 1) { res.status(401).send('Wrong user or password').end(); return; }
                var profile = data[0];
                bcrypt.compare(req.body.password, profile.password, function(err, doesMatch){
                    if (doesMatch){
                        // check if the user has opted to use two step authentication
                        // if user has opted in, send a 2auth token and flag to redirect to different page
                        if (profile.two_step_auth) {
                            var token = jwt.sign(profile, config.twoAuthSecret, { expiresInMinutes: 10 });
                            res.json({ token: token, twoAuth: true }).end();
                            return;
                        } else {
                            // if not acivated, create potential 2auth phrase on login
                            // NOTE: we're using a different library to generate keys vs checking them for obvious reasons
                            profile.twoAuthHash = speakeasy.generate_key({length: 20}).base32;
                            // assign to our profile value
                            var ts = Math.round((new Date()).getTime() / 1000);
                            console.log('Email/login: '+profile.email+', Database: '+profile.database+', Time: '+ts);
                            var token = jwt.sign(profile, config.sessionSecret, { expiresInMinutes: 60*10 });
                            res.json({ token: token, twoAuth: false }).end();
                            return;
                        }
                    } else {
                        res.status(401).send('Wrong user or password').end();
                        return;
                    }
                });
            });
        },
        twoStep: function(req, res) {
            //One time password generator for 2 step authentication
            if (req.body.twoStepCode && req.user) { //if they have entered a code
                var totpObj = new TOTP(); //generate the current code
                var otp = totpObj.getOTP(req.user.access_id);
                if (otp == req.body.twoStepCode) {
                    // authorize
                    var ts = Math.round((new Date()).getTime() / 1000);
                    console.log('Email/login: '+req.user.email+', Database: '+req.user.database+', Time: '+ts);
                    var token = jwt.sign(req.user, config.sessionSecret, { expiresInMinutes: (60*24*7) });
                    res.json({ token: token });
                    return;
                } else {
                    res.status(401).send('Wrong 2-factor authentication code.').end();
                    return;
                }
            } else {
                res.status(401).send('Wrong 2-factor authentication code.').end();
                return;
            }
        },
        loggedin: function(req, res) {
            // console.log('LIMIT THIS RETURN')
            if (req.user) {
                res.status(200).json(req.user);
                return;
            } else {
                console.log('NOT LOGGED IN')
                res.status(401).end();
                return;
            }
        },
        updatePassword: function(req, res) {
            // make sure new password in body, and it is the authorized user making the request
            if (req.body.newPass && (req.body.email === req.user.email)) {
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.newPass, salt, function(err, hash) {
                        var update = {
                            query: "UPDATE `user` SET `password`= ? WHERE `email` = ?",
                            insert: [hash, req.user.email]
                        }
                        new query(update, {database: 'rp_users', pool: pool}, function(err,data){
                            if (err) { res.status(500).end(); return; } 
                            res.status(200).end();
                            return;
                        });
                    });
                });
            } else {
                // not authorized to make any requests
                res.status(401).end();
                return;
            }
        },
        updateEmail: function(req, res) {
            if (req.body.newEmail && (req.body.email === req.user.email)) {
                var update = {
                    query: "UPDATE `user` SET `email`= ? WHERE `email` = ?",
                    insert: [req.body.newEmail, req.user.email]
                }
                new query(update, {database: 'rp_users', pool: pool}, function(err,data){
                    if (err) { res.status(500).end(); return; }
                    res.status(200).end();
                    return;
                });
            } else {
                // not authorized to make any requests
                res.status(401).end();
                return;
            }
        },
        enableTwoFactor: function(req, res) {
            if (req.body.passcode && (req.body.email === req.user.email)) {
                var totpObj = new TOTP(); //generate the current code
                var otp = totpObj.getOTP(req.user.twoAuthHash);
                if (otp == req.body.passcode) {
                    // 2factor enable was a success, update the user table
                    var update = {
                        query: "UPDATE `user` SET `access_id`= ?, `two_step_auth`= 1 WHERE `email` = ?",
                        insert: [req.user.twoAuthHash, req.user.email]
                    }
                    new query(update, {database: 'rp_users', pool: pool}, function(err,data){
                        if (err) { res.status(500).end(); return; }
                        res.status(200).end();
                        return;
                    });
                } else {
                    res.status(401).send('Wrong 2-factor authentication code.').end();
                    return;
                }
            } else {
                // must be a mistake with the request
                res.status(401).end();
                return;
            }
        },
        disableTwoFactor: function(req, res) {
            if (req.body.email === req.user.email) {
                var update = {
                    query: "UPDATE `user` SET `access_id`= 0, `two_step_auth`= 0 WHERE `email` = ?",
                    insert: [req.user.email]
                }
                new query(update, {database: 'rp_users', pool: pool}, function(err,data){
                    if (err) { res.status(500).end(); return; }
                    res.status(200).end();
                    return;
                });
            } else {
                // must be a mistake with the request
                res.status(401).end();
                return;
            }
        }
    }
};