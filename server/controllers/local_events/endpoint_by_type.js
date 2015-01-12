'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query');

module.exports = function(pool) {
    return {
        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                        'count(*) AS count,'+
                        'time '+
                    'FROM '+
                        '`endpoint_events` '+
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
                        'time,'+
                        '`event_type` AS `pie_dimension`, '+
                        'count(*) AS `count` '+
                    'FROM '+
                        '`endpoint_events` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                        'AND `event_type` !=\'-\' '+
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
                            '`event_src`,'+
                            '`event_type`,'+
                            '`event_type` AS `pie_dimension` '+
                        'FROM '+
                            '`endpoint_events` '+
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
                            type: 'endpoint_by_type_and_user',
                            val: ['event_type'], // val: the pre-evaluated values from the query above
                            crumb: false
                        },
                    },
                    { title: 'Events', select: 'count' },
                    { title: 'Event Type', select: 'pie_dimension' },
                    { title: 'Event Source', select: 'event_src'},
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local Endpoint Events'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};