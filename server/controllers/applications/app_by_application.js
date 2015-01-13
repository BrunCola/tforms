'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
    return {
        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                        'time,'+
                        '`l7_proto`, '+
                        '(sum(in_bytes + out_bytes) / 1048576) AS count, '+
                        '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                        '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                    'FROM '+
                        '`conn_l7_proto` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        'month(from_unixtime(time)),'+
                        'day(from_unixtime(time)),'+
                        'hour(from_unixtime(time)),'+
                        '`l7_proto`',
                insert: [req.query.start, req.query.end]
            }
            new query(get, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        crossfilterpie: function(req, res) {
            var piechart = {
                query: 'SELECT '+
                            'time,'+
                            '`l7_proto` AS `pie_dimension`, '+
                            '(sum(in_bytes + out_bytes) / 1048576) AS `count` '+
                        'FROM '+
                            '`conn_l7_proto` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `l7_proto` !=\'-\' '+
                        'GROUP BY '+
                            '`l7_proto`',
                insert: [req.query.start, req.query.end]
            }
            new query(piechart, {database: req.user.database, pool: pool}, function(err,data){
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
                            'sum(`count`) AS `count`, '+
                            'max(`time`) AS `time`,'+ // LASt Seen
                            '`l7_proto`,'+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes, '+
                            'sum(`in_packets`) AS in_packets, '+
                            'sum(`out_packets`) AS out_packets, '+
                            'sum(`dns`) AS `dns`, '+
                            'sum(`http`) AS `http`, '+
                            'sum(`ssl`) AS `ssl`, '+
                            'sum(`ftp`) AS `ftp`, '+
                            'sum(`irc`) AS `irc`, '+
                            'sum(`smtp`) AS `smtp`, '+
                            'sum(`file`) AS `file`, '+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM '+
                            '`conn_l7_proto` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `l7_proto` !=\'-\' '+
                        'GROUP BY '+
                            '`l7_proto`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'application_drill',
                            val: ['l7_proto'],
                            crumb: false
                        },
                    },
                    { title: 'Applications', select: 'l7_proto' },
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
                    sort: [[2, 'desc']],
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