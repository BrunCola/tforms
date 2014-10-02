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
                }     

            }else{    
                var floorplanReturn = [];

                var floor_plan_users = {
                    query: 'SELECT '+
                            'u.lan_user, '+
                            'u.lan_ip, '+
                            'u.lan_zone, '+
                            'u.lan_machine, '+
                            'u.lan_os, '+
                            'u.lan_mac, '+
                            'u.endpoint_agent, '+
                            'u.endpoint_agent_name, '+
                            'u.stealth '+
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
                                'u.lan_mac IS NOT NULL '+
                            'ORDER BY '+
                                'lan_ip ',
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
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    var results = { 
                        force: floorplanReturn
                    };
                    res.json(results);
                });         
            }
        }
    }
};