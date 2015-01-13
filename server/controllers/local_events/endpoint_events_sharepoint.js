'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {
        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                            'count(*) AS count,'+
                            '`time` '+
                        'FROM '+
                            '`sharepoint_events` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`))',
                insert: [req.query.start, req.query.end]
            }
            new query(get, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        crossfilterpie: function(req, res) {
            var piechart = {
                query: 'SELECT '+
                        'count(*) AS `count`,'+
                        '`time`,'+
                        '`event_type` AS `pie_dimension` '+
                    'FROM '+
                        '`sharepoint_events` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        '`event_type`',
                insert: [req.query.start, req.query.end]
            }
            new query(piechart, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`event_id`,'+
                            '`event_src`,'+
                            '`event_type`,'+
                            '`event_type` AS `pie_dimension`,'+
                            '`event_detail`,'+
                            '`event_full` '+
                        'FROM '+
                            '`sharepoint_events` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`event_type`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'endpoint_events_sharepoint_drill',
                            val: ['event_type'],
                            crumb: false
                        },
                    },
                    { title: 'Events', select: 'count' },
                    { title: 'Event Type', select: 'event_type' },
                    { title: 'Event Source', select: 'event_src'}
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Sharepoint Events by Type'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};