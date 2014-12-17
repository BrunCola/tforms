'use strict';

var fs = require('fs'),
    config = require('../../config/config'),
    query = require('../constructors/query'),
    bcrypt = require('bcrypt'),
    async = require('async');

var permissions = [3];

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = "rp_users";
            // var database = req.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }

            if (req.query.type === 'editUser') {
                if (req.user.level > 1) {
                    new query({query: 'SELECT * FROM `user` WHERE `email` = ? ', insert: [req.query.userEmail]}, {database: database, pool: pool}, function(err,data){
                        if (data) {
                            console.log(data)
                            res.json(data);
                        }
                    });  
                }
            } else {
                var allUsers = false;    
                if (req.user.level > 1) {
                    var list_users = {
                        query: 'SELECT '+
                                    '`email`, '+
                                    '`database`, '+
                                    '`level` '+
                                'FROM '+
                                    '`user` '+
                                'WHERE '+
                                    '`level` <= ?',
                        insert: [req.user.level]
                    }
                }
                async.parallel([
                    // Table function(s)                
                    function(callback) {
                        if (req.user.level > 1) {
                            new query(list_users, {database: database, pool: pool}, function(err,data){
                                allUsers = data;
                                callback();
                            });
                        } else {
                            callback();
                        }                    
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    var results = { 
                        users: allUsers,
                    };
                    res.json(results);
                });
            }           
        },
        insert: function(req, res) {
            var database = "rp_users";
            if (req.query.type === 'createNewUser') {
                var d = new Date()
                var date = d.getFullYear() + "-" + (d.getMonth()+1) + "-" +d.getDate();
                if (req.user.level > 1 ) {     
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            var create_user = {
                                query: "INSERT INTO `user` (`email`,  `username`, `password`, `database`, `joined`, `level`) VALUES (?,?,?,?,?,?)",
                                insert: [req.body.email, req.body.username, hash, req.body.db, date, req.body.level]
                            }
                            new query(create_user, {database: database, pool: pool}, function(err,data){
                                if (err) {
                                    res.status(500).end();
                                    return;
                                } 
                                res.status(200).end();
                            });
                        });
                    });
                }
            } else if (req.query.type === 'submitEditUser') {
                if (req.user.level > 1 ) {     
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            var create_user = {
                                query: "UPDATE `user` SET `username`=?, `password`=?, `database`=?, `level`=? WHERE `email`=?",
                                insert: [req.body.username, hash, req.body.db, req.body.level, req.body.email]
                            }
                            new query(create_user, {database: database, pool: pool}, function(err,data){
                                if (err) {
                                    res.status(500).end();
                                    return;
                                } 
                                res.status(200).end();
                            });
                        });
                    });
                }
            } else if (req.query.type === 'deleteUser') {
                if (req.user.level > 1 ) {     
                    var create_user = {
                        query: "DELETE FROM `user` WHERE `email`=?",
                        insert: [req.body.email]
                    }
                    new query(create_user, {database: database, pool: pool}, function(err,data){
                        if (err) {
                            res.status(500).end();
                            return;
                        } 
                        res.status(200).end();
                    });
                }
            } 
        }
    }
};