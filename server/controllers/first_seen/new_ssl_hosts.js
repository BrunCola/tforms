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
                            'ssl_uniq_remote_ip.time as `time`,'+
                            '`stealth`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
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
                            '`ssl_uniq_remote_ip` '+
                        'WHERE '+
                            'ssl_uniq_remote_ip.time BETWEEN ? AND ?',
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
                    { title: 'Stealth', select: 'stealth', access: [3] },
                    { title: 'ABP', select: 'proxy_blocked', access: [2] },
                    { title: 'Server Name', select: 'server_name' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc', },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine', select: 'machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'New Remote IP Addresses Detected'
                }
            }
            var crossfilterQ = {
                query: 'SELECT '+
                        'count(*) AS count,'+
                        'time,'+
                        '`remote_country` '+
                    'FROM '+
                        '`ssl_uniq_remote_ip` '+
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