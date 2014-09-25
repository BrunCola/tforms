'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async');
    query = require('../constructors/query'),

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
                            '`lan_user`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            'irc.lan_ip,'+
                            '`lan_port`,'+
                            '`remote_ip`,'+
                            '`remote_port`,'+
                            '`remote_cc`,'+
                            '`remote_country`,'+
                            '`remote_asn_name`,'+
                            '`nick`,'+
                            '`user` AS `irc_user`,'+
                            '`command`,'+
                            '`value`,'+
                            '`addl`,'+
                            '`dcc_file_name`,'+
                            '`dcc_file_size`,'+
                            '`dcc_mime_type`,'+
                            '`fuid` '+
                        'FROM '+
                            '`irc` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `remote_ip` = ? '+
                        'GROUP BY '+
                            '`lan_ip`',
                    insert: [start, end, req.query.remote_ip],
                    params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            link: {
                                type: 'irc_shared',
                                val: ['lan_ip','lan_zone','remote_ip'],
                                crumb: false
                            }
                        },
                        { title: 'Connections', select: 'count' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Local Port', select: 'lan_port' },
                        { title: 'Remote IP', select: 'remote_ip'},
                        { title: 'Remote Port', select: 'remote_port' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Remote ASN Name', select: 'remote_asn_name' },
                        { title: 'Nick', select: 'nick' },
                        { title: 'IRC User', select: 'irc_user' },
                        { title: 'Command', select: 'command' },
                        { title: 'Value', select: 'value'},
                        { title: 'Addl', select: 'addl' },
                        { title: 'DCC File Name', select: 'dcc_file_name' },
                        { title: 'DCC File Size', select: 'dcc_file_size' },
                        { title: 'DCC File Type', select: 'dcc_mime_type' },
                        { title: 'FUID', select: 'fuid' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Remote IRC/Local IRC Traffic'
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