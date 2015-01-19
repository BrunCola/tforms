'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT ' +
                        '`time`, ' +
                        '`lan_stealth`, ' +
                        '`lan_zone`, ' +
                        '`lan_machine`, ' +
                        '`lan_user`, ' +
                        '`lan_ip`, ' +
                        '`lan_port`, ' +
                        '`remote_ip`, ' +
                        '`remote_port`, '  +
                        '`remote_cc`, ' +
                        '`remote_country`, ' +
                        'CONCAT(`remote_asn_name`, \' (\', remote_asn, \')\') AS remote_asn, ' +
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
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip],
                params: [
                    {
                        title: 'Time',
                        select: 'time'
                    },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Local Port', select: 'lan_port' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote Port', select: 'remote_port' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'Bytes to Remote', select: 'in_bytes' },
                    { title: 'Bytes from Remote', select: 'out_bytes'},
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Severity', select: 'ioc_severity' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'IOC Count', select: 'ioc_count' }
                    // { title: 'DNS', select: 'dns', dView:false },
                    // { title: 'HTTP', select: 'http', dView:false },
                    // { title: 'SSL', select: 'ssl', dView:false },
                    // { title: 'SSH', select: 'ssh', dView:false },
                    // { title: 'FTP', select: 'ftp', dView:false },
                    // { title: 'IRC', select: 'irc', dView:false },
                    // { title: 'SMTP', select: 'smtp', dView:false },
                    // { title: 'File', select: 'file', dView:false }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Common IP Connections between Remote and Local Host',
                    hide_stealth: req.user.hide_stealth,
                    hide_proxy: req.user.hide_proxy
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};