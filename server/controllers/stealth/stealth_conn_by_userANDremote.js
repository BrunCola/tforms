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
                            '`time`,'+
                            '`count`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_ip`,'+
                            '`remote_machine`,'+
                            '`remote_user`,'+
                            '`in_bytes`,'+
                            '`out_bytes`,'+
                            '`in_packets`,'+
                            '`out_packets` '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_user` = ? '+
                            'AND `lan_ip` = ? '+
                            'AND `remote_ip` = ? ',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_user, req.query.lan_ip, req.query.remote_ip],
                params: [
                    { title: 'Time', select: 'time' },
                    { title: 'Zone', select: 'lan_zone' }, 
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Remote Machine', select: 'remote_machine'},
                    { title: 'Remote User', select: 'remote_user'},
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Bytes to Remote', select: 'in_bytes' },
                    { title: 'Bytes from Remote', select: 'out_bytes'},
                    { title: 'Packets to Remote', select: 'in_packets', dView:false },
                    { title: 'Packets from Remote', select: 'out_packets', dView:false },
                    { title: 'Connections', select: 'count', dView:false },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Full Endpoint Event Logs'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};