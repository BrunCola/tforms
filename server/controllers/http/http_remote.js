'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    query = require('../constructors/query'),
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
                        'sum(`count`) AS `count`,'+
                        'max(`time`) AS `time`,'+
                        '`remote_ip`,'+
                        '`remote_ip` AS pie_dimension,'+
                        '`remote_port`,'+
                        '`remote_cc`,'+
                        '`remote_country`,'+
                        '`remote_asn_name`,'+
                        'sum(`proxy_blocked`) AS proxy_blocked,'+
                        'sum(`ioc_count`) AS `ioc_count` ' +
                    'FROM ' +
                        '`http_remote` '+
                    'WHERE ' +
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        '`remote_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'http_remote2local',
                             val: ['remote_ip'],
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'ABP', select: 'proxy_blocked', access: [2] },
                    { title: 'Remote IP', select: 'pie_dimension'},
                    { title: 'Remote port', select: 'remote_port' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Remote ASN Name', select: 'remote_asn_name' },
                    { title: 'IOC Count', select: 'ioc_count' },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Remote HTTP',
                    access: req.session.passport.user.level
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
                            'AND `http` > 0 '+
                        'GROUP BY '+
                            'month(from_unixtime(time)),'+
                            'day(from_unixtime(time)),'+
                            'hour(from_unixtime(time))',
                insert: [start, end]
            }
            var piechartQ = {
                query: 'SELECT '+
                         'time,'+
                         '`remote_ip` AS `pie_dimension`, '+
                         'sum(`count`) AS `count` '+
                     'FROM '+
                         '`http_remote` '+
                     'WHERE '+
                         '`time` BETWEEN ? AND ? '+
                         'AND `remote_ip` !=\'-\' '+
                     'GROUP BY '+
                         '`remote_ip`',
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