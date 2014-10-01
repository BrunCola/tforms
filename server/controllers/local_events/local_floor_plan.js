'use strict';

var floor_plan = require('../constructors/floor_plan'),
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
                            'u.lan_ip IS NOT NULL '+
                        'ORDER BY '+
                            'lan_ip '+
                        'LIMIT 25 ',
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
};