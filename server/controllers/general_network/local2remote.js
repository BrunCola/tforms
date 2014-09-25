'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async');
    query = require('../constructors/query'),

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
            if (req.query.lan_zone && req.query.lan_ip) {
                var tables = [];
                var crossfilter = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'sum(`count`) AS `count`,'+
                                'max(`time`) as `time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`remote_ip`,'+
                                '`remote_asn_name`,'+
                                '`remote_country`,'+
                                '`remote_cc`,'+
                                '(sum(in_bytes) / 1048576) as in_bytes,'+
                                '(sum(out_bytes) / 1048576) as out_bytes,'+
                                'sum(in_packets) as in_packets,'+
                                'sum(out_packets) as out_packets,'+
                                'sum(`dns`) AS `dns`,'+
                                'sum(`http`) AS `http`,'+
                                'sum(`ssl`) AS `ssl`,'+
                                'sum(`ssh`) AS `ssh`,'+
                                'sum(`ftp`) AS `ftp`,'+
                                'sum(`irc`) AS `irc`,'+
                                'sum(`smtp`) AS `smtp`,'+
                                'sum(`file`) AS `file`,'+
                                'sum(`proxy_blocked`) AS proxy_blocked,'+
                                'sum(`ioc_count`) AS `ioc_count` '+
                            'FROM '+
                                '`conn_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'GROUP BY '+
                                '`remote_ip`',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'shared',
                                val: ['lan_ip','lan_zone','remote_ip'],
                                crumb: false
                            }
                        },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'ABP', select: 'proxy_blocked', access: [2] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine Name', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote IP', select: 'remote_ip' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Flag', select: 'remote_cc', },
                        { title: 'Remote ASN', select: 'remote_asn_name' },
                        { title: 'MB to Remote', select: 'in_bytes' },
                        { title: 'MB from Remote', select: 'out_bytes'},
                        { title: 'Packets to Remote', select: 'in_packets', dView:false },
                        { title: 'Packets from Remote', select: 'out_packets', dView:false },
                        { title: 'IOC Hits', select: 'ioc_count' },
                        { title: 'Connections', select: 'count', dView:false },
                        { title: 'DNS', select: 'dns', dView:false },
                        { title: 'HTTP', select: 'http', dView:false },
                        { title: 'SSL', select: 'ssl', dView:false },
                        { title: 'SSH', select: 'ssh', dView:false },
                        { title: 'FTP', select: 'ftp', dView:false },
                        { title: 'IRC', select: 'irc', dView:false },
                        { title: 'SMTP', select: 'smtp', dView:false },
                        { title: 'File', select: 'file', dView:false }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local IP/Remote IP Traffic',
                        access: req.session.passport.user.level
                    }
                }
                var crossfilterQ = {
                    query: 'SELECT '+
                                '`time`,'+
                                '(sum(`in_bytes` + `out_bytes`) / 1048576) AS count,'+
                                '`remote_country`, '+
                                '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                                '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                            'FROM '+
                                '`conn_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'GROUP BY '+
                                'month(from_unixtime(`time`)),'+
                                'day(from_unixtime(`time`)),'+
                                'hour(from_unixtime(`time`)),'+
                                '`remote_country`',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip]
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