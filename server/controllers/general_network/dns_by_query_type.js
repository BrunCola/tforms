'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
            // var piechartQ = {
            //     query: 'SELECT '+
            //              'sum(`count`) AS `count`,'+
            //              '`time`,'+
            //              '`qtype_name` AS `pie_dimension` '+
            //          'FROM '+
            //              '`dns_query_type` '+
            //          'WHERE '+
            //              '`time` BETWEEN ? AND ? '+
            //              'AND `qtype_name` !=\'-\' '+
            //          'GROUP BY '+
            //              '`qtype_name`',
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
            // ])        


        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                        'sum(`count`) AS count,'+
                        'time,'+
                        '`qtype`,'+
                        '`qtype_name` '+
                    'FROM '+
                        '`dns_query_type` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        'month(from_unixtime(`time`)),'+
                        'day(from_unixtime(`time`)),'+
                        'hour(from_unixtime(`time`)),'+
                        '`qtype_name`',
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
                            'max(`time`) AS `time`,'+
                            '`qtype`,'+
                            '`qtype_name`, '+
                            '`qtype_name` AS `pie_dimension`, '+
                            'sum(`count`) AS `count`,'+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM ' + 
                            '`dns_query_type` '+
                        'WHERE ' +
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`qtype`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'dns_by_query_type_local', 
                             val: ['qtype'],
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Query Type', select: 'pie_dimension' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'DNS by Query Type'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};