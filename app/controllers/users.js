'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../config/config'),
    mysql = require('mysql'),
    crypto = require('crypto');

var connection = mysql.createConnection(config.db);

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

exports.changepass = function(req, res) {
    res.render('users/changepass', {
        title: 'Change Password'
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    console.log(req.user);
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res) {
    var message;
    //add crypto
    //console.log(req.connection);
    var sql = 'SELECT * FROM user WHERE username ="'+req.body.username+'" OR email ="'+req.body.email+'"';
    connection.query(sql,
        function(err,result){
            if (err) {
                message = 'Please fill all the required fields';
                return res.render('users/signup', {
                    message: message,
                    user: req.body
                });
            }
            if (result.length === 0) {
                var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
                connection.query('INSERT INTO user (name, username, password, email) VALUES (\''+req.body.name+'\', \''+req.body.username+'\', \''+hash+'\', \''+req.body.email+'\')', req.body,
                    function () {
                        res.render('users/signin', {
                            title: 'Signin',
                            message: 'User create success'
                        });
                    }
                );
            } else if (result.length > 0){
                //message = 'Username or email already exists';
                message = 'Username or email already exists';
                return res.render('users/signup', {
                    message: message,
                    user: req.body
                });
            }
        }
    );
};

exports.change = function(req, res) {
    var message;
    //add crypto
    //console.log(req.connection);
    var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
    var sql="SELECT * FROM user WHERE username = '"+req.body.username+"' and password = '"+hash+"' limit 1";
    connection.query(sql,
        function(err,result){
            if (err) {
                message = 'Unable to verify user';
                return res.render('users/changepass', {
                    message: message,
                    user: req.body
                });
            }
            if (result.length === 1) {
                var newpass1 = crypto.createHash('md5').update(req.body.newpassword1).digest('hex');
                var newpass2 = crypto.createHash('md5').update(req.body.newpassword2).digest('hex');
                if ((newpass1 === newpass2) && (req.body.newpassword1.length > 6)) {
                        connection.query("UPDATE `user` SET `password`='"+newpass1+"' WHERE `username`='"+req.body.username+"' AND `password`='"+hash+"'", req.body,
                        function () {
                            res.render('users/signin', {
                                title: 'Signin',
                                message: 'Password change success'
                            });
                        }
                    );
                } else {
                    res.render('users/changepass', {
                        title: 'Signin',
                        message: 'New passwords don\'t match or are shorter than 6 characters'
                    });
                }
            } else {
                //message = 'Username or email already exists';
                message = 'Unable to verify user';
                return res.render('users/changepass', {
                    message: message,
                    user: req.body
                });
            }
        }
    );
};


/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            console.log(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};