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
            if (req.query.event_type && req.query.lan_zone && req.query.lan_user) {
                var tables = [];
                var info = [];
                var table1 = {
                     query: 'SELECT '+
                                '`time`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`event_id`,'+
                                '`event_type`,'+
                                '`event_detail` '+
                            'FROM '+
                                '`stealth_events` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_user` = ? '+
                                'AND `event_type` = ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_zone, req.query.lan_user, req.query.event_type],
                    params: [
                        { title: 'Time', select: 'time' },
                        { title: 'Zone', select: 'lan_zone'},
                        { title: 'Local Machine', select: 'lan_machine'},
                        { title: 'Local User', select: 'lan_user'},
                        { title: 'Local IP', select: 'lan_ip'},
                        { title: 'Event Type', select: 'event_type' },
                        { title: 'Event Details', select: 'event_detail'},
                        { title: 'Event ID', select: 'event_id'},
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'Full Stealth Event Logs'
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