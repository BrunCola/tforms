'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
            // var piechartQ = {
            //     query: 'SELECT '+
            //              'time,'+
            //              '`user_agent` AS `pie_dimension`, '+
            //              'sum(`count`) AS `count` '+
            //          'FROM '+
            //              '`http_user_agent` '+
            //          'WHERE '+
            //              '`time` BETWEEN ? AND ? '+
            //              'AND `user_agent` !=\'-\' '+
            //          'GROUP BY '+
            //              '`user_agent`',
            //     insert: [start, end, start, end, start, end]
            // }
            // async.parallel([
            //     // Piechart function
            //     function(callback) {
            //         new query(piechartQ, {database: database, pool: pool}, function(err,data){
            //             piechart = data;
            //             callback();
            //         });
            //     }
            // ]

        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                        'time,'+
                        '(sum(in_bytes + out_bytes) / 1048576) AS count, '+
                        '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                        '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                    'FROM '+
                        '`conn_meta` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                        'AND `http` > 0 '+
                    'GROUP BY '+
                        'month(from_unixtime(time)),'+
                        'day(from_unixtime(time)),'+
                        'hour(from_unixtime(time))',
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
                            'sum(`count`) AS `count`, '+
                            'max(`time`) AS `time`, '+
                            '`user_agent`,'+
                            '`user_agent` AS `pie_dimension`, '+
                            'sum(`proxy_blocked`) AS proxy_blocked,'+
                            'sum(`ioc_count`) AS `ioc_count` ' +
                        'FROM ' +
                            '`http_user_agent` '+
                        'WHERE ' +
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`user_agent`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'http_by_user_agent_local',
                             val: ['user_agent'], // val: the pre-evaluated values from the query above
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'User Agent', select: 'pie_dimension' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    hide_proxy: req.user.hide_proxy, // NOTE: THIS IS IF ACCESS IS DEFINED IN COLUMNS ABOVE
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'HTTP by User Agent',
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};