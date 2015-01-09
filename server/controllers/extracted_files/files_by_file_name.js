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
                            'sum(`count`) AS `count`,'+
                            'max(`time`) AS `time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`mime`,'+
                            '(sum(`size`) / 1048576) AS `size`,'+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM '+
                            '`file_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_ip` = ? '+
                        'GROUP BY '+
                            'mime',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'files_local',
                            val: ['lan_zone','lan_ip','mime'],
                            crumb: false
                        },
                    },
                    { title: 'Total Extracted Files', select: 'count' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone', dView: false },
                    { title: 'Local Machine', select: 'lan_machine', dView: false },
                    { title: 'Local User', select: 'lan_user', dView: false },
                    { title: 'Local IP', select: 'lan_ip', dView: false },
                    { title: 'File Type', select: 'mime' },
                    { title: 'Total Size (MB)', select: 'size' },
                    { title: 'Total IOC Hits', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Extracted File Types',
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
