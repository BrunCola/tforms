'use strict';

var force_stealth_user = require('../constructors/force_stealth_user'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

var permissions = [3];

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.session.passport.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            var force;
            if (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1) {
                if (req.query.type === 'checkCoor') {
                    var database = req.session.passport.user.database;
                    var select_coordinates = {
                        query: "SELECT * from `stealth_view_coordinates` WHERE `user_login` = ? AND name = ? AND `page_title` = ? ",
                        insert: [req.query.user_login, req.query.name, req.query.page_title]
                    }            

                     async.parallel([
                        // Crossfilter function
                        function(callback) {
                            new query(select_coordinates, {database: database, pool: pool}, function(err,data){
                                result = data;
                                callback();
                            });
                        }
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        var results = {
                            result: result
                        };
                        res.json(results);
                    });
                } else if (req.query.type === 'top') {
                    var result = null;
                    var sql = {
                        query: 'SELECT DISTINCT '+
                                    '\'Non-Stealth Internal Attack\' AS type,'+
                                    '`lan_zone` AS `Attacker Zone`,'+
                                    '`lan_machine` AS `Attacker Machine`,'+
                                    '`lan_user` AS `Attacker_User`,'+
                                    '`lan_ip` AS `Attacker IP`,'+
                                    '`remote_machine` AS `Victim Machine`,'+
                                    '`remote_user` AS `lan_user`,'+
                                    '`remote_user` AS `Victim User`,'+
                                    '`remote_ip` AS `Victim IP` '+
                                'FROM '+
                                    ' `conn_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `proto` != \'udp\' '+
                                    'AND `remote_ip` REGEXP \'192.168.222\' '+
                                    'AND `out_bytes` = 0 ',
                        insert: [start, end]
                    }
                    async.parallel([
                        // Crossfilter function
                        function(callback) {
                            new query(sql, {database: database, pool: pool}, function(err,data){
                                result = data;
                                callback();
                            });
                        }
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        var results = {
                            result: result
                        };
                        res.json(results);
                    });
                } else {
                    var sql = {
                       // query: 'SELECT `lan_user`, `group` FROM `stealth_user',
                        query: 'SELECT '+
                                'u.lan_user, '+
                                'c.cois AS `group` '+
                            'FROM '+
                                '`stealth_role_group` '+
                            'AS g INNER JOIN '+
                                '`stealth_role_coi` '+
                                'c ON g.role = c.role '+
                            'INNER JOIN '+
                                '`stealth_user` '+
                            'AS u ON '+ 
                                'u.group = g.group',
                        insert: []
                    }
                    var stealth_drop = {
                        query: 'SELECT DISTINCT '+
                                    '\'Stealth COI Mismatch\' AS type,'+
                                    '`lan_zone` AS `Victim Zone`,'+
                                    '`lan_machine` AS `Victim Machine`,'+
                                    '`lan_user`,'+
                                    '`lan_user` AS `Victim User`,'+
                                    '`lan_ip` AS `Victim IP`,'+
                                    '`remote_machine` AS `Attacker Machine`,'+
                                    '`remote_user` AS `Attacker User`,'+
                                    '`remote_ip` AS `Attacker IP`, '+
                                    '\'blocked\' AS `allow` '+
                                'FROM '+
                                    '`stealth_conn_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `in_bytes` = 0 ',
                        insert: [start, end]
                    }
                    var local_drop = {
                        query: 'SELECT DISTINCT '+
                                    '\'Non-Stealth Internal Attack\' AS type,'+
                                    '`lan_zone` AS `Attacker Zone`,'+
                                    '`lan_machine` AS `Attacker Machine`,'+
                                    '`lan_user` AS `Attacker User`,'+
                                    '`lan_ip` AS `Attacker IP`,'+
                                    '`remote_machine` AS `Victim Machine`,'+
                                    '`remote_user` AS `lan_user`,'+
                                    '`remote_user` AS `Victim User`,'+
                                    '`remote_ip` AS `Victim IP`, '+
                                    '\'blocked\' AS `allow` '+
                                'FROM '+
                                    ' `conn_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `proto` != \'udp\' '+
                                    'AND `remote_ip` REGEXP \'192.168.222\' '+
                                    'AND `out_bytes` = 0 ',
                        insert: [start, end]
                    }
                    var stealth_authorized = {
                        query: 'SELECT DISTINCT '+
                                    '\'Stealth COI Allow\' AS type,'+
                                    '`lan_zone` AS `Victim Zone`,'+
                                    '`lan_machine` AS `Victim Machine`,'+
                                    '`lan_user`,'+
                                    '`lan_user` AS `Victim User`,'+
                                    '`lan_ip` AS `Victim IP`,'+
                                    '`remote_machine` AS `Attacker Machine`,'+
                                    '`remote_user` AS `Attacker User`,'+
                                    '`remote_ip` AS `Attacker IP`, '+
                                    '\'authorized\' AS `allow` '+
                                'FROM '+
                                    '`stealth_conn_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `out_bytes` > 0 '+
                                    'AND `in_bytes` > 0 ',
                        insert: [start, end]
                    }

                    var local_authorized = {
                        query: 'SELECT DISTINCT '+
                                    '\'Non-Stealth Internal Connection\' AS type,'+
                                    '`lan_zone` AS `Attacker Zone`,'+
                                    '`lan_machine` AS `Attacker Machine`,'+
                                    '`lan_user` AS `Attacker User`,'+
                                    '`lan_ip` AS `Attacker IP`,'+
                                    '`remote_machine` AS `Victim Machine`,'+
                                    '`remote_user` AS `lan_user`,'+
                                    '`remote_user` AS `Victim User`,'+
                                    '`remote_ip` AS `Victim IP`, '+
                                    '\'authorized\' AS `allow` '+
                                'FROM '+
                                    ' `conn_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `proto` != \'udp\' '+ 
                                    'AND `remote_ip` REGEXP \'192.168.222\' '+
                                    'AND `out_bytes` > 0 '+
                                    'AND `in_bytes` > 0 ',
                        insert: [start, end]
                    }
                    var stealth_authorized_v3 = {
                        query: 'SELECT DISTINCT '+
                                    '\'Stealth COI Allow v3\' AS type,'+
                                    '`lan_zone` AS `Victim Zone`,'+
                                    '`lan_machine` AS `Victim Machine`,'+
                                    '`lan_user`,'+
                                    '`lan_user` AS `Victim User`,'+
                                    '`lan_ip` AS `Victim IP`,'+
                                    '`remote_machine` AS `Attacker Machine`,'+
                                    '`remote_user` AS `Attacker User`,'+
                                    '`remote_ip` AS `Attacker IP`, '+
                                    '`l7_proto` AS `Stealth`, '+
                                    '\'authorized\' AS `allow` '+
                                'FROM '+
                                    '`conn_l7_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `l7_proto`="IPsec" '+
                                    'AND `out_bytes` > 0 '+
                                    'AND `in_bytes` > 0 ',
                        insert: [start, end]
                    }
                    var stealth_drop_v3 = {
                        query: 'SELECT DISTINCT '+
                                    '\'Stealth COI Mismatch v3\' AS type,'+
                                    '`lan_zone` AS `Victim Zone`,'+
                                    '`lan_machine` AS `Victim Machine`,'+
                                    '`lan_user`,'+
                                    '`lan_user` AS `Victim User`,'+
                                    '`lan_ip` AS `Victim IP`,'+
                                    '`remote_machine` AS `Attacker Machine`,'+
                                    '`remote_user` AS `Attacker User`,'+
                                    '`remote_ip` AS `Attacker IP`, '+
                                    '`l7_proto` AS `Stealth`, '+
                                    '\'blocked\' AS `allow` '+
                                'FROM '+
                                    '`conn_l7_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `l7_proto`!="IPsec" '+
                                    'AND `in_bytes` = 0 ',
                        insert: [start, end]
                    }
                    var rules = {
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
                    var coordinates = {
                        query: 'SELECT * '+
                                'FROM '+
                                    '`stealth_view_coordinates`'+
                                'WHERE '+
                                '`user_login` = ? '+
                                'AND `page_title` = "stealth_op_view"',
                        insert: [req.session.passport.user.email]
                    }
                    async.parallel([
                        // Crossfilter function
                        function(callback) {
                            new force_stealth_user(sql, [
                                    stealth_drop, 
                                    local_drop, 
                                    rules, 
                                    coordinates, 
                                    stealth_authorized, 
                                    local_authorized,
                                    stealth_drop_v3,
                                    stealth_authorized_v3
                                ], { database: database, pool: pool }, function(err,data) {
                                    force = data;
                                    callback();
                                }
                            );
                        }   
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        var results = {
                            force: force
                        };
                        res.json(results);
                    });
                }
            } else {
                res.redirect('/');
            }
        },
        set_info: function(req, res) {
            var database = req.session.passport.user.database;
            if (req.query.type === 'insert') {
                var update_coordinates = {
                    query: "INSERT into `stealth_view_coordinates` VALUES (?,?,?,?,?)",
                    insert: [req.body.name, req.body.user_login, req.body.x, req.body.y, req.body.page_title]
                }                
                new query(update_coordinates, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    } else {
                        res.send(200);
                    }
                });
            } else {
                var update_coordinates = {
                    query: "UPDATE `stealth_view_coordinates` SET `x`= ?, `y` = ? WHERE `name` = ? AND `user_login` = ? AND `page_title` = ?",
                    insert: [req.body.x, req.body.y, req.body.name, req.body.user_login, req.body.page_title]
                }                
                new query(update_coordinates, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    } else {
                        res.send(200);
                    }
                });
            }
        }
    }
};