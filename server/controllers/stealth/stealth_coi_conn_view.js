'use strict';

var force_stealth_user = require('../constructors/force_stealth_user');

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
            var chord;
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
                                    ' `conn` '+
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
                        query: 'SELECT `lan_user`, `group` FROM `stealth_user',
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
                        insert: [req.user.email]
                    }
                    async.parallel([
                        // Crossfilter function
                        function(callback) {
                            new force_stealth_user(sql, [stealth_drop, local_drop, rules, coordinates, stealth_authorized, local_authorized], {database: database, pool: pool}, function(err,data){
                                chord = data;
                                callback();
                            });
                        }   
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        var results = {
                            chord: chord
                        };
                        res.json(results);
                    });
                }
            } else {
                res.redirect('/');
            }
        }
        // //////////////////////
        // /////   TABLE   //////
        // //////////////////////
        // table: function(req, res){
        //     var table = {
        //         query: 'SELECT '+
        //                     '`time`,'+
        //                     '`lan_stealth`,'+
        //                     '`lan_zone`,'+
        //                     '`lan_machine`,'+
        //                     '`lan_user`,'+
        //                     '`lan_ip`,'+
        //                     '`event_src`,'+
        //                     '`event_id`,'+
        //                     '`event_type`,'+
        //                     '`event_detail`,'+
        //                     '`event_full` '+
        //                 'FROM '+
        //                     '`endpoint_events` '+
        //                 'WHERE '+
        //                     '`time` BETWEEN ? AND ? '+
        //                     'AND `lan_zone` = ? '+
        //                     'AND `lan_user` = ? '+
        //                     'AND `event_type` = ? '+
        //                 'LIMIT 250',
        //         insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_user, req.query.event_type],
        //         params: [
        //             { title: 'Time', select: 'time' },
        //             { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
        //             { title: 'Event Full Log', select: 'event_full' },
        //             { title: 'Event ID', select: 'event_id', dView:false },
        //             { title: 'Event Source', select: 'event_src', dView:false },
        //             { title: 'Event Type', select: 'event_type', dView:false },
        //             { title: 'Event Details', select: 'event_detail', dView:false },
        //         ],
        //         settings: {
        //             sort: [[0, 'desc']],
        //             div: 'table',
        //             title: 'Full Endpoint Event Logs',
        //             hide_stealth: req.user.hide_stealth
        //         }
        //     }
        //     new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
        //         if (err) { res.status(500).end(); return }
        //         res.json({table: data});
        //     });
        // }
    }
};