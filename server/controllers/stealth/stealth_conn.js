'use strict';

var datatable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.user.database;
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
            var cf_stealth_conn_v3 = [];
            var cf_stealth_drop_v3 = [];
            var info = [];
            var table1 = {
                query: 'SELECT '+
                            'sum(`count`) AS `count`,'+
                            'max(`time`) AS time,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes,'+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes,'+
                            'sum(`in_packets`) AS in_packets,'+
                            'sum(`out_packets`) AS out_packets '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND lan_ip REGEXP \'192.168.222\' '+
                        'GROUP BY '+
                            '`lan_user`,'+
                            '`lan_zone`,'+
                            '`lan_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'stealth_conn_by_user',
                            val: ['lan_zone','lan_machine','lan_user','lan_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'MB to Remote', select: 'in_bytes' },
                    { title: 'MB from Remote', select: 'out_bytes'},
                    { title: 'Packets to Remote', select: 'in_packets', dView:false },
                    { title: 'Packets from Remote', select: 'out_packets', dView:false },
                    { title: 'Connections', select: 'count', dView:false },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local IP Traffic'
                }
            }
            var table2 = {
                query: 'SELECT '+
                            'sum(`count`) AS `count`,'+
                            'max(`time`) AS time,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes,'+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes,'+
                            'sum(`in_packets`) AS in_packets,'+
                            'sum(`out_packets`) AS out_packets '+
                        'FROM '+
                            '`conn_l7_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND lan_ip REGEXP \'192.168.222\' '+
                        'GROUP BY '+
                            '`lan_user`,'+
                            '`lan_zone`,'+
                            '`lan_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'stealth_conn_by_user',
                            val: ['lan_zone','lan_machine','lan_user','lan_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'MB to Remote', select: 'in_bytes' },
                    { title: 'MB from Remote', select: 'out_bytes'},
                    { title: 'Packets to Remote', select: 'in_packets', dView:false },
                    { title: 'Packets from Remote', select: 'out_packets', dView:false },
                    { title: 'Connections', select: 'count', dView:false },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local IP Traffic'
                }
            }
            var crossfilterQ = {
                query: 'SELECT '+
                            'time,'+
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
                            'time,'+
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
                            'time,'+
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
            var stealth_conn_v3 = {
                query: 'SELECT '+
                            'time,'+
                            '(sum(`in_bytes`)  / 1048576) AS in_bytes4,'+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes4 '+
                        'FROM '+
                            '`conn_l7_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `l7_proto` = "IPsec" '+
                            //'AND `l7_proto` = "testNoWay" '+
                            'AND `in_bytes` > 0 '+
                            'AND `out_bytes` > 0 '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`))',
                insert: [start, end]
            }
            var stealth_drop_v3 = {
                query: 'SELECT '+
                            'time,'+
                            '(`in_bytes`  / 1048576) AS in_bytes5,'+
                            '(`out_bytes` / 1048576) AS out_bytes5 '+
                        'FROM '+
                            '`conn_l7_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND `l7_proto` != "IPsec" '+
                            //'AND `l7_proto` = "testNoWay" '+
                            'AND (`in_bytes` = 0 OR `out_bytes` = 0) '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`))',
                insert: [start, end]
            }
            async.parallel([
                //Table function(s)
                function(callback) {
                    new datatable(table1, {database: database, pool: pool}, function(err,data){
                        tables.push(data);
                        callback();
                    });
                },
                function(callback) {
                    new datatable(table2, {database: database, pool: pool}, function(err,data){
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
                },
                function(callback) { // stealth conn
                    new query(stealth_conn_v3, {database: database, pool: pool}, function(err,data){
                        cf_stealth_conn_v3 = data;
                        callback();
                    });
                },
                function(callback) { // stealth block
                    new query(stealth_drop_v3, {database: database, pool: pool}, function(err,data){
                        cf_stealth_drop_v3 = data;
                        callback();
                    });
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables,
                    crossfilter: crossfilter,
                    cf_stealth_conn: cf_stealth_conn,
                    cf_stealth_drop: cf_stealth_drop,
                    cf_stealth_conn_v3: cf_stealth_conn_v3,
                    cf_stealth_drop_v3: cf_stealth_drop_v3
                };
                res.json(results);
            });
        }

        // crossfilter: function(req, res) {
        //     var get = {
        //         query: 'SELECT '+
        //                 'count(*) as count,'+
        //                 '`time`,'+
        //                 '`remote_country`,'+
        //                 '`ioc_severity`,'+
        //                 '`ioc`, '+
        //                 '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
        //                 '(sum(`out_bytes`) / 1048576) AS out_bytes '+
        //             'FROM '+
        //                 '`conn_ioc` '+
        //             'WHERE '+
        //                 '`time` BETWEEN ? AND ? '+
        //                 'AND `ioc_count` > 0 '+
        //                 'AND `trash` IS NULL '+
        //             'GROUP BY '+
        //                 'month(from_unixtime(`time`)),'+
        //                 'day(from_unixtime(`time`)),'+
        //                 'hour(from_unixtime(`time`)),'+
        //                 '`remote_country`,'+
        //                 '`ioc_severity`,'+
        //                 '`ioc` '+
        //             'ORDER BY '+
        //                 '`ioc_severity` DESC ',
        //         insert: [req.query.start, req.query.end]
        //     }
        //     new query(get, {database: req.user.database, pool: pool}, function(err,data){
        //         if (err) { res.status(500).end(); return }
        //         res.json(data);
        //     });
        // },
        // //////////////////////
        // /////   TABLE   //////
        // //////////////////////
        // table: function(req, res){
        //     var table = {
        //         query: 'SELECT '+
        //                     'max(`time`) AS `time`,'+
        //                     '`lan_stealth`,'+
        //                     '`lan_zone`,'+
        //                     '`lan_machine`,'+
        //                     '`lan_user`,'+
        //                     '`lan_ip`,'+
        //                     '`remote_ip`,'+
        //                     '`remote_asn_name`,'+
        //                     '`remote_country`,'+
        //                     '`remote_cc`,'+
        //                     '`ioc_childID`,'+
        //                     'sum(`in_packets`) AS in_packets,'+
        //                     'sum(`out_packets`) AS out_packets,'+
        //                     'sum(`in_bytes`) AS in_bytes,'+
        //                     'sum(`out_bytes`) AS out_bytes,'+
        //                     '`ioc`,'+
        //                     '`ioc_typeIndicator`,'+
        //                     '`ioc_typeInfection`,'+
        //                     '`ioc_rule`,'+
        //                     '`ioc_severity`,'+
        //                     '`ioc_attrID`,'+
        //                     'sum(`proxy_blocked`) AS proxy_blocked,'+
        //                     'sum(`ioc_count`) AS ioc_count '+
        //                 'FROM '+
        //                     '`conn_ioc` '+
        //                 'WHERE '+
        //                     '`time` BETWEEN ? AND ? '+
        //                     'AND `ioc_count` > 0 '+
        //                     'AND `trash` IS NULL '+
        //                 'GROUP BY '+
        //                     '`lan_zone`,'+
        //                     '`lan_ip`,'+
        //                     '`remote_ip`,'+
        //                     '`ioc`',
        //         insert: [req.query.start, req.query.end],
        //         params: [
        //             {
        //                 title: 'Last Seen',
        //                 select: 'time',
        //                 dView: true,
        //                 link: {
        //                     type: 'ioc_events_drilldown',
        //                     val: ['lan_zone','lan_ip','remote_ip','ioc','ioc_attrID','lan_user','ioc_childID'],
        //                     crumb: false
        //                 },
        //             },
        //             { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
        //             { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
        //             { title: 'Severity', select: 'ioc_severity' },
        //             { title: 'IOC Hits', select: 'ioc_count' },
        //             { title: 'IOC', select: 'ioc' },
        //             { title: 'IOC Type', select: 'ioc_typeIndicator' },
        //             { title: 'IOC Stage', select: 'ioc_typeInfection' },
        //             { title: 'IOC Rule', select: 'ioc_rule' },
        //             { title: 'Zone', select: 'lan_zone' },
        //             { title: 'Local Machine', select: 'lan_machine' },
        //             { title: 'Local User', select: 'lan_user' },
        //             { title: 'Local IP', select: 'lan_ip' },
        //             { title: 'Remote IP', select: 'remote_ip' },
        //             { title: 'Remote Country', select: 'remote_country' },
        //             { title: 'Flag', select: 'remote_cc', },
        //             { title: 'Remote ASN', select: 'remote_asn_name' },
        //             { title: 'Bytes to Remote', select: 'in_bytes'},
        //             { title: 'Bytes from Remote', select: 'out_bytes'},
        //             { title: 'Packets to Remote', select: 'in_packets', dView: true  },
        //             { title: 'Packets from Remote', select: 'out_packets', dView: false  },
        //             {
        //                 title: '',
        //                 select: null,
        //                 dView: true,
        //                 link: {
        //                     type: 'Archive',
        //                 },
        //             }],
        //             settings: {
        //                 sort: [[0, 'desc']],
        //                 div: 'table',
        //                 title: 'Indicators of Compromise (IOC) Notifications',
        //                 hide_stealth: req.user.hide_stealth,
        //                 hide_proxy: req.user.hide_proxys
        //             }
        //     }
        //     new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
        //         if (err) { res.status(500).end(); return }
        //         res.json({table: data});
        //     });
        // }
    }
};