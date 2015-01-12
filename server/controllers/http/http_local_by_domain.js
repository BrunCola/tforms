'use strict';

var dataTable = require('../constructors/datatable');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                        'sum(`count`) AS `count`, '+
                        'max(`time`) AS `time`, '+ // Last Seen
                        '`lan_stealth`,'+
                        '`lan_zone`, ' +
                        '`lan_machine`, '+
                        '`lan_user`, ' +
                        '`lan_ip`, ' +
                        '`host`, ' +
                        'sum(`proxy_blocked`) AS proxy_blocked,'+
                        'sum(`ioc_count`) AS `ioc_count` ' +
                    'FROM ' +
                        '`http_meta` '+
                    'WHERE ' +
                        '`time` BETWEEN ? AND ? '+
                        'AND `lan_zone` = ? '+
                        'AND `lan_ip` = ? '+
                    'GROUP BY '+
                        '`host`',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'http_by_domain_local_drill',
                            val: ['lan_ip','lan_zone','host'],
                            crumb: false
                        }
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Domain', select: 'host'},
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Local HTTP by Domain',
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