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
            //                 '`remote_ip` AS `pie_dimension`, '+
            //                 'sum(`count`) AS `count` '+
            //             'FROM '+
            //                 '`file_remote` '+
            //             'WHERE '+
            //                 '`time` BETWEEN ? AND ? '+
            //                 'AND `remote_ip` !=\'-\' '+
            //             'GROUP BY '+
            //                 '`remote_ip`',
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
                            '`file` '+
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
                            '`remote_ip`,'+
                            '`remote_ip` AS pie_dimension,'+
                            '`remote_asn`,'+
                            '`remote_asn_name`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '(sum(`size`) / 1048576) AS size,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`file_remote` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`remote_ip`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'files_by_file_name_remote',
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Total Extracted Files', select: 'count' },
                    { title: 'Remote IP', select: 'pie_dimension' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'ASN', select: 'remote_asn' },
                    { title: 'ASN Name', select: 'remote_asn_name' },
                    { title: 'Total Size (MB)', select: 'size' },
                    { title: 'Total IOC Hits', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Extracted Files From Remote IPs'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};