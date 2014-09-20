'use strict';

var datatable = require('../constructors/datatable'),
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
            var cf_stealth_conn = [];
            var cf_stealth_drop = [];
            var info = [];
            var table1 = {
                query: 'SELECT '+
                            'sum(`count`) AS `count`,'+
                            'max(date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s")) AS time,'+
                            '`stealth`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes,'+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes,'+
                            'sum(`in_packets`) AS in_packets,'+
                            'sum(`out_packets`) AS out_packets,'+
                            'sum(`dns`) AS `dns`,'+
                            'sum(`http`) AS `http`,'+
                            'sum(`ssl`) AS `ssl`,'+
                            'sum(`ssh`) AS `ssh`,'+
                            'sum(`ftp`) AS `ftp`,'+
                            'sum(`irc`) AS `irc`,'+
                            'sum(`smtp`) AS `smtp`,'+
                            'sum(`file`) AS `file`,'+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM '+
                            '`conn_local` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`lan_user`,'+
                            '`lan_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'local_COI_remote_drill',
                            // val: the pre-evaluated values from the query above
                            val: ['lan_ip','lan_user'],
                            crumb: false
                        },
                    },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Stealth', select: 'stealth' },
                    { title: 'Machine Name', select: 'machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
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
                    { title: 'File', select: 'file', dView:false },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local IP Traffic'
                }
            }

            var crossfilterQ = {
                query: 'SELECT '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time,'+
                            '(sum(`in_bytes` + `out_bytes`) / 1048576) AS count, '+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                        'FROM '+
                            '`conn_local` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`))',
                insert: [start, end]
            }

            var stealth_conn = {
                query: 'SELECT '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time,'+
                            '(sum(`in_bytes`)  / 1048576) AS in_bytes2,'+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes2 '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `in_bytes` > 0 '+
                            'AND `out_bytes` > 0 '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`))',
                insert: [start, end]
            }
            var stealth_drop = {
                query: 'SELECT '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time,'+
                            '(`in_bytes`  / 1048576) AS in_bytes3,'+
                            '(`out_bytes` / 1048576) AS out_bytes3 '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND (`in_bytes` = 0 OR `out_bytes` = 0) '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`))',
                insert: [start, end]
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new datatable(table1, {database: database, pool: pool}, function(err,data){
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
                function(callback) { // stealth conn
                    new query(stealth_conn, {database: database, pool: pool}, function(err,data){
                        cf_stealth_conn = data;
                        callback();
                    });
                },
                function(callback) { // stealth block
                    new query(stealth_drop, {database: database, pool: pool}, function(err,data){
                        cf_stealth_drop = data;
                        callback();
                    });
                }
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables,
                    crossfilter: crossfilter,
                    cf_stealth_conn: cf_stealth_conn,
                    cf_stealth_drop: cf_stealth_drop
                };
                res.json(results);
            });
        }
    }
};