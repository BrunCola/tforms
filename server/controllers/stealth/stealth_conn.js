'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        crossfilter: function(req, res) {
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
                insert: [req.query.start, req.query.end]
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
                insert: [req.query.start, req.query.end]
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
                insert: [req.query.start, req.query.end]
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
                insert: [req.query.start, req.query.end]
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
                insert: [req.query.start, req.query.end]
            }
            var crossfilter,cf_stealth_conn,cf_stealth_drop,cf_stealth_conn_v3,cf_stealth_drop_v3;
            async.parallel([
                // Crossfilter function
                function(callback) {
                    new query(crossfilterQ, {database: req.user.database, pool: pool}, function(err,data){
                        crossfilter = data;
                        callback();
                    });
                },
                function(callback) { // stealth conn
                    new query(stealth_conn, {database: req.user.database, pool: pool}, function(err,data){
                        cf_stealth_conn = data;
                        callback();
                    });
                },
                function(callback) { // stealth block
                    new query(stealth_drop, {database: req.user.database, pool: pool}, function(err,data){
                        cf_stealth_drop = data;
                        callback();
                    });
                },
                function(callback) { // stealth conn
                    new query(stealth_conn_v3, {database: req.user.database, pool: pool}, function(err,data){
                        cf_stealth_conn_v3 = data;
                        callback();
                    });
                },
                function(callback) { // stealth block
                    new query(stealth_drop_v3, {database: req.user.database, pool: pool}, function(err,data){
                        cf_stealth_drop_v3 = data;
                        callback();
                    });
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) { res.status(500).end(); return }
                var data = crossfilter.concat(cf_stealth_conn,cf_stealth_drop,cf_stealth_conn_v3,cf_stealth_drop_v3);
                res.json(data);
            });
        },
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table_v3 = {
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
                insert: [req.query.start, req.query.end],
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
            var table_v2 = {
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
                insert: [req.query.start, req.query.end],
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
            var table_data1 = [];
            var table_data2 = [];
            async.parallel([
                function(callback) { // stealth conn
                    new dataTable(table_v2, {database: req.user.database, pool: pool}, function(err,data){
                        table_data1 = data;
                        callback();
                    });
                },
                function(callback) { // stealth block
                    new dataTable(table_v3, {database: req.user.database, pool: pool}, function(err,data){
                        table_data2 = data;
                        callback();
                    });
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) { res.status(500).end(); return }
                table_data1.aaData = table_data1.aaData.concat(table_data2.aaData);
                res.json({table: table_data1});
            });
        }
    }
};