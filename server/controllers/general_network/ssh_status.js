'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

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
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`status_code`,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`ssh` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`status_code`',
                insert: [start, end],
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
                    { title: 'Status', select: 'status_code' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'SSH Status'
                }
            }
            var crossfilterQ = {
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
                insert: [start, end]
            }
           
            var piechartQ = {
                query: 'SELECT '+
                         'time,'+
                         '`status_code` AS `pie_dimension`, '+
                         'count(*) AS `count` '+
                     'FROM '+
                         '`ssh` '+
                     'WHERE '+
                         '`time` BETWEEN ? AND ? '+
                         'AND `status_code` !=\'-\' '+
                     'GROUP BY '+
                         '`status_code`',
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