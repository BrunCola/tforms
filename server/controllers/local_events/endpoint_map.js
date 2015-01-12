'use strict';

var floor_plan = require('../constructors/floor_plan'),
    buildings = require('../constructors/buildings'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    fs = require('fs'),
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
                            'u.lan_stealth, '+
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
            } else if (req.query.type === 'endpointconnection') { 
                switch (req.query.typeinfo) {
                    case 'getconn1':
                        new query({query: 'SELECT `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`, sum(`in_bytes`), sum(`out_bytes`) FROM `conn_meta` WHERE time BETWEEN ? AND ? AND `lan_ip` = ? AND `lan_machine` = ? GROUP BY `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`', insert: [start, end, req.query.lan_ip, req.query.lan_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn2':
                        new query({query: 'SELECT `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`, sum(`in_bytes`), sum(`out_bytes`)  FROM `conn_meta` WHERE time BETWEEN ? AND ? AND `remote_ip` = ? AND `remote_machine` = ? GROUP BY `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine` ', insert: [start, end, req.query.lan_ip, req.query.lan_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn3':
                        new query({query: 'SELECT `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`, sum(`in_bytes`), sum(`out_bytes`) FROM `conn_l7_meta` WHERE time BETWEEN ? AND ? AND `l7_proto`="IPsec" AND `lan_ip` = ? AND `lan_machine` = ? GROUP BY `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`', insert: [start, end, req.query.lan_ip, req.query.lan_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn4':
                        new query({query: 'SELECT `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`, sum(`in_bytes`), sum(`out_bytes`) FROM `conn_l7_meta` WHERE time BETWEEN ? AND ? AND `l7_proto`="IPsec" AND `remote_ip` = ? AND `remote_machine` = ? GROUP BY `lan_ip`, `lan_machine`, `remote_ip`, `remote_machine`', insert: [start, end, req.query.lan_ip, req.query.lan_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });  
                        break;
                }
            } else if (req.query.type === 'between_two') { 
                switch (req.query.typeinfo) {
                    case 'getconn1':
                        new query({
                            query: 'SELECT '+
                                    '\'conn_out\' AS type,'+
                                    '`count`, '+
                                    '`time`, '+
                                    '`lan_machine`, '+
                                    '`lan_user`, '+
                                    '`lan_zone`, '+
                                    '`lan_ip`, '+
                                    '`remote_ip`, '+
                                    '`in_packets`, '+
                                    '`in_bytes`, '+
                                    '`out_packets`, '+
                                    '`out_bytes`, '+
                                    '`ioc_count`, '+
                                    '`remote_user`, '+
                                    '`remote_machine`, '+
                                    '`l7_proto` '+
                                'FROM '+
                                    '`conn_l7_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `l7_proto`!="IPsec" '+
                                    'AND `lan_ip` = ? '+
                                    'AND `lan_machine`= ? '+
                                    'AND `remote_ip`= ? '+
                                    'AND `remote_machine`=? '+
                                   // 'AND `l7_proto` !=\'-\' '+
                                'GROUP BY '+
                                    '`time`', 
                            insert: [start, end, req.query.lan_ip, req.query.lan_machine, req.query.remote_ip, req.query.remote_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn2':
                        new query({
                            query: 'SELECT '+
                                    '\'conn_in\' AS type,'+
                                    '`count`, '+
                                    '`time`, '+
                                    '`lan_machine`, '+
                                    '`lan_user`, '+
                                    '`lan_zone`, '+
                                    '`lan_ip`, '+
                                    '`remote_ip`, '+
                                    '`in_packets`, '+
                                    '`in_bytes`, '+
                                    '`out_packets`, '+
                                    '`out_bytes`, '+
                                    '`ioc_count`, '+
                                    '`remote_user`, '+
                                    '`remote_machine`, '+
                                    '`l7_proto` '+
                                'FROM '+
                                    '`conn_l7_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `l7_proto`!="IPsec" '+
                                    'AND `remote_ip`=? '+
                                    'AND `remote_machine`=? '+
                                    'AND `lan_ip` = ? '+
                                    'AND `lan_machine`=? '+
                                    //'AND `l7_proto` !=\'-\' '+
                                'GROUP BY '+
                                    '`time`', 
                            insert: [start, end, req.query.lan_ip, req.query.lan_machine, req.query.remote_ip, req.query.remote_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn3':
                        new query({
                            query: 'SELECT '+
                                    '\'stealth_out\' AS type,'+
                                    '`count`, '+
                                    '`time`, '+
                                    '`lan_machine`, '+
                                    '`lan_user`, '+
                                    '`lan_zone`, '+
                                    '`lan_ip`, '+
                                    '`remote_ip`, '+
                                    '`in_packets`, '+
                                    '`in_bytes`, '+
                                    '`out_packets`, '+
                                    '`out_bytes`, '+
                                    '`ioc_count`, '+
                                    '`remote_user`, '+
                                    '`remote_machine`, '+
                                    '`l7_proto` '+
                                'FROM '+
                                    '`conn_l7_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `l7_proto`="IPsec" '+
                                    'AND `lan_ip` = ? '+
                                    'AND `lan_machine`=? '+
                                    'AND `remote_ip`=? '+
                                    'AND `remote_machine`=? '+
                                'GROUP BY '+
                                    '`time`', 
                            insert: [start, end, req.query.lan_ip, req.query.lan_machine, req.query.remote_ip, req.query.remote_machine]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        }); 
                        break;
                    case 'getconn4':
                        new query({
                            query: 'SELECT '+
                                    '\'stealth_in\' AS type,'+
                                    '`count`, '+
                                    '`time`, '+
                                    '`lan_machine`, '+
                                    '`lan_user`, '+
                                    '`lan_zone`, '+
                                    '`lan_ip`, '+
                                    '`remote_ip`, '+
                                    '`in_packets`, '+
                                    '`in_bytes`, '+
                                    '`out_packets`, '+
                                    '`out_bytes`, '+
                                    '`ioc_count`, '+
                                    '`remote_user`, '+
                                    '`remote_machine`, '+
                                    '`l7_proto` '+
                                'FROM '+
                                    '`conn_l7_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `l7_proto`="IPsec" '+
                                    'AND `remote_ip`=? '+
                                    'AND `remote_machine`=? '+
                                    'AND `lan_ip` = ? '+
                                    'AND `lan_machine`=? '+
                                'GROUP BY '+
                                    '`time`', 
                                    insert: [start, end, req.query.lan_ip, req.query.lan_machine, req.query.remote_ip, req.query.remote_machine]}, {database: database, pool: pool}, function(err,data){
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
                                'u.lan_zone, '+
                                'u.lan_stealth, '+
                                'u.lan_type, '+
                                'u.lan_machine, '+
                                'u.lan_os, '+
                                'u.lan_user, '+
                                'u.lan_mac, '+
                                'u.lan_ip, '+
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

                var assets = [];
                var asset = {
                    query: 'SELECT '+
                            '* '+
                            'FROM '+
                                'assets ',
                    insert: []
                }

                var groupedFloors = [];
                var buildingList = [];
                var build = {
                    query: 'SELECT '+
                            '* '+
                            'FROM '+
                                'assets '+
                            'WHERE '+
                                '`type` = "building"',
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
                        new buildings(floor_plan_users, floors, build, {database: database, pool: pool}, function(err,data){
                            groupedFloors = data;
                            callback();
                        });
                    },
                    function(callback) {
                        new floor_plan(asset, {database: database, pool: pool}, function(err,data){
                            assets = data;
                            callback();
                        });
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    var results = { 
                        users: floorplanReturn,
                       // floor: floorplan,
                        buildings: groupedFloors,
                       // buildingList: buildingList,
                        assets: assets
                    };
                    res.json(results);
                });         
            }
        },
        updatefp: function(req, res) {
            var database = req.user.database;
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
                        query: "DELETE FROM `assets` WHERE `type`='map' AND `asset_name`=? AND `building`=?",
                        insert: [req.body.asset_name, req.body.building]
                    }                
                    new query(delete_floor, {database: database, pool: pool}, function(err,data){
                        if (err) {
                            res.status(500).end();
                        } else {
                            res.status(200).end();
                        }
                    });
                }
            } else if (req.query.type === 'removeBuilding') {
                var delete_building = {
                        query: "DELETE FROM `assets` WHERE `asset_name`=? AND `type`=?",
                        insert: [req.body.asset_name, req.body.type]
                    }                
                    new query(delete_building, {database: database, pool: pool}, function(err,data){
                        if (err) {
                            res.status(500).end();
                        } else {
                            res.status(200).end();
                        }
                    });
            } else if (req.query.type === 'saveFloorScale') {
                var update_floor = {
                    query: "update `assets` SET `scale`=? WHERE `type`='map' AND `asset_name`=?",
                    insert: [req.body.scale, req.body.floor.asset_name]
                }                
                new query(update_floor, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    }
                });
            } else if (req.query.type === 'editFloorInfo') {
                var update_floor = {
                    query: "update `assets` SET `order_index`=?, `custom_name`=?, `scale`=?, `user_scale`=? WHERE `type`='map' AND `asset_name`=? AND `building`=?",
                    insert: [req.body.edited_floor.order_index, req.body.edited_floor.custom_name, req.body.edited_floor.scale, req.body.edited_floor.user_scale, req.body.edited_floor.asset_name, req.body.edited_floor.building]
                }                
                new query(update_floor, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    }
                });
            } else if (req.query.type === 'newFloor') {
                if (req.body.custom_name !== undefined ) {                    
                    var insert_map_image = {
                        query: "INSERT INTO `assets` (`file`,  `asset_name`, `path`, `type`, `custom_name`, `image_width`, `image_height`, `scale`, `building`) VALUES (?,?,?,?,?,?,?,?,?)",
                        insert: ["",req.body.asset_name,"","map",req.body.custom_name,800,600,1,req.body.building]
                    }
                    new query(insert_map_image, {database: database, pool: pool}, function(err,data){
                        res.status(200).end();
                    });
                }
            } else if (req.query.type === 'newBuilding') {
                if (req.body.custom_name !== undefined ) {                    
                    var insert_building = {
                        query: "INSERT INTO `assets` (`file`, `asset_name`, `path`, `type`, `custom_name`, `image_width`, `image_height`,`scale`, `building`) VALUES (?,?,?,?,?,?,?,?,?)",
                        insert: ["",req.body.asset_name,"","building",req.body.custom_name,800,600,1,null]
                    }
                    new query(insert_building, {database: database, pool: pool}, function(err,data){
                        res.status(200).end();
                    });
                }
            } else if (req.query.type === 'editFloorPos') {
                var edit_floor_pos = {
                    query: "UPDATE `assets` SET `x`=?, `y`=? WHERE `asset_name`=?",
                    insert: [req.body.x, req.body.y, req.body.map_name]
                }
                new query(edit_floor_pos, {database: database, pool: pool}, function(err,data){
                    res.status(200).end();
                });
            }
        }
    }
};