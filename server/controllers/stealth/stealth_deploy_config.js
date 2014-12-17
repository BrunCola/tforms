'use strict';

var force_stealth = require('../constructors/force_stealth'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

var permissions = [3];

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            if (permissions.indexOf(parseInt(req.user.level)) !== -1) {
                 if (req.query.type === 'checkCoor') {
                    var database = req.user.database;
                    var select_coordinates = {
                        query: "SELECT * from `stealth_view_coordinates` WHERE `user_login` = ? AND name = ? AND `page_title` = ? ",
                        insert: [req.query.user_login, req.query.name, req.query.page_title]
                    }            

                     async.parallel([
                        // Crossfilter function
                        function(callback) {
                            new query(select_coordinates, {database: database, pool: pool}, function(err,data){
                                forceReturn = data;
                                callback();
                            });
                        }
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        var results = {
                            info: info,
                            force: forceReturn
                        };
                        res.json(results);
                    });
                } else {
                    var forceReturn = [];
                    var info = [];
                    var forceSQL1 = {
                        query: 'SELECT '+
                                    '`user`, '+
                                    '`role` '+
                                'FROM '+
                                    '`stealth_role_user` '+
                                'WHERE '+
                                    '`archive` = 0',
                        insert: []
                    }
                    var forceSQL2 = {
                        query: 'SELECT '+
                                    '`lan_user` AS `user`, '+
                                    'stealth_user.group, '+
                                    '`role` '+
                                'FROM '+
                                    '`stealth_user` '+
                                'JOIN '+
                                    '`stealth_role_group` '+
                                'ON '+
                                    'stealth_user.group = stealth_role_group.group '+
                                    'AND stealth_role_group.archive = 0 '+
                                    'AND stealth_user.archive = 0',
                        insert: []
                    }
                    var forceSQL3 = {
                        query: 'SELECT '+
                                    '`role`, '+
                                    '`cois`, '+
                                    '`rule`, '+
                                    '`rule_order` '+
                                'FROM '+
                                    '`stealth_role_coi` '+
                                'WHERE '+
                                    '`archive` = 0 ' +
                                'ORDER BY '+
                                    '`cois`, `rule_order` ASC',
                        insert: []
                    }
                    var forceSQL4 = {
                        query: '(SELECT '+
                                    '`user`, '+
                                    '`cois` '+
                                'FROM '+
                                    '`stealth_role_user` '+
                                'JOIN '+
                                    '`stealth_role_coi` '+
                                    'ON stealth_role_user.role = stealth_role_coi.role '+
                                'GROUP BY '+
                                    '`user`, '+
                                    '`cois` '+
                                ') UNION '+
                                '(SELECT '+
                                    'stealth_user.lan_user AS user, '+
                                    'stealth_role_coi.cois '+
                                'FROM '+
                                    '`stealth_user`, '+ 
                                    '`stealth_role_group`, '+
                                    '`stealth_role_coi` '+
                                'WHERE '+
                                    'stealth_user.group = stealth_role_group.group '+
                                    'AND stealth_role_group.role = stealth_role_coi.role '+
                                'GROUP BY '+
                                    '`lan_user`, '+
                                    '`cois` '+
                                ') ',
                        insert: []
                    }
                    var coordinates = {
                        query: 'SELECT * '+
                                'FROM '+
                                    '`stealth_view_coordinates`'+
                                'WHERE '+
                                '`user_login` = ? '+
                                'AND `page_title` = "stealth_COI_map"',
                        insert: [req.user.email]
                    }
                    async.parallel([
                        // Table function(s)
                        function(callback) {
                            new force_stealth(forceSQL1, forceSQL2, forceSQL3, forceSQL4, coordinates, {database: database, pool: pool}, function(err,data){
                                forceReturn = data;
                                callback();
                            });
                        },
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        var results = {
                            info: info,
                            force: forceReturn
                        };
                        res.json(results);
                    });
                }
            } else {
                res.redirect('/');
            }
        },
        set_info: function(req, res) {
            var database = req.user.database;
            if (req.query.trigger_type === 'ldap') {
                var update_coordinates = {
                    query: "UPDATE `script_trigger` SET `flag` = ? WHERE `type` = ? ",
                    insert: [req.query.flag, req.query.trigger_type]
                }                
                new query(update_coordinates, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).end();
                    }
                });
            } else if (req.query.type === 'insert') {
                var update_coordinates = {
                    query: "INSERT into `stealth_view_coordinates` VALUES (?,?,?,?,?)",
                    insert: [req.body.name, req.body.user_login, req.body.x, req.body.y, req.body.page_title]
                }                
                new query(update_coordinates, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).end();
                    }
                });
            } else {
                var update_coordinates = {
                    query: "UPDATE `stealth_view_coordinates` SET `x`= ?, `y` = ? WHERE `name` = ? AND `user_login` = ? AND `page_title` = ?",
                    insert: [req.body.x, req.body.y, req.body.name, req.body.user_login, req.body.page_title]
                }                
                new query(update_coordinates, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).end();
                    }
                });
            }
        }
    }
};