'use strict';

var dataTable = require('../constructors/datatable'),
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

            var tables = [];
            var info = [];
            var table1 = {
                 query: 'SELECT '+
                            '`time`,'+
                            '`email`,'+
                            '`lan_zone`,'+
                            '`lan_user` '+
                        'FROM '+
                            '`stealth_quarantine`',
                insert: [],
                params: [
                    { title: 'Time', select: 'time' },
                    { title: 'rapidPHIRE User Responsible', select: 'email' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Quarantined User', select: 'lan_user' },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Quarantined Endpoints',
                    access: req.user.level
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
        }
    }
};