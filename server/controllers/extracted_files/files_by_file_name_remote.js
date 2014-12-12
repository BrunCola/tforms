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
            if (req.query.remote_ip) {
                var tables = [];
                var table1 = {
                    query: 'SELECT '+
                                'sum(`count`) AS `count`, '+
                                'max(`time`) AS `time`,'+
                                '`mime`,'+
                                '`remote_ip`,'+
                                '`remote_asn`,'+
                                '`remote_asn_name`,'+
                                '`remote_country`,'+
                                '`remote_cc`,'+
                                '(sum(`size`) / 1048576) AS size,'+
                                'sum(`ioc_count`) AS ioc_count '+
                            'FROM '+
                                '`file_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `remote_ip` = ? '+
                            'GROUP BY '+
                                '`mime`',
                    insert: [start, end, req.query.remote_ip],
                    params: [
                            {
                                title: 'Last Seen',
                                select: 'time',
                                dView: true,
                                link: {
                                    type: 'files_remote',
                                    val: ['remote_ip', 'mime'],
                                    crumb: false
                                },
                            },
                            { title: 'Total Extracted Files', select: 'count' },
                            { title: 'File Type', select: 'mime' },
                            { title: 'Remote IP', select: 'remote_ip', dView: false },
                            { title: 'Remote Country', select: 'remote_country', dView: false },
                            { title: 'Flag', select: 'remote_cc', dView: false },
                            { title: 'ASN', select: 'remote_asn', dView: false },
                            { title: 'ASN Name', select: 'remote_asn_name', dView: false },
                            { title: 'Total Size (MB)', select: 'size' },
                            { title: 'Total IOC Hits', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'Extracted File Types'
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
                    if (err) throw console.log(err)
                    var results = {
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