'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
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
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_user, req.query.event_type],
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
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};