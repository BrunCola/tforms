'use strict';

var dataTable = require('../constructors/datatable'),
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
                            'count(*) AS count,'+
                            'max(`time`) AS `time`,'+
                            '`receiptto`,'+
                            'sum(`ioc_count`) AS ioc_count '+
                        'FROM '+
                            '`smtp` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`receiptto`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                         link: {
                             type: 'smtp_receiver2sender', 
                             val: ['receiptto'],
                             crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'To', select: 'receiptto' },
                    { title: 'IOC Count', select: 'ioc_count' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Top Email Receivers'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};