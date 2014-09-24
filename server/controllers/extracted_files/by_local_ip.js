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
            var table1 = {
                query: 'SELECT '+
                            'sum(`count`) AS `count`,'+
                            'max(file_local.time) AS `time`,'+
                            '`stealth`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '(sum(size) / 1048576) AS size,'+
                            'sum(ioc_count) AS ioc_count '+
                        'FROM '+
                            '`file_local` '+
                        'WHERE '+
                            'file_local.time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            'file_local.lan_ip',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'by_file_name',
                            // val: the pre-evaluated values from the query above
                            val: ['lan_zone','lan_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Total Extracted Files', select: 'count' },
                    { title: 'Stealth', select: 'stealth', access: [3] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine', select: 'machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Total Size (MB)', select: 'size' },
                    { title: 'Total IOC Hits', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local User Extracted Files',
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
                }
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    tables: tables
                };
                res.json(results);
            });
        }
    }
};
