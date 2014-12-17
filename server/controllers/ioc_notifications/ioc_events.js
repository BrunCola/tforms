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
                        'count(*) as count,'+
                        '`time`,'+
                        '`remote_country`,'+
                        '`ioc_severity`,'+
                        '`ioc`, '+
                        '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                        '(sum(`out_bytes`) / 1048576) AS out_bytes '+
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
                        '`ioc_severity`,'+
                        '`ioc` '+
                    'ORDER BY '+
                        '`ioc_severity` DESC ',
                insert: [req.query.start, req.query.end]
            }
            new query(get, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json(data);
            });
        },
        //////////////////////
        //////// VARS ////////
        //////////////////////
        ioc_notifications: function(req, res) {
            new query({query: 'SELECT count(*) AS count FROM `conn_ioc` WHERE (time between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json(data[0]);
            });
        },
        ioc_groups: function(req, res) {
            new query({query: 'SELECT `ioc` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `ioc`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        local_ips: function(req, res) {
            new query({query: 'SELECT `lan_ip` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `lan_zone`,`lan_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        remote_ip: function(req, res) {
            new query({query: 'SELECT `remote_ip` FROM `conn_ioc` WHERE (`time` between ? AND ?) AND `ioc_count` > 0 AND trash IS NULL GROUP BY `remote_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        remote_country: function(req, res) {
            new query({query: 'SELECT `remote_country` FROM `conn_ioc` WHERE (`time` BETWEEN ? AND ?) AND ioc_count > 0 AND `trash` IS NULL GROUP BY `remote_country`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        query: function(req, res) {
            new query({query: 'SELECT `query` FROM `dns_ioc` WHERE (`time` BETWEEN ? AND ?) GROUP BY `query`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        host: function(req, res) {
            new query({query: 'SELECT `host` FROM `http_ioc` WHERE (`time` BETWEEN ? AND ?) GROUP BY `host`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        remote_ip_ssl: function(req, res) {
            new query({query: 'SELECT `remote_ip` FROM `ssl_ioc` WHERE (`time` BETWEEN ? AND ?) GROUP BY `remote_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        name: function(req, res) {
            new query({query: 'SELECT `name` FROM `file_ioc` WHERE (`time` BETWEEN ? AND ?) GROUP BY `name`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        l7_proto: function(req, res) {
            new query({query: 'SELECT `l7_proto` FROM `conn_ioc` WHERE (`time` BETWEEN ? AND ?) AND `ioc_count` > 0 AND `trash` IS NULL GROUP BY `l7_proto`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        // Info function(s) --- Network
        conn_meta: function(req, res) {
            new query({query: 'SELECT `lan_ip` FROM `conn_meta` WHERE (`time` BETWEEN ? AND ?) GROUP BY `lan_zone`,`lan_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        remote_ip_conn_meta: function(req, res) {
            new query({query: 'SELECT `remote_ip` FROM `conn_meta` WHERE (`time` BETWEEN ? AND ?) GROUP BY `remote_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        remote_country_conn_meta: function(req, res) {
            new query({query: 'SELECT `remote_country` FROM `conn_meta` WHERE (`time` BETWEEN ? AND ?) GROUP BY `remote_country`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        bandwidth_in: function(req, res) {
            new query({query: 'SELECT ROUND(((sum(`in_bytes`) / 1048576) / (? - ?)) * 8000,2) AS `bandwidth` FROM `conn_local` WHERE `time` BETWEEN ? AND ?', insert: [req.query.end, req.query.start, req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json(data[0]);
            });
        },
        bandwidth_out: function(req, res) {
            new query({query: 'SELECT ROUND(((sum(`out_bytes`) / 1048576) / (? - ?)) * 8000,2) AS `bandwidth` FROM `conn_local` WHERE `time` BETWEEN ? AND ?', insert: [req.query.end, req.query.start, req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json(data[0]);
            });
        },
        new_ip: function(req, res) {
            new query({query: 'SELECT `remote_ip` FROM `conn_uniq_remote_ip` WHERE (`time` BETWEEN ? AND ?) GROUP BY `remote_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        new_dns: function(req, res) {
            new query({query: 'SELECT `query` FROM `dns_uniq_query` WHERE (`time` BETWEEN ? AND ?) GROUP BY `query`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        new_http: function(req, res) {
            new query({query: 'SELECT `host` FROM `http_uniq_host` WHERE (`time` BETWEEN ? AND ?) GROUP BY `host`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        new_ssl: function(req, res) {
            new query({query: 'SELECT `remote_ip` FROM `ssl_uniq_server_name` WHERE (`time` BETWEEN ? AND ?) GROUP BY `remote_ip`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        new_layer7: function(req, res) {
            new query({query: 'SELECT `l7_proto` FROM `conn_l7_proto` WHERE (`time` BETWEEN ? AND ?) GROUP BY `l7_proto`', insert: [req.query.start, req.query.end]}, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({count: data.length});
            });
        },
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            'max(`time`) AS `time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`remote_asn_name`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '`ioc_childID`,'+
                            'sum(`in_packets`) AS in_packets,'+
                            'sum(`out_packets`) AS out_packets,'+
                            'sum(`in_bytes`) AS in_bytes,'+
                            'sum(`out_bytes`) AS out_bytes,'+
                            '`ioc`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection`,'+
                            '`ioc_rule`,'+
                            '`ioc_severity`,'+
                            '`ioc_attrID`,'+
                            'sum(`proxy_blocked`) AS proxy_blocked,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`conn_ioc` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `ioc_count` > 0 '+
                            'AND `trash` IS NULL '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`ioc`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'ioc_events_drilldown',
                            val: ['lan_zone','lan_ip','remote_ip','ioc','ioc_attrID','lan_user','ioc_childID'],
                            crumb: false
                        },
                    },
                    { title: 'Stealth', select: 'lan_stealth', access: [3] },
                    { title: 'ABP', select: 'proxy_blocked', access: [2] },
                    { title: 'Severity', select: 'ioc_severity' },
                    { title: 'IOC Hits', select: 'ioc_count' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc', },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                    { title: 'Bytes to Remote', select: 'in_bytes'},
                    { title: 'Bytes from Remote', select: 'out_bytes'},
                    { title: 'Packets to Remote', select: 'in_packets', dView: true  },
                    { title: 'Packets from Remote', select: 'out_packets', dView: false  },
                    {
                        title: '',
                        select: null,
                        dView: true,
                        link: {
                            type: 'Archive',
                        },
                    },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Indicators of Compromise (IOC) Notifications',
                    access: req.user.level
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500); return }
                res.json({table: data});
            });
        }
    }
};