'use strict';

var datatable_stealth = require('../constructors/datatable_stealth'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.session.passport.user.database;
            // var database = null;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            //var results = [];
            var tables = [];
            var info = [];
            var table1 = {
                query: 'SELECT '+
                        'sum(`count`) AS `count`,'+
                        'time, '+ // Last Seen
                        '`machine`, ' +
                        '`lan_zone`, ' +
                        'lan_user, '+ // FIX
                        'stealth, '+ // FIX
                        '`lan_ip`, ' +
                        '`lan_user`, ' +
                        'sum(`proxy_blocked`) AS `proxy_blocked`, ' +
                        'sum(`ioc_count`) AS `ioc_count` ' +
                    'FROM ' + 
                        '`ssl_local` '+
                    'WHERE ' + 
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        '`lan_ip`, ' +
                        '`lan_zone`',
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
                    { title: 'Machine', select: 'machine' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'User', select: 'lan_user' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local SSL'
                }
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new datatable(table1, {database: database, pool: pool}, function(err,data){
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
                //console.log(results);
                res.json(results);
            });
        }
    }
};