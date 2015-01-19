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
                            'count(*) AS count,'+
                            'max(ssh.time) AS `time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`remote_cc`,'+
                            '`remote_country`,'+
                            'CONCAT(`remote_asn_name`, ' (', remote_asn, ')') AS remote_asn, '+
                            'sum(`ioc_count`) AS ioc_count ' +
                        'FROM '+
                            '`ssh` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND ssh.lan_ip = ? '+
                        'GROUP BY '+
                            '`remote_ip`',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip],
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
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine Name', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Remote SSH',
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