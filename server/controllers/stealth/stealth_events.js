'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {          
            // var piechartQ = {
            //     query: 'SELECT '+
            //                 'time,'+
            //                 '`event_type` AS `pie_dimension`, '+
            //                 'count(*) AS `count` '+
            //             'FROM '+
            //                 '`stealth_events` '+
            //             'WHERE '+
            //                 '`time` BETWEEN ? AND ? '+
            //                 'AND `event_type` !=\'-\' '+
            //             'GROUP BY '+
            //                 '`event_type`',
            //     insert: [start, end]
            // }
            // async.parallel([
            //     // Table function(s)
            //     function(callback) {
            //         new dataTable(table1, {database: database, pool: pool}, function(err,data){
            //             tables.push(data);
            //             callback();
            //         });
            //     },
               
            // ] 
        
        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                        'count(*) AS count,'+
                        'time '+
                    'FROM '+
                        '`stealth_events` '+
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
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`event_detail`,'+
                            '`event_type`,'+
                            '`event_type` AS `pie_dimension` '+
                        'FROM '+
                            '`stealth_events` '+
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
                            type: 'stealth_events_by_type_and_user',
                            val: ['event_type'], // val: the pre-evaluated values from the query above
                            crumb: false
                        },
                    },
                    { title: 'Events', select: 'count' },
                    { title: 'Event Type', select: 'pie_dimension' },
                    { title: 'Event Detail', select: 'event_detail'},
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