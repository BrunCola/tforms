'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
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
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip, req.query.qtype],
                params: [
                    {
                        title: 'Time',
                        select: 'time'
                    },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
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
                    hide_stealth: req.user.hide_stealth
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};