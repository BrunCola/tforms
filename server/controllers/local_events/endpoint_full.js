'use strict';

var dataTable = require('../constructors/datatable');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            '`time`,'+
                            '`lan_stealth`,'+
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
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_user, req.query.event_type],
                params: [
                    { title: 'Time', select: 'time' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
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
                    hide_stealth: req.user.hide_stealth
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};