'use strict';

var floor_plan = require('../constructors/floor_plan'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    fs = require('fs'),
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
                        new query({query: 'SELECT sum(`count`) AS localapp FROM `conn_l7_meta` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'localhttp':
                        new query({query: 'SELECT sum(`count`) AS localhttp FROM `http_meta` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'localfiles':
                        new query({query: 'SELECT sum(`count`) AS `localfiles` FROM `file_meta` WHERE (file_meta.time between ? AND ?) AND  file_meta.lan_ip = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                    case 'endpoint':
                        new query({query: 'SELECT count(*) AS endpoint FROM `endpoint_events` WHERE (time between ? AND ?) AND  `lan_ip` = ? AND `lan_zone` = ?', insert: [start, end, req.query.lan_ip, req.query.lan_zone]}, {database: database, pool: pool}, function(err,data){
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
            }  else if (req.query.type === 'endpointconnection') { 
                switch (req.query.typeinfo) {
                    case 'getconn1':
                        new query({query: 'SELECT DISTINCT `lan_ip`, `machine`, `remote_ip` FROM `conn_meta` WHERE time BETWEEN ? AND ? AND `lan_ip` = ? ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn2':
                        new query({query: 'SELECT DISTINCT  `lan_ip`, `machine`, `remote_ip`  FROM `conn_meta` WHERE time BETWEEN ? AND ? AND `remote_ip` = ? ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn3':
                        new query({query: 'SELECT DISTINCT  `lan_ip`, `machine`, `remote_ip` FROM `conn_l7_meta` WHERE time BETWEEN ? AND ? AND `l7_proto`="IPsec" AND `lan_ip` = ?', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn4':
                        new query({query: 'SELECT DISTINCT  `lan_ip`, `machine`, `remote_ip` FROM `conn_l7_meta` WHERE time BETWEEN ? AND ? AND `l7_proto`="IPsec" AND `remote_ip` = ?', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                }
            } else if (req.query.type === 'max_order') {
                new query({query: 'SELECT MAX(`order_index`) AS `max_order` FROM `assets` ', insert: []}, {database: database, pool: pool}, function(err,data){
                    if (data) {
                        res.json(data);
                    }
                }); 
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
                                'u.lan_ip IS NOT NULL AND '+
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


                var stealthDrop = [];
                var stealth_drop = {
                    query: 'SELECT DISTINCT '+
                            'lan_user, '+
                            'lan_ip, '+
                            'lan_zone, '+
                            'lan_machine '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND `in_bytes` = 0 ',
                    insert: [start, end]
                }
                var localDrop = [];
                var local_drop = {
                    query: 'SELECT DISTINCT '+
                            'lan_user, '+
                            'lan_ip, '+
                            'lan_zone, '+
                            'machine '+ 
                    'FROM '+
                        ' `conn_meta` '+
                    'WHERE '+
                        'time BETWEEN ? AND ? '+
                        'AND `out_bytes` = 0 ',
                    insert: [start, end]
                }
                var stealthAuthorized = [];
                var stealth_authorized = {
                    query: 'SELECT DISTINCT '+
                            'lan_user, '+
                            'lan_ip, '+
                            'lan_zone, '+
                            'lan_machine '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND `out_bytes` > 0 '+
                            'AND `in_bytes` > 0 ',
                    insert: [start, end]
                }
                var localAuthorized = [];
                var local_authorized = {
                    query: 'SELECT DISTINCT '+
                            'lan_user, '+
                            'lan_ip, '+
                            'lan_zone, '+
                            'machine '+
                    'FROM '+
                        ' `conn_meta` '+
                    'WHERE '+
                        'time BETWEEN ? AND ? '+
                        'AND `out_bytes` > 0 '+
                        'AND `in_bytes` > 0 ',
                    insert: [start, end]
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
                        new query(stealth_drop, {database: database, pool: pool}, function(err,data){
                            stealthDrop = data;
                            callback();
                        });
                    },
                    function(callback) {
                        new floor_plan(local_drop, {database: database, pool: pool}, function(err,data){
                            localDrop = data;
                            callback();
                        });
                    },
                    function(callback) {
                        new floor_plan(stealth_authorized, {database: database, pool: pool}, function(err,data){
                            stealthAuthorized = data;
                            callback();
                        });
                    },
                    function(callback) {
                        new floor_plan(local_authorized, {database: database, pool: pool}, function(err,data){
                            localAuthorized = data;
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
                        users: floorplanReturn,
                        sd: stealthDrop,
                        ld: localDrop,
                        sa: stealthAuthorized,
                        la: localAuthorized,
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


                if (req.query.rem === 'removeFloorPlan') {
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
                }
            } else if (req.query.type === 'saveFloorScale') {

                var update_floor = {
                    query: "update `assets` SET `scale`=? WHERE `type`='map' AND `asset_name`=?",
                    insert: [req.body.scale, req.body.floor.asset_name]
                }                
                new query(update_floor, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    }
                });
            } else if (req.query.type === 'editFloorInfo') {
                var update_floor = {
                    query: "update `assets` SET `order_index`=?, `custom_name`=?, `scale`=?, `user_scale`=? WHERE `type`='map' AND `asset_name`=?",
                    insert: [req.body.edited_floor.order_index, req.body.edited_floor.custom_name, req.body.edited_floor.scale, req.body.edited_floor.user_scale, req.body.edited_floor.asset_name]
                }                
                new query(update_floor, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    }
                });
            } else if (req.query.type === 'newFloor') {

                if (req.body.custom_name !== undefined ) {                    
                    var asset_name = req.body.custom_name.replace(" ", "_");
                    console.log(asset_name);

                    var insert_map_image = {
                        query: "INSERT INTO `assets` (`file`,  `asset_name`, `path`, `type`, `custom_name`, `image_width`, `image_height`, `scale`) VALUES (?,?,?,?,?,?,?,?)",
                        insert: ["",asset_name,"","map",req.body.custom_name,800,600,1]
                    }
                    new query(insert_map_image, {database: database, pool: pool}, function(err,data){
                        res.send(200);
                    });
                }
            } else if (req.query.type === 'editFloorPos') {

                var edit_floor_pos = {
                    query: "UPDATE `assets` SET `x`=?, `y`=? WHERE `asset_name`=?",
                    insert: [req.body.x, req.body.y, req.body.map_name]
                }
                new query(edit_floor_pos, {database: database, pool: pool}, function(err,data){
                    res.send(200);
                });
            }
        }
    }
};