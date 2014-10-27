'use strict';

var dataTable = require('../constructors/datatable'),
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
            var info = [];
            var table1 = {
                query: 'SELECT '+
                            // 'sum(`count`) AS `count`,'+
                            'count(*) AS `count`, '+
                            'max(`time`) AS `time`,'+
                            '`qtype`,'+
                            '`qtype_name`,'+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM ' + 
                            '`dns` '+
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
                    { title: 'Query Type Name', select: 'qtype_name' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'DNS by Query Type',
                    access: req.session.passport.user.level
                }
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new dataTable(table1, {database: database, pool: pool}, function(err,data){
                        tables.push(data);
                        callback();
                    });
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables
                };
                res.json(results);
            });
        }
    }
};