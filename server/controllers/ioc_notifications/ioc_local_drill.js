'use strict';

var dataTable = require('../constructors/datatable'),
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
            if (req.query.lan_zone && req.query.lan_ip) {
                var tables = [];
                var crossfilter = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'count(*) AS count,'+
                                'max(`time`) AS time,'+
                                '`ioc_severity`,'+
                                '`ioc`,'+
                                '`ioc_attrID`,'+
                                '`ioc_rule`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`remote_ip`,'+
                                '`remote_country`,'+
                                '`remote_cc`,'+
                                '`remote_asn_name`,'+
                                'sum(`in_packets`) AS in_packets,'+
                                'sum(`out_packets`) AS out_packets,'+
                                'sum(`in_bytes`) AS in_bytes,'+
                                'sum(`out_bytes`) AS out_bytes,'+
                                'sum(`proxy_blocked`) AS proxy_blocked '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `ioc_count` > 0 '+
                                'AND `trash` IS NULL '+
                            'GROUP BY '+
                                '`remote_ip`,'+
                                '`ioc`',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'ioc_events_drilldown',
                                val: ['lan_zone','lan_ip','remote_ip','ioc','ioc_attrID'],
                                crumb: false
                            },
                        },
                        { title: 'IOC Hits', select: 'count' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'ABP', select: 'proxy_blocked', access: [2] },
                        { title: 'Severity', select: 'ioc_severity' },
                        { title: 'IOC', select: 'ioc' },
                        { title: 'IOC Type', select: 'ioc_typeIndicator' },
                        { title: 'IOC Stage', select: 'ioc_typeInfection' },
                        { title: 'IOC Rule', select: 'ioc_rule' },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote IP', select: 'remote_ip' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote ASN ', select: 'remote_asn_name' },
                        { title: 'Bytes to Remote', select: 'in_bytes'},
                        { title: 'Bytes from Remote', select: 'out_bytes'},
                        { title: 'Packets to Remote', select: 'in_packets', dView: false },
                        { title: 'Packets from Remote', select: 'out_packets', dView: false },
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Indicators of Compromise (IOC) Notifications',
                        access: req.session.passport.user.level
                    }
                }
                var crossfilterQ = {
                    query: 'SELECT '+
                                'count(*) as count,'+
                                '`time`,'+
                                '`ioc_severity`,'+
                                '`ioc` '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `ioc_count` > 0 '+
                                'AND `trash` IS NULL '+
                            'GROUP BY '+
                                'month(from_unixtime(time)),'+
                                'day(from_unixtime(time)),'+
                                'hour(from_unixtime(time)),'+
                                'ioc,'+
                                'ioc_severity',
                    insert: [start, end]
                }
                var crossfilterQ = {
                    query: 'SELECT '+
                                'count(*) as count,'+
                                '`time`,'+
                                '`ioc`,'+
                                '`ioc_severity` '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `ioc_count` > 0 '+
                                'AND `trash` IS NULL '+
                            'GROUP BY '+
                                'month(from_unixtime(time)),'+
                                'day(from_unixtime(time)),'+
                                'hour(from_unixtime(time)),'+
                                'ioc,'+
                                'ioc_severity',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip]
                }
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        console.log(table1.query);
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
