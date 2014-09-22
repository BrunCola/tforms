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
            var tables = [];
            var crossfilter = [];
            var info = [];
            var table1 = {
                query: 'SELECT '+
                            'count(*) AS count,'+
                            'max(date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s")) AS time,'+ // Last Seen
                            '`stealth`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            'sum(`in_packets`) AS in_packets,'+
                            'sum(`out_packets`) AS out_packets,'+
                            'sum(`in_bytes`) AS in_bytes,'+
                            'sum(`out_bytes`) AS out_bytes,'+
                            '`ioc`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection`,'+
                            '`ioc_rule`,'+
                            '`ioc_severity` '+
                        'FROM '+
                            '`conn_ioc` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `ioc_count` > 0 '+
                            'AND `trash` IS NULL '+
                        'GROUP BY '+
                            '`lan_ip`,'+
                            '`ioc`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'ioc_local_drill',
                            val: ['lan_zone','lan_ip'], // val: the pre-evaluated values from the query above
                            crumb: false
                        },
                    },
                    { title: 'Severity', select: 'ioc_severity' },
                    { title: 'IOC Hits', select: 'count' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'Stealth', select: 'stealth', access: [3] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine', select: 'machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Bytes to Remote', select: 'in_bytes'},
                    { title: 'Bytes from Remote', select: 'out_bytes'},
                    { title: 'Packets to Remote', select: 'in_packets', dView: false  },
                    { title: 'Packets from Remote', select: 'out_packets', dView: false  }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Indicators of Compromise (IOC) Notifications'
                }
            }
            var crossfilterQ = {
                query: 'SELECT '+
                            'count(*) as count,'+
                            'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
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
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables,
                    crossfilter: crossfilter
                };
                res.json(results);
            });
        }
    }
};