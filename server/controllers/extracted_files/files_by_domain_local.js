'use strict';

var dataTable = require('../constructors/datatable');

module.exports = function(pool) {
    return {
                // var table2 = {
                //     query: 'SELECT '+
                //                 'time, '+ 
                //                 '`stealth_COIs`, ' +
                //                 '`lan_stealth`, '+
                //                 '`lan_ip`, ' +
                //                 '`event`, ' +
                //                 '`user` ' +
                //             'FROM ' + 
                //                 '`endpoint_tracking` '+
                //             'WHERE ' + 
                //                 'stealth > 0 '+
                //                 'AND event = "Log On" ',
                //     insert: [],
                //     params: [
                //         { title: 'Stealth', select: 'lan_stealth' },
                //         { title: 'COI Groups', select: 'stealth_COIs' },
                //         { title: 'User', select: 'user' }
                //     ],
                //     settings: {}
               
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            'count(*) as count, '+
                            'max(`time`) AS `time`,'+
                            '`lan_ip`,'+
                            '`lan_zone`,'+
                            '`http_host`,'+
                            '(sum(`size`) / 1048576) AS size,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`file` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `http_host` = ? '+
                        'GROUP BY '+
                            '`lan_ip`, '+
                            '`lan_zone`',
                insert: [req.query.start, req.query.end, req.query.http_host],
                params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'files_by_domain_local_mime',
                                val: ['http_host', 'lan_ip', 'lan_zone'],
                                crumb: false
                            },
                        },
                        { title: 'Total Extracted Files', select: 'count' },
                        { title: 'Domain', select: 'http_host' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Total Size (MB)', select: 'size' },
                        { title: 'Total IOC Hits', select: 'ioc_count' }
                    ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Extracted Files by Domain'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};