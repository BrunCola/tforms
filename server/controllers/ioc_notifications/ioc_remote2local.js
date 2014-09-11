'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
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
            if (req.query.remote_ip && req.query.ioc) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'max(date_format(from_unixtime(conn_ioc.time), "%Y-%m-%d %H:%i:%s")) AS time,'+
                                '`lan_zone`,'+
                                '`machine`,'+
                                'conn_ioc.lan_ip,'+
                                '`remote_ip`,'+
                                '`remote_country`,'+
                                '`remote_cc`,'+
                                '`remote_asn_name`,'+
                                'sum(`in_packets`) as in_packets,'+
                                'sum(`out_packets`) as out_packets,'+
                                'sum(`in_bytes`) as in_bytes,'+
                                'sum(`out_bytes`) as out_bytes,'+
                                '`ioc`,'+
                                '`ioc_severity`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                'sum(`ioc_count`) AS ioc_count '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                'conn_ioc.time BETWEEN ? AND ? '+
                                'AND `remote_ip` = ? '+
                                'AND `ioc` = ? '+
                                'AND `ioc_count` > 0 '+
                                'AND `trash` IS NULL '+
                            'GROUP BY '+
                                '`lan_zone`,'+
                                'conn_ioc.lan_ip',
                    insert: [start, end, req.query.remote_ip, req.query.ioc],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'ioc_events_drilldown',
                                val: ['lan_zone','lan_ip','remote_ip','ioc'],
                                crumb: false
                            },
                        },
                        { title: 'Severity', select: 'ioc_severity' },
                        { title: 'IOC Hits', select: 'ioc_count' },
                        { title: 'IOC', select: 'ioc' },
                        { title: 'IOC Type', select: 'ioc_typeIndicator' },
                        { title: 'IOC Stage', select: 'ioc_typeInfection' },
                        { title: 'IOC Rule', select: 'ioc_rule' },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote IP', select: 'remote_ip' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Flag', select: 'remote_cc', },
                        { title: 'Remote ASN', select: 'remote_asn_name' },
                        { title: 'Bytes to Remote', select: 'in_bytes' },
                        { title: 'Bytes from Remote', select: 'out_bytes' },
                        { title: 'Packets to Remote', select: 'in_packets', dView: false },
                        { title: 'Packets from Remote', select: 'out_packets', dView: false },
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Indicators of Compromise (IOC) Notifications'
                    }
                }
                var table2 = {
                    query: 'SELECT '+
                                'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time,'+ 
                                '`stealth_COIs`,'+
                                '`stealth`,'+
                                '`lan_ip`,'+
                                '`event`,'+
                                '`user` '+
                            'FROM '+ 
                                '`endpoint_tracking` '+
                            'WHERE '+ 
                                'stealth > 0 '+
                                'AND event = "Log On"',
                    insert: [],
                    params: [
                        { title: 'Stealth', select: 'stealth' },
                        { title: 'COI Groups', select: 'stealth_COIs' },
                        { title: 'User', select: 'user' }
                    ],
                    settings: {}
                }    
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        new datatable_stealth(table1, table2, parseInt(req.session.passport.user.level), {database: database, pool: pool}, function(err,data){
                            tables.push(data);
                            callback();
                        });
                    }
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err)
                    var results = {
                        info: info,
                        tables: tables
                    };
                    res.json(results);
                });
            } else {
                res.redirect('/');
            }
        }
    }
};