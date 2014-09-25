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
                            'max(`time`) AS `time`,'+
                            '`remote_ip`,'+
                            '`remote_asn`,'+
                            '`remote_asn_name`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '(sum(`size`) / 1048576) AS size,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`file_remote` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`remote_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'by_file_name_remote',
                            // val: the pre-evaluated values from the query above
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Total Extracted Files', select: 'count' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'ASN', select: 'remote_asn' },
                    { title: 'ASN Name', select: 'remote_asn_name' },
                    { title: 'Total Size (MB)', select: 'size' },
                    { title: 'Total IOC Hits', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Extracted Files From Remote IPs'
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