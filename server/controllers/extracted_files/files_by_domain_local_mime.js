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
            if (req.query.http_host, req.query.lan_ip, req.query.lan_zone) {
                var tables = [];
                var table1 = {
                    query: 'SELECT '+
                                'count(*) as count, '+
                                'max(`time`) AS `time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`http_host`,'+
                                '`mime`,'+
                                '(sum(`size`) / 1048576) AS size,'+
                                'sum(`ioc_count`) AS ioc_count '+
                            'FROM '+
                                '`file` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `http_host` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `lan_zone` = ? '+
                            'GROUP BY '+
                                '`mime`',
                    insert: [start, end, req.query.http_host, req.query.lan_ip, req.query.lan_zone],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'files_by_domain_local_mime_drill',
                                val: ['http_host', 'lan_ip', 'lan_zone', 'mime'],
                                crumb: false
                            },
                        },
                        { title: 'Total Extracted Files', select: 'count' },
                        { title: 'Domain', select: 'http_host' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Local IP', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'File Type', select: 'mime' },
                        { title: 'Total Size (MB)', select: 'size' },
                        { title: 'Total IOC Hits', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'Extracted File Types',
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