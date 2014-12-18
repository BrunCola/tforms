'use strict';

var dataTable = require('../constructors/datatable'),
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
            var info = [];
            var table1 = {
                query: 'SELECT '+
                            '`time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '`remote_asn`,'+
                            '`remote_asn_name`, '+
                            '`server_name`,'+
                            '`proxy_blocked` '+
                        'FROM '+
                            '`ssl_uniq_server_name` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ?',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'remote2local',
                            // val: the pre-evaluated values from the query above
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Server Name', select: 'server_name' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc', },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'New Remote Servers Detected',
                    hide_stealth: req.user.hide_stealth,
                    hide_proxy: req.user.hide_proxy
                }
            }
            var crossfilterQ = {
                query: 'SELECT '+
                        'count(*) AS count,'+
                        'time,'+
                        '`remote_country` '+
                    'FROM '+
                        '`ssl_uniq_server_name` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        'month(from_unixtime(`time`)),'+
                        'day(from_unixtime(`time`)),'+
                        'hour(from_unixtime(`time`)),'+
                        '`remote_country`',
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