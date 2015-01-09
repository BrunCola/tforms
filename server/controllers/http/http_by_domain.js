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
                            'max(`time`) AS `time`, '+
                            '`host`, ' +
                            'sum(`proxy_blocked`) AS proxy_blocked,'+
                            'sum(`ioc_count`) AS `ioc_count` ' +
                        'FROM ' +
                            '`http_host` '+
                        'WHERE ' +
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`host`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                             type: 'http_by_domain_local',
                             val: ['host'], // val: the pre-evaluated values from the query above
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Domain', select: 'host' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    //access: req.user.level, // NOTE: THIS IS IF ACCESS IS DEFINED IN COLUMNS ABOVE
                    hide_proxy: req.user.hide_proxy,
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'HTTP by Domain',
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};