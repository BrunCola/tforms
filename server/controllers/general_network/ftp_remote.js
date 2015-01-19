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
                            '`remote_ip`, ' +
                            '`remote_port`, '  +
                            '`remote_cc`, ' +
                            '`remote_country`, ' +
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
                            '`ioc_count` ' +
                        'FROM '+
                            '`ftp` '+
                        'WHERE ' +
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`remote_ip`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                            type: 'ftp_remote2local', 
                            // val: the pre-evaluated values from the query above
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote port', select: 'remote_port' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'User', select: 'user' },
                    { title: 'Password', select: 'password' },
                    { title: 'Command', select: 'command' },
                    { title: 'Arg', select: 'arg' },
                    { title: 'File Type', select: 'mime_type' },
                    { title: 'File Size', select: 'file_size' },
                    { title: 'Reply Code', select: 'reply_code' },
                    { title: 'Reply Message', select: 'reply_msg' },
                    { title: 'DC Passive', select: 'dc_passive' },
                    { title: 'DC Orig P', select: 'dc_orig_h' },
                    { title: 'DC Resp H', select: 'dc_resp_h' },
                    { title: 'DC Resp P', select: 'dc_resp_p' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'IOC Severity', select: 'ioc_severity' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Remote FTP'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};