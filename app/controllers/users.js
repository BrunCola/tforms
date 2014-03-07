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

exports.changepass = function(req, res) {
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