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
                            'time, '+ // Last Seen
                            '(sum(in_bytes + out_bytes) / 1048576) AS count, '+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                        'FROM `conn_l7_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_ip` = ? '+
                        'GROUP BY '+
                            'month(from_unixtime(time)),'+
                            'day(from_unixtime(time)),'+
                            'hour(from_unixtime(time))',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip]
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
                            'sum(`count`) AS `count`, '+
                            'max(`time`) AS `time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`, '+
                            '`lan_machine`,'+
                            '`lan_user`, '+
                            '`lan_ip`, '+
                            '`l7_proto`, '+
                            'sum(`in_packets`) AS in_packets, '+
                            'sum(`out_packets`) AS out_packets, '+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes, '+
                            'sum(`dns`) AS `dns`, '+
                            'sum(`http`) AS `http`, '+
                            'sum(`ssl`) AS `ssl`, '+
                            'sum(`ftp`) AS `ftp`, '+
                            'sum(`irc`) AS `irc`, '+
                            'sum(`smtp`) AS `smtp`, '+
                            'sum(`file`) AS `file`, '+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM '+
                            '`conn_l7_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_ip` = ? '+
                        'GROUP BY '+
                            '`l7_proto`',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip],
                params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'l7_local_drill',
                                val: ['lan_zone','lan_ip','l7_proto'], // val: the pre-evaluated values from the query above
                                crumb: false
                            },
                        },
                        { title: 'Applications', select: 'l7_proto' },
                        { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1]},
                        { title: 'Zone', select: 'lan_zone', dView:false },
                        { title: 'Local Machine', select: 'lan_machine', dView:false },
                        { title: 'Local User', select: 'lan_user', dView:false },
                        { title: 'Local IP', select: 'lan_ip', dView:false },
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
                    title: 'Local IP Bandwidth Usage',
                    hide_stealth: req.user.hide_stealth
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};