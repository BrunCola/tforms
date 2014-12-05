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
            if (req.query.lan_zone && req.query.lan_ip && req.query.qtype) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT ' +
                                '`time`, '+
                                '`lan_stealth`, ' +
                                '`lan_zone`, ' +
                                '`lan_machine`, ' +
                                '`lan_user`, ' +
                                '`lan_ip`, ' +
                                '`remote_ip`, ' +
                                '`remote_port`, ' +
                                '`remote_cc`, ' +
                                '`remote_country`, ' +
                                '`remote_asn_name`, ' +
                                '`proto`, ' +
                                '`trans_is`, ' +
                                '`query`, ' +
                                '`qclass`, ' +
                                '`qclass_name`, ' +
                                '`qtype`, ' +
                                '`qtype_name`, ' +
                                '`rcode`, ' +
                                '`rcode_name`, ' +
                                '`AA`, ' +
                                '`TC`, ' +
                                '`RD`, ' +
                                '`RA`, ' +
                                '`TTLs`, ' +
                                '`rejected`, ' +
                                '`ioc_count` ' +
                            'FROM ' +
                                '`dns` ' +
                            'WHERE '+ 
                                '`time` BETWEEN ? AND ? ' +
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? ' +
                                'AND `qtype` = ?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.qtype],
                    params: [
                        {
                            title: 'Time',
                            select: 'time'
                        },
                        { title: 'Stealth', select: 'lan_stealth', access: [3] },
                        { title: 'Protocol', select: 'proto' },
                        { title: 'Trans Is', select: 'trans_is' },
                        { title: 'Query', select: 'query' },
                        { title: 'Query Class', select: 'qclass_name' },
                        { title: 'Query Type', select: 'qtype_name' },
                        { title: 'Response Code', select: 'rcode_name' },
                        { title: 'Rejected', select: 'rejected' },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Local Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote IP', select: 'remote_ip'},
                        { title: 'Remote port', select: 'remote_port' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Remote ASN Name', select: 'remote_asn_name' },
                        { title: 'AA', select: 'AA', dView:false },
                        { title: 'TC', select: 'TC', dView:false },
                        { title: 'RD', select: 'RD', dView:false },
                        { title: 'RA', select: 'RA', dView:false },
                        { title: 'TTLs', select: 'TTLs', dView:false },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'DNS Connections Query Type and Local Host',
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