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
            //              '`remote_ip` AS `pie_dimension`, '+
            //              'sum(`count`) AS `count` '+
            //          'FROM '+
            //              '`conn_l7_remote` '+
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
                        '`conn_l7_remote` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
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
                        '`remote_country`,'+
                        '`remote_cc`,'+
                        '`remote_asn_name`,'+
                        '(sum(`in_bytes`) / 1048576) AS `in_bytes`,'+
                        '(sum(`out_bytes`) / 1048576) AS `out_bytes`,'+
                        'sum(`in_packets`) AS `in_packets`,'+
                        'sum(`out_packets`) AS `out_packets`,'+
                        'sum(`dns`) AS `dns`,'+
                        'sum(`http`) AS `http`,'+
                        'sum(`ssl`) AS `ssl`,'+
                        'sum(`ftp`) AS `ftp`,'+
                        'sum(`irc`) AS `irc`,'+
                        'sum(`smtp`) AS `smtp`,'+
                        'sum(`file`) AS `file`,'+
                        'sum(`ioc_count`) AS `ioc_count` '+
                    'FROM '+
                        '`conn_l7_remote` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                        'AND `l7_proto` !=\'-\' '+
                    'GROUP BY '+
                        '`remote_ip`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'l7_remote_app',
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Remote IP', select: 'pie_dimension' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                    { title: 'MB to Remote', select: 'in_bytes' },
                    { title: 'MB from Remote', select: 'out_bytes' },
                    { title: 'Packets to Remote', select: 'in_packets', dView: false },
                    { title: 'Packets from Remote', select: 'out_packets', dView: false },
                    { title: 'IOC Count', select: 'ioc_count' },
                    { title: 'Connections', select: 'count' },
                    { title: 'DNS', select: 'dns' },
                    { title: 'HTTP', select: 'http' },
                    { title: 'SSL', select: 'ssl' },
                    { title: 'FTP', select: 'ftp' },
                    { title: 'IRC', select: 'irc' },
                    { title: 'SMTP', select: 'smtp' },
                    { title: 'File', select: 'file' },
                ],
                settings: {
                    sort: [[6, 'desc']],
                    div: 'table',
                    title: 'Application Bandwidth Usage'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};