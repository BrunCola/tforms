'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            'max(`time`) AS `time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '`remote_asn_name`,'+
                            'sum(`in_packets`) as in_packets,'+
                            'sum(`out_packets`) as out_packets,'+
                            'sum(`in_bytes`) as in_bytes,'+
                            'sum(`out_bytes`) as out_bytes,'+
                            '`ioc`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection`,'+
                            '`ioc_rule`,'+
                            '`ioc_severity`,'+
                            'sum(`ioc_count`) AS `ioc_count`,'+
                            'sum(`proxy_blocked`) AS proxy_blocked '+
                        'FROM '+
                            '`conn_ioc` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `remote_ip` = ? '+
                            'AND `ioc` = ? '+
                            'AND `ioc_count` > 0 '+
                            'AND `trash` IS NULL '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            '`lan_ip`',
                insert: [req.query.start, req.query.end, req.query.remote_ip, req.query.ioc],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'ioc_events_drilldown',
                            val: ['lan_zone','lan_ip','remote_ip','ioc'],
                            crumb: false
                        },
                    },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Severity', select: 'ioc_severity' },
                    { title: 'IOC Hits', select: 'ioc_count' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc', },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                    { title: 'Bytes to Remote', select: 'in_bytes' },
                    { title: 'Bytes from Remote', select: 'out_bytes' },
                    { title: 'Packets to Remote', select: 'in_packets', dView: false },
                    { title: 'Packets from Remote', select: 'out_packets', dView: false },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Indicators of Compromise (IOC) Notifications',
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
