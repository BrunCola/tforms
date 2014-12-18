'use strict';

var fs = require('fs'),
    config = require('../../config/config'),
    query = require('../constructors/query'),
    user = require('../constructors/user'),
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
                if (req.user.user_level === "superadmin") {
                    new query({query: 'SELECT * FROM `user` WHERE `email` = ? ', insert: [req.query.userEmail]}, {database: database, pool: pool}, function(err,data){
                        if (data) {
                            res.json(data);
                        }
                    });  
                } else if (req.user.user_level === "admin") {
                    new user({query: 'SELECT * FROM `user` WHERE `email` = ? ', insert: [req.query.userEmail]}, {database: database, pool: pool}, function(err,data){
                        if (data) {
                            res.json(data);
                        }
                    });  
                }
            } else {
                var allUsers = false;    
                if (req.user.user_level === "superadmin") {
                    var list_users = {
                        query: 'SELECT '+
                                    '`email`, '+
                                    '`database`, '+
                                    '`user_level` '+
                                'FROM '+
                                    '`user` ',
                        insert: [req.user.user_level]
                    }
                } else if (req.user.user_level === "admin") {
                    var list_users = {
                        query: 'SELECT '+
                                    '`email`, '+
                                    '`user_level` '+
                                'FROM '+
                                    '`user` '+
                                'WHERE '+
                                    '`user_level` != "superadmin" '+
                                    'AND `database` = ?',
                        insert: [req.user.database]
                    }
                } 
                async.parallel([
                    // Table function(s)                
                    function(callback) {
                        if (req.user.user_level === "superadmin") {
                            new query(list_users, {database: database, pool: pool}, function(err,data){
                                allUsers = data;
                                callback();
                            });
                        } else if (req.user.user_level === "admin") {
                            new user(list_users, {database: database, pool: pool}, function(err,data){
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

            var db = "-";
            if (req.user.user_level === "superadmin") { 
                db = req.body.db;
            } else if (req.user.user_level === "admin") {
                db = req.user.database;
            }

            if (req.query.type === 'createNewUser') {
                var d = new Date()
                var date = d.getFullYear() + "-" + (d.getMonth()+1) + "-" +d.getDate();
                if ((req.user.user_level === "superadmin") || (req.user.user_level === "admin")) { 
                    if (req.user.user_level === "superadmin") { 
                        db = req.body.db;
                    } else if (req.user.user_level === "admin") {
                        db = req.user.database;
                    }    
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            var create_user = {
                                query: "INSERT INTO `user` (`email`, `username`, `password`, `database`, `joined`, `user_level`) VALUES (?,?,?,?,?,?)",
                                insert: [req.body.email, req.body.username, hash, db, date, req.body.user_level]
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
                if ((req.user.user_level === "superadmin") || (req.user.user_level === "admin")) {     
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            var edit_user = {
                                query: "UPDATE `user` SET `username`=?, `password`=?, `database`=?, `user_level`=? WHERE `email`=?",
                                insert: [req.body.username, hash, db, req.body.user_level, req.body.email]
                            }
                            new query(edit_user, {database: database, pool: pool}, function(err,data){
                                if (err) {
                                    res.status(500).end();
                                    return;
                                } 
                                res.status(200).end();
                            });
                        });
                    });
                }
            } else if (req.query.type === 'editAccess') {
                if ((req.user.user_level === "superadmin") || (req.user.user_level === "admin")) {

                    var update_user = {
                        query: "UPDATE `user` SET `hide_stealth`=?, `hide_proxy`=? WHERE `email`=?",
                        insert: [req.body.hide_stealth, req.body.hide_proxy, req.body.email]
                    }
                    new query(update_user, {database: database, pool: pool}, function(err,data){
                        if (err) {
                            res.status(500).end();
                            return;
                        } 
                        res.status(200).end();
                    });
                }
            } else if (req.query.type === 'deleteUser') {
                if ((req.user.user_level === "superadmin") || (req.user.user_level === "admin")) {     
                    var delete_user = {
                        query: "DELETE FROM `user` WHERE `email`=?",
                        insert: [req.body.email]
                    }
                    new query(delete_user, {database: database, pool: pool}, function(err,data){
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