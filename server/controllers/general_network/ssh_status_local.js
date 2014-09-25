'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

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
            if (req.query.status_code) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'count(*) AS count,'+
                                'max(`time`) AS `time`,'+
                                '`stealth`,'+
                                '`lan_user`,'+
                                '`lan_zone`,'+
                                '`machine`,'+
                                '`lan_ip`,'+
                                '`status_code`, '+
                                'sum(`ioc_count`) AS ioc_count ' +
                            'FROM '+
                                '`ssh` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `status_code` = ? '+
                            'GROUP BY '+
                                '`lan_zone`,'+
                                '`lan_ip`',
                    insert: [start, end, req.query.status_code],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'ssh_status_local_drill',
                                val: ['lan_zone','lan_ip','status_code'],
                                crumb: false
                            }
                        },
                        { title: 'Connections', select: 'count' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Status', select: 'status_code' },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local SSH Status',
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