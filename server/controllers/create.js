'use strict';

var fs = require('fs'),
    config = require('../config/config'),
    query = require('./constructors/query'),
    async = require('async');

var permissions = [3];

module.exports = function(pool) {
    return {
        render: function(req, res) {
            if (req.query.type === 'createUser' ){
                if (req.user.master >= 1) {
                    new query({query: 'SELECT * FROM `user` WHERE `email` = ?', insert: [req.query.email]}, pool, function(err,data){
                        if (err) { res.status(500).end(); return }
                        res.json(data);
                    });
                }
            } else {
                var allChildren = false;
                if (req.user.master === 2) {
                    var list_org = {
                        query: 'SELECT '+
                                    '* '+
                                'FROM '+
                                    'parent_child_org '+
                                'WHERE '+
                                    '`level` = 0',
                        insert: []
                    } 
                    var list_prov = {
                        query: 'SELECT '+
                                    '* '+
                                'FROM '+
                                    'parent_child_org '+
                                'WHERE '+
                                    '`level` = 1',
                        insert: []
                    }             
                    var list_all_prov_org = {
                        query: 'SELECT '+
                                    '* '+
                                'FROM '+
                                    'parent_child_org '+
                                'WHERE '+
                                    '`level` != 2',
                        insert: []
                    }             
                    var list_child = {
                        query: 'SELECT '+
                                '* '+
                                'FROM '+
                                    'parent_child_org ',
                        insert: []
                    }
                } else if (req.user.master === 1) {            
                    var list_all_prov_org = {
                        query: 'SELECT '+
                                    '* '+
                                'FROM '+
                                    'parent_child_org '+
                                'WHERE '+
                                    '`level` = 0',
                        insert: []
                    }               
                    var list_child = {
                        query: 'SELECT '+
                                '* '+
                                'FROM '+
                                    'parent_child_org '+
                                'WHERE '+
                                    '`parent_org`=?',
                        insert: [req.user.parent_org]
                    }
                } else {              
                    var list_child = {
                        query: 'SELECT '+
                                '* '+
                                'FROM '+
                                    'parent_child_org '+
                                'WHERE '+
                                    '`child_org`=?',
                        insert: [req.user.parent_org]
                    }
                }
                var parent_child, parent_child_prov, programTypes, all_org, all_org, list_users;
                var program_type = {
                    query: 'SELECT '+
                            '* '+
                            'FROM '+
                                'program_type ',
                    insert: []
                }
                if (req.user.master === 0) {
                    var list_user = {
                        query: 'SELECT '+
                                    '* '+
                                'FROM '+
                                    'user '+
                                'WHERE '+
                                    '`user` = ? ',
                        insert: [req.user.user]
                    }
                } else {
                    var list_user = {
                        query: 'SELECT '+
                                    '* '+
                                'FROM '+
                                    'user '+
                                'WHERE '+
                                    '`master` <= ? ',
                        insert: [req.user.master]
                    }
                }

                async.parallel([
                    // Table function(s)
                    function(callback) {
                        if (req.user.master > 0) {
                            new query(list_all_prov_org, pool, function(err,data){
                                all_org = data;
                                callback();
                            });
                        } else {
                            callback();
                        }                     
                    },
                    function(callback) {
                        new query(list_child, pool, function(err,data){
                            parent_child = data;
                            callback();
                        });
                    },
                    function(callback) {
                        if (req.user.master === 2) {
                            new query(list_prov, pool, function(err,data){
                                parent_child_prov = data;
                                callback();
                            });
                        } else {
                            callback();
                        } 
                    },
                    function(callback) {
                        new query(list_user, pool, function(err,data){
                            list_users = data;
                            callback();
                        });
                    },
                    function(callback) {
                        new query(program_type, pool, function(err,data){
                            programTypes = data;
                            callback();
                        });
                    },
                    function(callback) {
                        if (req.user.master === 2) {
                            new query(list_org, pool, function(err,data){
                                allChildren = data;
                                callback();
                            });
                        } else {
                            callback();
                        }                    
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    var results = { 
                        all_org: all_org,
                        children: parent_child,
                        regional: parent_child_prov,
                        programTypes: programTypes,
                        children_user: list_users,
                        allChildren: allChildren
                    };
                    res.json(results);
                });    
            }
        },
        provide: function(req, res) {
            //Upload floor plan name and path to DB
            if (req.query.type === 'createBlank' ){
                var email = "NAFC";
                if (req.body.level == 0) {
                    email = req.body.email;
                }
                var list_child = {
                     query: "INSERT INTO `parent_child_org` (`parent_org`,`child_org`,`level`) VALUES (?,?,?)",
                     insert: [email, req.body.child_org, req.body.level]
                }
                new query(list_child, pool, function(err,data){
                    res.send(200);
                });
            } else if (req.query.type === 'deleteOrgs' ){
                var list_child = {
                     query: "DELETE FROM `parent_child_org` WHERE `child_org`= ? AND `parent_org`= ?",
                     insert: [req.body.child_org,req.body.parent_org]
                }
                new query(list_child, pool, function(err,data){
                });
            } else if (req.query.type === 'deleteOrg' ){
                var list_child = {
                     query: "DELETE FROM `parent_child_org` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(list_child, pool, function(err,data){
                });

                var board_info = {
                     query: "DELETE FROM `board_info` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(board_info, pool, function(err,data){
                });

                var board_members = {
                     query: "DELETE FROM `board_members` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(board_members, pool, function(err,data){
                });

                var board_other_committees = {
                     query: "DELETE FROM `board_other_committees` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(board_other_committees, pool, function(err,data){
                });

                var board_other_policies = {
                     query: "DELETE FROM `board_other_policies` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(board_other_policies, pool, function(err,data){
                });

                var board_training = {
                     query: "DELETE FROM `board_training` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(board_training, pool, function(err,data){
                });       

                var contact_info = {
                     query: "DELETE FROM `contact_info` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(contact_info, pool, function(err,data){
                });

                var facilities = {
                     query: "DELETE FROM `facilities` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(facilities, pool, function(err,data){
                });

                var organization = {
                     query: "DELETE FROM `organization` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(organization, pool, function(err,data){
                });

                var partnerships = {
                     query: "DELETE FROM `partnerships` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(partnerships, pool, function(err,data){
                });

                var programs = {
                     query: "DELETE FROM `programs` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(programs, pool, function(err,data){
                });
                var signature = {
                     query: "DELETE FROM `signature` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(signature, pool, function(err,data){
                });

                var staff = {
                     query: "DELETE FROM `staff` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(staff, pool, function(err,data){
                });

                var youth = {
                     query: "DELETE FROM `youth` WHERE `child_org`= ?",
                     insert: [req.body.child_org]
                }
                new query(youth, pool, function(err, data){
                    res.send(200);
                });
            } 
        }
    }
};