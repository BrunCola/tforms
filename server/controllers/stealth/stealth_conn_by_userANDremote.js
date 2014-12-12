'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async');

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
            if (req.query.lan_zone && req.query.lan_machine && req.query.lan_user && req.query.lan_ip && req.query.remote_ip) {
                var tables = [];
                var info = [];
                var table1 = {
                     query: 'SELECT '+
                                '`time`,'+
                                '`count`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`remote_ip`,'+
                                '`remote_machine`,'+
                                '`remote_user`,'+
                                '`in_bytes`,'+
                                '`out_bytes`,'+
                                '`in_packets`,'+
                                '`out_packets` '+
                            'FROM '+
                                '`stealth_conn_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_user` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `remote_ip` = ? ',
                    insert: [start, end, req.query.lan_zone, req.query.lan_user, req.query.lan_ip, req.query.remote_ip],
                    params: [
                        { title: 'Time', select: 'time' },
                        { title: 'Zone', select: 'lan_zone' }, 
                        { title: 'Local Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote Machine', select: 'remote_machine'},
                        { title: 'Remote User', select: 'remote_user'},
                        { title: 'Remote IP', select: 'remote_ip' },
                        { title: 'Bytes to Remote', select: 'in_bytes' },
                        { title: 'Bytes from Remote', select: 'out_bytes'},
                        { title: 'Packets to Remote', select: 'in_packets', dView:false },
                        { title: 'Packets from Remote', select: 'out_packets', dView:false },
                        { title: 'Connections', select: 'count', dView:false },
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'Full Endpoint Event Logs',
                        access: req.user.level
                    }
                }
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        new dataTable(table1, {database: database, pool: pool}, function(err,data){
                            tables.push(data);
                            callback();
                        });
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err)
                    var results = {
                        info: info,
                        tables: tables
                    };
                    res.json(results);
                });
            } else {
                res.redirect('/');
            }
        }
    }
};