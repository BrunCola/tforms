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
                            'AND `event_type` = ? '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            '`lan_user`',
                insert: [req.query.start, req.query.end, req.query.event_type],
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
                    { title: 'Zone', select: 'lan_zone'},
                    { title: 'Local Machine', select: 'lan_machine'},
                    { title: 'Local User', select: 'lan_user'},
                    { title: 'Local IP', select: 'lan_ip'},
                    { title: 'Event Type', select: 'event_type' },
                    { title: 'Event Details', select: 'event_detail'},
                    { title: 'Event ID', select: 'event_id'},
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local Endpoints Triggering Event'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};