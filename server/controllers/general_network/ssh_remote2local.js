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
            if (req.query.remote_ip) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                'count(*) AS count,'+
                                'max(`time`) AS `time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`remote_ip`,'+
                                '`remote_cc`,'+
                                '`remote_country`,'+
                                '`remote_asn`,'+
                                '`remote_asn_name`,'+
                                'sum(`ioc_count`) AS ioc_count '+
                            'FROM '+
                                '`ssh` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `remote_ip` = ? '+
                            'GROUP BY '+
                                '`lan_zone`,'+
                                '`lan_ip`',
                    insert: [start, end, req.query.remote_ip],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'ssh_shared',
                                val: ['lan_zone','lan_ip','remote_ip'],
                                crumb: false
                            }
                        },
                        { title: 'Connections', select: 'count' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote IP', select: 'remote_ip'},
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote ASN', select: 'remote_asn' },
                        { title: 'Remote ASN Name', select: 'remote_asn_name' },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Remote To Local SSH',
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