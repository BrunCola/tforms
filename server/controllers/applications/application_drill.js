'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.session.passport.user.database;
            // var database = null;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            if (req.query.l7_proto) {
                //var results = [];
                var tables = [];
                var crossfilter = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'sum(`count`) AS `count`,'+
                                'max(`time`) AS `time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`l7_proto`,'+
                                'sum(`in_packets`) AS in_packets,'+
                                'sum(`out_packets`) AS out_packets,'+
                                '(sum(`in_bytes`) / 1048576) AS in_bytes,'+
                                '(sum(`out_bytes`) / 1048576) AS out_bytes,'+
                                'sum(`dns`) AS `dns`,'+
                                'sum(`http`) AS `http`,'+
                                'sum(`ssl`) AS `ssl`,'+
                                'sum(`ftp`) AS `ftp`,'+
                                'sum(`irc`) AS `irc`,'+
                                'sum(`smtp`) AS `smtp`,'+
                                'sum(`file`) AS `file`,'+
                                'sum(`ioc_count`) AS `ioc_count` '+
                            'FROM '+
                                '`conn_l7_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `l7_proto` = ? '+
                            'GROUP BY '+
                                '`lan_zone`,'+
                                '`lan_ip`',
                    insert: [start, end, req.query.l7_proto],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'application_local',
                                val: ['lan_zone','lan_ip','l7_proto'],
                                crumb: false
                            },
                        },
                        { title: 'Applications', select: 'l7_proto' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'MB to Remote', select: 'in_bytes' },
                        { title: 'MB from Remote', select: 'out_bytes'},
                        { title: 'Packets to Remote', select: 'in_packets', dView:false },
                        { title: 'Packets from Remote', select: 'out_packets', dView:false },
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
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local IP Bandwidth Usage'
                    }
                }
                var crossfilterQ = {
                    query: 'SELECT '+
                                'time, '+ // Last Seen
                                '(sum(in_bytes + out_bytes) / 1048576) AS count, '+
                                '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                                '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                            'FROM '+
                                '`conn_l7_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `l7_proto` = ? '+
                            'GROUP BY '+
                                'month(from_unixtime(time)),'+
                                'day(from_unixtime(time)),'+
                                'hour(from_unixtime(time))',
                    insert: [start, end, req.query.l7_proto],
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
                    }
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err)
                    var results = {
                        info: info,
                        tables: tables,
                        crossfilter: crossfilter
                    };
                    res.json(results);
                });
            } else {
                res.redirect('/');
            }
        }
    }
};