'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {           
            // var piechartQ = {
            //     query: 'SELECT '+
            //              'time,'+
            //              '`status_code` AS `pie_dimension`, '+
            //              'count(*) AS `count` '+
            //          'FROM '+
            //              '`ssh` '+
            //          'WHERE '+
            //              '`time` BETWEEN ? AND ? '+
            //              'AND `status_code` !=\'-\' '+
            //          'GROUP BY '+
            //              '`status_code`',
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
            // ], 

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
                        'AND `ssh` > 0 '+
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
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`status_code`, '+
                            '`status_code` AS `pie_dimension`, '+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`ssh` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`status_code`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'ssh_status_local', 
                            val: ['status_code'],
                            crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Status', select: 'pie_dimension' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'SSH Status'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};