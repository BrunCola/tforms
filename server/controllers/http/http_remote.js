'use strict';

var dataTable = require('../constructors/datatable'),
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
            var info = [];
            var table1 = {
                query: 'SELECT '+
                        'sum(`count`) AS `count`,'+
                        'time,'+
                        '`remote_ip`,'+
                        '`remote_port`,'+
                        '`remote_cc`,'+
                        '`remote_country`,'+
                        '`remote_asn_name`,'+
                        'sum(`proxy_blocked`) AS proxy_blocked,'+
                        'sum(`ioc_count`) AS `ioc_count` ' +
                    'FROM ' +
                        '`http_remote` '+
                    'WHERE ' +
                        'time BETWEEN ? AND ? '+
                    'GROUP BY '+
                        '`remote_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'http_remote2local',
                             val: ['remote_ip'],
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'ABP', select: 'proxy_blocked', access: [2] },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote port', select: 'remote_port' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Remote ASN Name', select: 'remote_asn_name' },
                    { title: 'IOC Count', select: 'ioc_count' },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Remote HTTP',
                    access: req.session.passport.user.level
                }
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new dataTable(table1, {database: database, pool: pool}, function(err,data){
                        tables.push(data);
                        callback();
                    });
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables
                };
                res.json(results);
            });
        }
    }
};