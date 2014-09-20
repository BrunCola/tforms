'use strict';

var dataTable = require('../constructors/datatable'),
networkchart = require('../constructors/networktree'),
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
            var tables = [];
            var crossfilter = [];
            var info = [];
            var network;
            var table1 = {
                query:  'SELECT '+ 
                            'u.* '+ 
                        'FROM '+
                            '`users` u '+ 
                        'INNER JOIN ( '+
                            'SELECT '+
                                'max(`time`) as maxTime, '+ 
                                '`lan_ip`, '+
                                '`operating_system`, '+
                                '`machine`,'+
                                '`mac_address`,'+
                                '`endpoint_agent`,'+
                                '`username`,'+
                                '`stealth`,'+
                                '`vendor`,'+
                            'FROM '+
                                '`users` '+
                            // 'WHERE '+
                            //     '`operating_system` IS NOT NULL '+ 
                            'GROUP BY '+
                                '`lan_ip` '+
                        ') '+ 
                        'GROUPEDU ON '+
                            'u.lan_ip = GROUPEDU.lan_ip '+
                            'AND u.time = GROUPEDU.maxTime',
                insert: [start, end],
                params: [
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine', select: 'machine' },
                    { title: 'Local User', select: 'username' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'OS', select: 'operating_system' },
                    { title: 'Vendor', select: 'vendor' },
                    { title: 'MAC Address', select: 'mac_address'},
                    { title: 'Endpoint Agent', select: 'endpoint_agent' },
                    { title: 'Stealth', select: 'stealth' },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Users'
                }
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new networkchart(table1, {database: database, pool: pool, type: 'network'}, function(err,data){
                        network = data;
                        callback();
                    });
                },
                function(callback) {
                    new dataTable(table1, {database: database, pool: pool}, function(err,data){
                        tables.push(data);
                        callback();
                    });
                }
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables,
                    network: network,
                    crossfilter: crossfilter
                };
                res.json(results);
            });
        }
    }
};