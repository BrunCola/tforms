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
                query: 'SELECT '+
                            '`time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`remote_cc`,'+
                            '`remote_country`,'+
                            'CONCAT(`remote_asn_name`, ' (', remote_asn, ')') AS remote_asn, '+
                            '`status_code`,'+
                            '`direction`,'+
                            '`lan_client`,'+
                            '`remote_server`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_typeInfection`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_rule`,'+
                            '`ioc_count` '+
                        'FROM '+
                            '`ssh` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_ip` = ? '+
                            'AND `status_code` = ?',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip, req.query.status_code],
                params: [
                    { title: 'Time', select: 'time' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Local client', select: 'lan_client' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote Server', select: 'remote_server' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'Status Code', select: 'status_code' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'Infection Stage', select: 'ioc_typeInfection' },
                    { title: 'Indicator Type', select: 'ioc_typeIndicator' },
                    { title: 'Severity', select: 'ioc_severity' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local SSH Connections by Status',
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