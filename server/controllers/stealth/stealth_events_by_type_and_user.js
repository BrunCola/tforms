'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.session.passport.user.database;
            // var database = null;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            //var results = [];
            if (req.query.event_type) {
                var tables = [];
                var info = [];
                var table1 = {
                     query: 'SELECT '+
                                'count(*) AS count,'+
                                'max(`time`) AS `time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`event_src`,'+
                                '`event_id`,'+
                                '`event_type`,'+
                                '`event_detail` '+
                            'FROM '+
                                '`stealth_events` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `event_type` = ? '+
                            'GROUP BY '+
                                '`lan_zone`,'+
                                '`lan_user`',
                    insert: [start, end, req.query.event_type],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'stealth_events_full',
                                val: ['event_type','lan_zone','lan_user'], // pre-evaluated values from the query above
                                crumb: false
                            }
                        },
                        { title: 'Events', select: 'count'},
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone'},
                        { title: 'Machine', select: 'lan_machine'},
                        { title: 'Local User', select: 'lan_user'},
                        { title: 'Local IP', select: 'lan_ip'},
                        { title: 'Event Type', select: 'event_type' },
                        { title: 'Event Details', select: 'event_detail'},
                        { title: 'Event Source', select: 'event_src'},
                        { title: 'Event ID', select: 'event_id'},
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local Endpoints Triggering Event',
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