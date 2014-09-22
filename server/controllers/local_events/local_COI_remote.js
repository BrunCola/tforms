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
                var stealth_drop = {
                    query: 'SELECT DISTINCT '+
                        '\'Stealth COI Mismatch\' AS type,'+
                        '`lan_zone` AS `Victim Zone`,'+
                        '`lan_machine` AS `Victim Machine`,'+
                        '`lan_user`,'+
                        '`lan_user` AS `Victim_User`,'+
                        '`lan_ip` AS `Victim IP`,'+
                        '`remote_machine` AS `Attacker Machine`,'+
                        '`remote_user` AS `Attacker User`,'+
                        '`remote_ip` AS `Attacker IP` '+
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
                        '`lan_user` AS `Attacker_User`,'+
                        '`lan_ip` AS `Attacker IP`,'+
                        '`remote_machine` AS `Victim Machine`,'+
                        '`remote_user` AS `lan_user`,'+
                        '`remote_user` AS `Victim User`,'+
                        '`remote_ip` AS `Victim IP` '+
                    'FROM '+
                        '`conn` '+
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
                        new force_stealth_user(sql, [stealth_drop, local_drop], {database: database, pool: pool}, function(err,data){
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