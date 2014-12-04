'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.session.passport.user.database;
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
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'dns_by_query_type_local', 
                             // val: the pre-evaluated values from the query above
                             val: ['qtype'],
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Query Type', select: 'qtype' },
                    { title: 'Query Type Name', select: 'pie_dimension' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'DNS by Query Type',
                    access: req.session.passport.user.level
                }
            }
            var crossfilterQ = {
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
                        '`qtype`',
                insert: [start, end]
            }
            var piechartQ = {
                query: 'SELECT '+
                         'time,'+
                         '`qtype_name` AS `pie_dimension`, '+
                         'count(*) AS `count` '+
                     'FROM '+
                         '`dns_query_type` '+
                     'WHERE '+
                         '`time` BETWEEN ? AND ? '+
                         'AND `qtype_name` !=\'-\' '+
                     'GROUP BY '+
                         '`qtype_name`',
                insert: [start, end, start, end, start, end]
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new dataTable(table1, {database: database, pool: pool}, function(err,data){
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