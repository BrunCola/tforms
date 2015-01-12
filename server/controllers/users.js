'use strict';

var config = require('../config/config'),
    bcrypt = require('bcrypt'),
    jwt = jwt = require('jsonwebtoken'),
    jsSHA = require('jssha');

module.exports = function(pool) {
    return {
        login: function(req, res) {
            //One time password generator for 2 step authentication
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
            pool.query("SELECT * FROM user WHERE email = ? limit 1", [req.body.email], function(err, data){
                var ts = Math.round((new Date()).getTime() / 1000);
                console.log('Email/login: '+data[0].email+', Database:'+data[0].database+', Time: '+ts)
                if (data.length !== 1) { res.send(401, 'Wrong user or password'); return; }
                var profile = data[0];
                bcrypt.compare(req.body.password, profile.password, function(err, doesMatch){
                    console.log(profile)
                    if (doesMatch){
                        //check if the user has opted to use two step authentication
                        if (profile.two_step_auth) {
                            if(req.body.twoStepCode) {//if they have entered a code
                                var totpObj = new TOTP();//generate the current code
                                var otp = totpObj.getOTP("K6JVY3EDAOP57CX2");
                                if(otp == req.body.twoStepCode) {
                                    //authorize
                                    var token = jwt.sign(profile, config.sessionSecret, { expiresInMinutes: 60*5 });
                                    res.json({ token: token });
                                    return;
                                } else {
                                    res.send(401, 'Wrong two-step authentication code');
                                    return;
                                }
                            } else {
                                res.send(401, 'Two-step authentication code required');
                                return;
                            }
                        } else {
                            var token = jwt.sign(profile, config.sessionSecret, { expiresInMinutes: 60*5 });
                            res.json({ token: token });
                            return;
                        }
                    } else {
                        res.send(401, 'Wrong user or password');
                        return;
                    }


                    // if (doesMatch){
                    //     if (profile.two_step_auth) {
                    //         // send flag to render 
                    //     } else {

                    //     }
                    // } else {
                    //     res.send(401, 'Wrong user or password').end();
                    //     return;
                    // }
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