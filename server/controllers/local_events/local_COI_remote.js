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
                var sql = {
                    query: 'SELECT `lan_user`, `group` FROM `stealth_user',
                    insert: []
                }
                var q1 = {
                    query: 'SELECT '+
                        '\'Stealth\' AS type, '+
                        '`lan_zone`, '+
                        '`lan_user`, '+
                        '`lan_ip`, '+
                        '`remote_user`, '+
                        '`remote_ip` '+
                    'FROM '+
                        '`stealth_conn_meta` '+
                    'WHERE '+
                        'time BETWEEN ? AND ? '+
                        'AND (`in_bytes` = 0 OR `out_bytes` = 0) '+
                    'GROUP BY'+
                        '`lan_user`,'+
                        '`remote_ip`',
                    insert: [start, end]
                }
                async.parallel([
                    // Crossfilter function
                    function(callback) {
                        new force_stealth_user(sql, [q1], {database: database, pool: pool}, function(err,data){
                            console.log(data)
                            force = data;
                            callback();
                        });
                    }
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    var results = {
                        force: force
                    };
                    res.json(results);
                });
            } else {
                res.redirect('/');
            }
        }
    }
};