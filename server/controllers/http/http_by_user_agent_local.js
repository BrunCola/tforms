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
                            'count(*) AS `count`,'+
                            'max(`time`) AS `time`, '+ 
                            '`lan_stealth`,'+
                            '`lan_zone`, ' +
                            '`lan_machine`, '+
                            '`lan_user`,'+
                            '`lan_ip`, ' +
                            '`user_agent`, ' +
                            'sum(`proxy_blocked`) AS proxy_blocked,'+
                            'sum(`ioc_count`) AS `ioc_count` ' +
                        'FROM ' +
                            '`http` '+
                        'WHERE ' +
                            '`time` BETWEEN ? AND ? '+
                            'AND `user_agent` = ? '+
                        'GROUP BY '+
                            '`lan_ip`, '+
                            '`lan_zone`',
                insert: [req.query.start, req.query.end, req.query.user_agent],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'http_by_user_agent_local_drill',
                            val: ['lan_ip','lan_zone','user_agent'],
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
                    { title: 'User Agent', select: 'user_agent' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local HTTP By User Agent',
                    hide_stealth: req.user.hide_stealth,
                    hide_proxy: req.user.hide_proxy,
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};