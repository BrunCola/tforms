'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            var tables = [];
            var crossfilter = [];
            var piechart = [];
            var info = [];
            var table1 = {
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
                insert: [start, end],
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
                    title: 'Sharepoint Events by Type',
                    access: req.user.level
                }
            }
            var crossfilterQ = {
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
                insert: [start, end]
            }           
            var piechartQ = {
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
                insert: [start, end]
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new dataTable(table1, {database: database, pool: pool}, function(err,data) {
                        tables.push(data);
                        callback();
                    });
                },
                // Crossfilter function
                function(callback) {
                    new query(crossfilterQ, {database: database, pool: pool}, function(err,data){
                        crossfilter = data;
                        callback();
                    });
                },
                // Piechart function
                function(callback) {
                    new query(piechartQ, {database: database, pool: pool}, function(err,data){
                        piechart = data;
                        callback();
                    });
                }
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables,
                    crossfilter: crossfilter,
                    piechart: piechart
                };
                res.json(results);
            });
        }
    }
};