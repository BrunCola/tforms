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
                        'count(*) AS count,' +
                        'max(`time`) AS `time`,'+
                        '`lan_stealth`,'+
                        '`lan_machine`,'+
                        '`lan_zone`,'+
                        '`lan_user`,'+
                        '`lan_ip`,'+
                        '`remote_ip`, ' +
                        '`remote_cc`, ' +
                        '`remote_country`, '+
                        'CONCAT(`remote_asn_name`, ' (', remote_asn, ')') AS remote_asn, ' +
                        '`user`, ' +
                        '`password`, ' +
                        '`command`, ' +
                        '`arg`, ' +
                        '`mime_type`, ' +
                        '`file_size`, ' +
                        '`reply_code`, ' +
                        '`reply_msg`, ' +
                        '`dc_passive`, ' +
                        '`dc_orig_h`, ' +
                        '`dc_resp_h`, ' +
                        '`dc_resp_p`, ' +
                        '`ioc`, ' +
                        '`ioc_severity`, ' +
                        '`ioc_typeInfection`, ' +
                        '`ioc_typeIndicator`, ' +
                        '`ioc_rule`, ' +
                        'sum(`ioc_count`) AS `ioc_count` ' +
                    'FROM '+
                        '`ftp` '+
                    'WHERE '+ 
                        '`time` BETWEEN ? AND ? '+
                        'AND `lan_ip` = ? '+
                        'AND `lan_zone` = ? '+
                    'GROUP BY '+
                        '`remote_ip`',
                insert: [req.query.start, req.query.end, req.query.lan_ip, req.query.lan_zone],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'ftp_shared',
                            val: ['lan_zone','lan_ip','remote_ip'],
                            crumb: false
                        }
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'FTP User', select: 'user' },
                    { title: 'Password', select: 'password' },
                    { title: 'Command', select: 'command' },
                    { title: 'Arg', select: 'arg' },
                    { title: 'File Type', select: 'mime_type' },
                    { title: 'File Size', select: 'file_size' },
                    { title: 'Reply Code', select: 'reply_code' },
                    { title: 'Reply Message', select: 'reply_msg' },
                    // { title: 'DC Passive', select: 'dc_passive' },
                    { title: 'DC Orig P', select: 'dc_orig_h' },
                    { title: 'DC Resp H', select: 'dc_resp_h' },
                    { title: 'DC Resp P', select: 'dc_resp_p' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'IOC Severity', select: 'ioc_severity' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local FTP/Remote FTP',
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