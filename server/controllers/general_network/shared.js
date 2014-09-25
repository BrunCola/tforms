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
            if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT ' +
                                '`time`, ' +
                                '`stealth`, ' +
                                '`lan_zone`, ' +
                                '`machine`, ' +
                                '`lan_user`, ' +
                                '`lan_ip`, ' +
                                '`lan_port`, ' +
                                '`remote_ip`, ' +
                                '`remote_port`, '  +
                                '`remote_cc`, ' +
                                '`remote_country`, ' +
                                '`remote_asn`, ' +
                                '`remote_asn_name`, ' +
                                '`in_bytes`, ' +
                                '`out_bytes`, ' +
                                '`dns`, ' +
                                '`http`, ' +
                                '`ssl`, ' +
                                '`ssh`, ' +
                                '`ftp`, ' +
                                '`irc`, ' +
                                '`smtp`, ' +
                                '`file`, ' +
                                '`ioc`, ' +
                                '`ioc_severity`, ' +
                                '`ioc_typeInfection`, ' +
                                '`ioc_typeIndicator`, ' +
                                '`ioc_rule`, ' +
                                '`ioc_count`,' +
                                '`proxy_blocked` '+
                            'FROM '+
                                '`conn` ' +
                            'WHERE '+ 
                                '`time` BETWEEN ? AND ? ' +
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? ' +
                                'AND `remote_ip` = ? ',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip],
                    params: [
                        {
                            title: 'Time',
                            select: 'time'
                        },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'ABP', select: 'proxy_blocked', access: [2] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Local port', select: 'lan_port' },
                        { title: 'Remote IP', select: 'remote_ip'},
                        { title: 'Remote port', select: 'remote_port' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Remote ASN', select: 'remote_asn' },
                        { title: 'Remote ASN Name', select: 'remote_asn_name' },
                        { title: 'B to Remote', select: 'in_bytes' },
                        { title: 'B from Remote', select: 'out_bytes'},
                        { title: 'IOC', select: 'ioc' },
                        { title: 'IOC Severity', select: 'ioc_severity' },
                        { title: 'Infection Stage', select: 'ioc_typeInfection' },
                        { title: 'Indicator Type', select: 'ioc_typeIndicator' },
                        { title: 'IOC Rule', select: 'ioc_rule' },
                        { title: 'IOC Count', select: 'ioc_count' },
                        { title: 'DNS', select: 'dns', dView:false },
                        { title: 'HTTP', select: 'http', dView:false },
                        { title: 'SSL', select: 'ssl', dView:false },
                        { title: 'SSH', select: 'ssh', dView:false },
                        { title: 'FTP', select: 'ftp', dView:false },
                        { title: 'IRC', select: 'irc', dView:false },
                        { title: 'SMTP', select: 'smtp', dView:false },
                        { title: 'File', select: 'file', dView:false }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Common IP Connections between Remote and Local Host',
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