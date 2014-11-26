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
            if (req.query.mime) {
                var tables = [];
                var table1 = {
                    query: 'SELECT '+
                                'sum(`count`) AS `count`,'+
                                'max(`time`) AS `time`,'+
                                '`mime`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '(sum(`size`) / 1048576) AS size,'+
                                'sum(`ioc_count`) AS ioc_count '+
                            'FROM '+
                                '`file_meta` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `mime` = ? '+
                            'GROUP BY '+
                                '`lan_zone`,'+
                                '`lan_ip`',
                    insert: [start, end, req.query.mime],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'files_local',
                                val: ['lan_zone','lan_ip', 'mime'],
                                crumb: false
                            },
                        },
                        { title: 'Total Extracted Files', select: 'count' },
                        { title: 'File Type', select: 'mime', dView: false },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Total Size (MB)', select: 'size' },
                        { title: 'Total IOC Hits', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Extracted File Types',
                        access: req.session.passport.user.level
                    }
                }
                async.parallel([
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