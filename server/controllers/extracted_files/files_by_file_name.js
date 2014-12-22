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
            if (req.query.lan_zone && req.query.lan_ip) {
                var tables = [];
                var table1 = {
                    query: 'SELECT '+
                                'sum(`count`) AS `count`,'+
                                'max(`time`) AS `time`,'+
                                '`lan_stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`mime`,'+
                                '(sum(`size`) / 1048576) AS `size`,'+
                                'sum(`ioc_count`) AS `ioc_count` '+
                            'FROM '+
                                '`file_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'GROUP BY '+
                                'mime',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'files_local',
                                val: ['lan_zone','lan_ip','mime'],
                                crumb: false
                            },
                        },
                        { title: 'Total Extracted Files', select: 'count' },
                        { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                        { title: 'Zone', select: 'lan_zone', dView: false },
                        { title: 'Local Machine', select: 'lan_machine', dView: false },
                        { title: 'Local User', select: 'lan_user', dView: false },
                        { title: 'Local IP', select: 'lan_ip', dView: false },
                        { title: 'File Type', select: 'mime' },
                        { title: 'Total Size (MB)', select: 'size' },
                        { title: 'Total IOC Hits', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Extracted File Types',
                        hide_stealth: req.user.hide_stealth
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
