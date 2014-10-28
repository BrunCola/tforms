'use strict';

var floor_plan = require('../constructors/floor_plan'),
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
            if (req.query.type === 'flooruser') {
                switch (req.query.typeinfo) {
                    // Info function(s) --- IOC
                    case 'localioc':
                        new query({query: 'SELECT count(*) AS localioc FROM `conn_ioc` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'localapp':
                        new query({query: 'SELECT count(*) AS localapp FROM `conn_l7_meta` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'localhttp':
                        new query({query: 'SELECT count(*) AS localhttp FROM `http_meta` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'localfiles':
                        new query({query: 'SELECT count(*) AS localfiles FROM `file_meta` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'endpoint':
                        new query({query: 'SELECT count(*) AS localfiles FROM `endpoint_events` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'assets':
                        new query({query: 'SELECT `file`, `path` FROM `assets` WHERE `lan_ip` = ? AND `lan_zone` = ?', insert: [req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'bandwidth':
                        new query({query: 'SELECT sum((in_bytes + out_bytes)/1048576) as totalbandwidth FROM `conn_meta` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'userinfoload':
                        new query({query: 'SELECT '+
                            'u.lan_user, '+
                            'u.lan_ip, '+
                            'u.lan_zone, '+
                            'u.lan_machine, '+
                            'u.lan_type, '+
                            'u.lan_os, '+
                            'u.lan_mac, '+
                            'u.stealth, '+
                            'u.endpoint_agent, '+
                            'u.endpoint_agent_name, '+
                            'u.x, '+
                            'u.y, '+
                            'u.map, '+
                            'u.custom_user '+
                            'FROM '+
                                'users u '+
                            'INNER JOIN '+
                                '( SELECT lan_ip, max(id) AS maxID FROM users GROUP BY lan_ip) groupedu '+
                            'ON '+
                                'u.lan_ip = groupedu.lan_ip '+
                            'AND '+
                                'u.id = groupedu.maxID '+
                            'WHERE '+
                                'u.lan_ip = ? '+
                                'AND u.lan_zone = ?', 
                            insert: [req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                }     
            } else if (req.query.type === 'floorquery') {
                switch (req.query.typeinfo) {
                    case 'iocusers':
                        new query({query: 'SELECT count(*) AS localioc, `lan_ip`, `lan_zone`, `lan_user` FROM `conn_ioc` WHERE (time between ? AND ?) GROUP BY `lan_ip`, `lan_zone`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'activeusers':
                        new query({query: 'SELECT `lan_ip`, `lan_zone`, `lan_user` FROM `conn_meta` WHERE (time between ? AND ?) GROUP BY `lan_ip`, `lan_zone`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'activestealthusers':
                        new query({query: 'SELECT `lan_ip`, `lan_zone`, `lan_user` FROM `stealth_local_meta` WHERE (time between ? AND ?) GROUP BY `lan_ip`, `lan_zone`', insert: [start, end]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                }
            } else {    
                var floorplanReturn = [];
                var floor_plan_users = {
                    query: 'SELECT '+
                            'u.lan_user, '+
                            'u.lan_ip, '+
                            'u.lan_zone, '+
                            'u.lan_machine, '+
                            'u.map, '+
                            'u.lan_type, '+
                            'u.lan_os, '+
                            'u.lan_mac, '+
                            'u.stealth, '+
                            'u.endpoint_agent, '+
                            'u.endpoint_agent_name, '+
                            'u.x, '+
                            'u.y, '+
                            'u.map, '+
                            'u.custom_user '+
                            'FROM '+
                                'users u '+
                            'INNER JOIN '+
                                '( SELECT lan_ip, max(id) AS maxID FROM users GROUP BY lan_ip) groupedu '+
                            'ON '+
                                'u.lan_ip = groupedu.lan_ip '+
                            'AND '+
                                'u.id = groupedu.maxID '+
                            'WHERE '+
                                'u.lan_ip IS NOT NULL AND'+
                                '(u.lan_mac IS NOT NULL OR u.lan_machine IS NOT NULL) '+
                            'ORDER BY '+
                                'lan_ip ',
                    insert: []
                }

                var floorplan = [];
                var floors = {
                    query: 'SELECT '+
                            '* '+
                            'FROM '+
                                'assets '+
                            'WHERE '+
                                '`type` = "map"'+
                            'ORDER BY `order_index`',
                    insert: []
                }
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        new floor_plan(floor_plan_users, {database: database, pool: pool}, function(err,data){
                            floorplanReturn = data;
                            callback();
                        });
                    },
                    function(callback) {
                        new floor_plan(floors, {database: database, pool: pool}, function(err,data){
                            floorplan = data;
                            callback();
                        });
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    var results = { 
                        force: floorplanReturn,
                        floor: floorplan
                    };
                    res.json(results);
                });         
            }
        },
        updatefp: function(req, res) {
            var database = req.session.passport.user.database;
            if (req.query.type === 'deletefp') {
                var _getAllFilesFromFolder = function(dir) {
                    var filesystem = require("fs");
                    var results = [];

                    filesystem.readdirSync(dir).forEach(function(file) {
                        file = dir+'/'+file;
                        var stat = filesystem.statSync(file);

                        if (stat && stat.isDirectory()) {
                            results = results.concat(_getAllFilesFromFolder(file))
                        } else {
                            if(file === req.body.path){
                                results.push(file);
                            }
                        }
                    });
                    if (results.length > 0) {
                        filesystem.unlinkSync(results[0]);
                        //console.log('successfully deleted '+results[0]);
                    }
                };

                _getAllFilesFromFolder('./public/uploads/phirelight');


                var delete_floor = {
                    query: "DELETE FROM `assets` WHERE `type`='map' AND `asset_name`=?",
                    insert: [req.body.asset_name]
                }                
                new query(delete_floor, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    } else {
                        res.send(200);
                    }
                });
            } else if (req.query.type === 'editFloorInfo') {

                for (var floor in req.body.edited_floors) {
                     var update_floor = {
                        query: "update `assets` SET `order_index`=?, `custom_name`=? WHERE `type`='map' AND `asset_name`=?",
                        insert: [req.body.edited_floors[floor].order_index, req.body.edited_floors[floor].custom_name, req.body.edited_floors[floor].asset_name]
                    }                
                    new query(update_floor, {database: database, pool: pool}, function(err,data){
                        if (err) {
                            res.send(500);
                        }
                    });
                }
            }
        }
    }
};