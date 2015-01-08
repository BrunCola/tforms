'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {          
            // var piechartQ = {
            //     query: 'SELECT '+
            //                 'time,'+
            //                 '`mime` AS `pie_dimension`, '+
            //                 'count(*) AS `count` '+
            //             'FROM '+
            //                 '`file_mime` '+
            //             'WHERE '+
            //                 '`time` BETWEEN ? AND ? '+
            //                 'AND `mime` !=\'-\' '+
            //             'GROUP BY '+
            //                 '`mime`',
            //     insert: [start, end]
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
                            'count(*) AS count,'+
                            'time '+
                        'FROM '+
                            '`file_mime` '+
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
                            'sum(`count`) AS `count`,'+
                            'max(`time`) AS `time`,'+
                            '`mime`, '+
                            '`mime` AS `pie_dimension`, '+
                            '(sum(`size`) / 1048576) AS size,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`file_mime` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`mime`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'files_mime_local',
                            val: ['mime'],
                            crumb: false
                        },
                    },
                    { title: 'Total Extracted Files', select: 'count' },
                    { title: 'File Type', select: 'pie_dimension' },
                    { title: 'Total Size (MB)', select: 'size' },
                    { title: 'Total IOC Hits', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Extracted File Types'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};