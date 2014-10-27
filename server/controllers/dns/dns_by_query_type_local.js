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
            if (req.query.qtype) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                // 'sum(`count`) AS `count`,'+
                                'count(*) AS `count`, '+
                                'max(`time`) AS `time`, '+ 
                                '`stealth`,'+
                                '`lan_zone`, ' +
                                '`machine`, '+
                                '`lan_user`,'+
                                '`lan_ip`, ' +
                                '`qtype`, ' +
                                '`qtype_name`, ' +
                                'sum(`ioc_count`) AS `ioc_count` ' +
                            'FROM ' +
                                '`dns` '+
                            'WHERE ' +
                                '`time` BETWEEN ? AND ? '+
                                'AND `qtype` = ? '+
                            'GROUP BY '+
                                '`lan_zone`, ' +
                                '`lan_ip`',
                    insert: [start, end, req.query.qtype],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'dns_by_query_type_local_drill',
                                val: ['lan_ip','lan_zone','qtype'],
                                crumb: false
                            }
                        },
                        { title: 'Connections', select: 'count' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Query Type', select: 'qtype' },
                        { title: 'Query Type Name', select: 'qtype_name' },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local DNS by Query Type',
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