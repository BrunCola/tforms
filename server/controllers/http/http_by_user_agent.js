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
                            'sum(`count`) AS `count`, '+
                            'max(`time`) AS `time`, '+
                            '`user_agent`, ' +
                            'sum(`proxy_blocked`) AS proxy_blocked,'+
                            'sum(`ioc_count`) AS `ioc_count` ' +
                        'FROM ' +
                            '`http_user_agent` '+
                        'WHERE ' +
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`user_agent`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'http_by_user_agent_local',
                             val: ['user_agent'], // val: the pre-evaluated values from the query above
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'ABP', select: 'proxy_blocked', access: [2] },
                    { title: 'User Agent', select: 'user_agent' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    access: req.session.passport.user.level, // NOTE: THIS IS IF ACCESS IS DEFINED IN COLUMNS ABOVE
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'HTTP by User Agent',
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