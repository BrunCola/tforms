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
                            'max(`time`) AS `time`,'+
                            '`remote_ip`,'+
                            '`remote_cc`,'+
                            '`remote_country`,'+
                            'CONCAT(`remote_asn_name`, \' (\', remote_asn, \')\') AS remote_asn, '+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`ssh` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`remote_ip`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                            type: 'ssh_remote2local',
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Top Remote SSH'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};