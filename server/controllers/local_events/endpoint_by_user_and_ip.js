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
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`lan_stealth`, '+
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
                            'AND lan_zone = ? '+
                            'AND lan_ip = ? '+
                        'GROUP BY '+
                            '`event_type`' ,
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'endpoint_full',
                            val: ['event_type','lan_zone','lan_ip'], // val: the pre-evaluated values from the query above
                            crumb: false
                        }
                    },
                    { title: 'Events', select: 'count'},
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone'},
                    { title: 'Local Machine', select: 'lan_machine'},
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