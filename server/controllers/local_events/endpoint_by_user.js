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
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`, '+
                            '`lan_user`, '+
                            '`lan_ip` '+
                        'FROM '+
                            '`endpoint_events` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            '`lan_user`,'+
                            '`lan_ip`',
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'endpoint_by_user_and_type',
                            val: ['lan_zone','lan_user'], // the pre-evaluated values from the query above
                            crumb: false
                        },
                    },
                    { title: 'Events', select: 'count' },
                    { title: 'Stealth', select: 'stealth', access: [3] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine', select: 'lan_machine'},
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    {
                        title: '',
                        select: null,
                        dView: true,
                        link: {
                            type: 'Upload Image',
                        },
                    },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local Endpoint Events',
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
            ], function(err) { // This function gets called after the two tasks have called their "task callbacks"
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