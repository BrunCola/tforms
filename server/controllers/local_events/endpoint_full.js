'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

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
            if (req.query.event_type && req.query.lan_zone && req.query.lan_user) {
                var tables = [];
                var info = [];
                var table1 = {
                     query: 'SELECT '+
                                'max(`time`) AS `time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`event_src`,'+
                                '`event_id`,'+
                                '`event_type`,'+
                                '`event_detail`,'+
                                '`event_full` '+
                            'FROM '+
                                '`endpoint_events` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_user` = ? '+
                                'AND `event_type` = ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_zone, req.query.lan_user, req.query.event_type],
                    params: [
                        { title: 'Time', select: 'time' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Event Full Log', select: 'event_full' },
                        { title: 'Event ID', select: 'event_id', dView:false },
                        { title: 'Event Source', select: 'event_src', dView:false },
                        { title: 'Event Type', select: 'event_type', dView:false },
                        { title: 'Event Details', select: 'event_detail', dView:false },
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'Full Endpoint Event Logs',
                        access: req.session.passport.user.level
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