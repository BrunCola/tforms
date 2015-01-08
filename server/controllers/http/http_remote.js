'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    query = require('../constructors/query'),
    async = require('async');

module.exports = function(pool) {
    return {
            // var piechartQ = {
            //     query: 'SELECT '+
            //              'time,'+
            //              '`remote_ip` AS `pie_dimension`, '+
            //              'sum(`count`) AS `count` '+
            //          'FROM '+
            //              '`http_remote` '+
            //          'WHERE '+
            //              '`time` BETWEEN ? AND ? '+
            //              'AND `remote_ip` !=\'-\' '+
            //          'GROUP BY '+
            //              '`remote_ip`',
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
                insert: [req.query.start, req.query.end],
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
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
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
                    hide_proxy: req.user.hide_proxy
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};