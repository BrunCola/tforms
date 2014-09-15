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
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`event_src`,'+
                                '`event_id`,'+
                                '`event_type`,'+
                                '`event_detail`,'+
                                '`stealth` '+
                            'FROM '+
                                '`endpoint_events` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `event_type` = ? '+
                            'GROUP BY'+
                                '`lan_user`',
                    insert: [start, end, req.query.event_type],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'endpoint_events_user_drill',
                                val: ['lan_user','event_type'], // pre-evaluated values from the query above
                                crumb: false
                            }
                        },
                        { title: 'stealth', select: 'stealth'},
                        { title: 'Events', select: 'count'},
                        { title: 'User', select: 'lan_user'},
                        { title: 'LAN IP', select: 'lan_ip'},
                        { title: 'Event Type', select: 'event_type' },
                        { title: 'Event Details', select: 'event_detail'},
                        { title: 'Event Source', select: 'event_src'},
                        { title: 'Event ID', select: 'event_id'},
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local Endpoints Triggering Event'
                    }
                }
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        // new dataTable(table1, table2, parseInt(req.session.passport.user.level), {database: database, pool: pool}, function(err,data){
                        new datatable(table1, {database: database, pool: pool}, function(err,data){
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
                    //console.log(results);
                    res.json(results);
                });
            } else {
                res.redirect('/');
            }
        }
    }
};