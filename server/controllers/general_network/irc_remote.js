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
                            'count(*) AS count, ' +
                            'max(`time`) AS `time`,'+ // Last Seen
                            '`remote_ip`, ' +
                            '`remote_port`, '  +
                            '`remote_cc`, ' +
                            '`remote_country`, ' +
                            '`remote_asn_name` ' +
                        'FROM '+
                            '`irc` '+
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
                            type: 'irc_remote2local', 
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'Connections', select: 'count' },
                    { title: 'Remote IP', select: 'remote_ip'},
                    { title: 'Remote Port', select: 'remote_port' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Remote ASN Name', select: 'remote_asn_name' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Remote IRC'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};