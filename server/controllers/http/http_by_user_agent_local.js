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
            if (req.query.user_agent) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'count(*) AS `count`,'+
                                'max(`time`) AS `time`, '+ 
                                '`stealth`,'+
                                '`lan_zone`, ' +
                                '`lan_machine`, '+
                                '`lan_user`,'+
                                '`lan_ip`, ' +
                                '`user_agent`, ' +
                                'sum(`proxy_blocked`) AS proxy_blocked,'+
                                'sum(`ioc_count`) AS `ioc_count` ' +
                            'FROM ' +
                                '`http` '+
                            'WHERE ' +
                                '`time` BETWEEN ? AND ? '+
                                'AND `user_agent` = ? '+
                            'GROUP BY '+
                                '`lan_ip`, '+
                                '`lan_zone`',
                    insert: [start, end, req.query.user_agent],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'http_by_user_agent_local_drill',
                                val: ['lan_ip','lan_zone','user_agent'],
                                crumb: false
                            }
                        },
                        { title: 'Connections', select: 'count' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'ABP', select: 'proxy_blocked', access: [2] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'User Agent', select: 'user_agent' },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local HTTP By User Agent',
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
                    if (err) throw console.log(err)
                    var results = {
                        info: info,
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