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
                            'count(*) AS `count`, '+
                            'max(`time`) AS `time`, '+ 
                            '`lan_stealth`,'+
                            '`lan_zone`, ' +
                            '`lan_machine`, '+
                            '`lan_user`,'+
                            '`lan_ip`, ' +
                            '`qtype`, ' +
                            '`qtype_name`, ' +
                            'sum(`ioc_count`) AS `ioc_count` ' +
                        'FROM ' +
                            '`dns` '+
                        'WHERE ' +
                            '`time` BETWEEN ? AND ? '+
                            'AND `qtype` = ? '+
                        'GROUP BY '+
                            '`lan_zone`, ' +
                            '`lan_ip`',
                insert: [req.query.start, req.query.end, req.query.qtype],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'dns_by_query_type_local_drill',
                            val: ['lan_ip','lan_zone','qtype'],
                            crumb: false
                        }
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Query Type', select: 'qtype_name' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local DNS by Query Type',
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