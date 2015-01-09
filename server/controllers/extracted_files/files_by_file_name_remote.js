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
                            'max(`time`) AS `time`,'+
                            '`mime`,'+
                            '`remote_ip`,'+
                            '`remote_asn`,'+
                            '`remote_asn_name`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '(sum(`size`) / 1048576) AS size,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`file_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND `remote_ip` = ? '+
                        'GROUP BY '+
                            '`mime`',
                insert: [req.query.start, req.query.end, req.query.remote_ip],
                params: [
                        {
                            title: 'Last Seen',
                            select: 'time',
                            dView: true,
                            link: {
                                type: 'files_remote',
                                val: ['remote_ip', 'mime'],
                                crumb: false
                            },
                        },
                        { title: 'Total Extracted Files', select: 'count' },
                        { title: 'File Type', select: 'mime' },
                        { title: 'Remote IP', select: 'remote_ip', dView: false },
                        { title: 'Remote Country', select: 'remote_country', dView: false },
                        { title: 'Flag', select: 'remote_cc', dView: false },
                        { title: 'ASN', select: 'remote_asn', dView: false },
                        { title: 'ASN Name', select: 'remote_asn_name', dView: false },
                        { title: 'Total Size (MB)', select: 'size' },
                        { title: 'Total IOC Hits', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Extracted File Types'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};