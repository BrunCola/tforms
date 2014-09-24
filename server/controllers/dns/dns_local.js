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
                            'sum(`count`) AS `count`,'+
                            'max(`time`) as time,'+
                            '`stealth`,'+
                            '`machine`,'+
                            '`lan_zone`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM ' + 
                            '`dns_local` '+
                        'WHERE ' + 
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            '`lan_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        //  link: {
                        //      type: 'ftp_local2remote', 
                        //      // val: the pre-evaluated values from the query above
                        //      val: ['lan_ip', 'lan_zone'],
                        //      crumb: false
                        // },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Stealth', select: 'stealth', access: [3] },
                    { title: 'Machine', select: 'machine' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'User', select: 'lan_user' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local DNS',
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