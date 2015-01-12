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
                        '`time`,'+
                        '`remote_country`,'+
                        '`ioc`,'+
                        '`ioc_severity`,'+
                        'sum(`ioc_count`) AS `count` '+
                    'FROM '+
                        '`conn_ioc` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                        'AND `ioc_count` > 0 '+
                        'AND `trash` IS NULL '+
                    'GROUP BY '+
                        'month(from_unixtime(`time`)),'+
                        'day(from_unixtime(`time`)),'+
                        'hour(from_unixtime(`time`)),'+
                        '`remote_country`,'+
                        '`ioc`,'+
                        '`ioc_severity`',
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
                        'max(`time`) AS `time`,'+
                        '`remote_ip`,'+
                        '`remote_asn_name`,'+
                        '`remote_country`,'+
                        '`remote_cc`,'+
                        'sum(`in_packets`) AS `in_packets`,'+
                        'sum(`out_packets`) AS `out_packets`,'+
                        'sum(`in_bytes`) AS `in_bytes`,'+
                        'sum(`out_bytes`) AS `out_bytes`,'+
                        '`ioc_severity`,'+
                        '`ioc`,'+
                        '`ioc_typeIndicator`,'+
                        '`ioc_typeInfection`,'+
                        '`ioc_rule`,'+
                        'sum(`ioc_count`) AS `ioc_count`,'+
                        'sum(`proxy_blocked`) AS `proxy_blocked` '+
                    'FROM '+
                        '`conn_ioc` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                        'AND `ioc_count` > 0 '+
                        'AND `trash` IS NULL '+
                    'GROUP BY '+
                        '`remote_ip`,'+
                        '`ioc`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'ioc_remote2local',
                            val: ['remote_ip','ioc'],
                            crumb: false
                        },
                    },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Severity', select: 'ioc_severity' },
                    { title: 'IOC Hits', select: 'ioc_count' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                    { title: 'Bytes to Remote', select: 'in_bytes' },
                    { title: 'Bytes from Remote', select: 'out_bytes' },
                    { title: 'Packets to Remote', select: 'in_packets', dView: false },
                    { title: 'Packets from Remote', select: 'out_packets', dView: false },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Indicators of Compromise (IOC) Notifications',
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