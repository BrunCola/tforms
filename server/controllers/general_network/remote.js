'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {
        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                            'time,'+
                            '(sum(in_bytes + out_bytes) / 1048576) AS count,'+
                            'remote_country, '+
                            '(sum(`in_bytes`) / 1048576) AS in_bytes, '+
                            '(sum(`out_bytes`) / 1048576) AS out_bytes '+
                        'FROM '+
                            '`conn_remote` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            'month(from_unixtime(time)),'+
                            'day(from_unixtime(time)),'+
                            'hour(from_unixtime(time)),'+
                            'remote_country',
                insert: [req.query.start, req.query.end]
            }
            new query(get, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
                            'sum(`count`) AS `count`,'+
                            'max(`time`) AS `time`,'+
                            '`remote_ip`,'+
                            'CONCAT(`remote_asn_name`, ' (', remote_asn, ')') AS remote_asn,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '(sum(`in_bytes`) / 1048576) AS `in_bytes`,'+
                            '(sum(`out_bytes`) / 1048576) AS `out_bytes`,'+
                            'sum(`dns`) AS `dns`,'+
                            'sum(`http`) AS `http`,'+
                            'sum(`ssl`) AS `ssl`,'+
                            'sum(`ssh`) AS `ssh`,'+
                            'sum(`ftp`) AS `ftp`,'+
                            'sum(`irc`) AS `irc`,'+
                            'sum(`smtp`) AS `smtp`,'+
                            'sum(`file`) AS `file`,'+
                            'sum(`proxy_blocked`) AS proxy_blocked,'+
                            'sum(`ioc_count`) AS `ioc_count` '+
                        'FROM '+
                            'conn_remote '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                        'GROUP BY '+
                            'remote_ip',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        dView: true,
                        link: {
                            type: 'remote2local',
                            val: ['remote_ip'],
                            crumb: false
                        },
                    },
                    { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc', },
                    { title: 'Remote ASN', select: 'remote_asn' },
                    { title: 'MB to Remote', select: 'in_bytes' },
                    { title: 'MB from Remote', select: 'out_bytes'},
                    { title: 'IOC Hits', select: 'ioc_count' },
                    { title: 'Connections', select: 'count', dView:false },
                    { title: 'DNS', select: 'dns', dView:false },
                    { title: 'HTTP', select: 'http', dView:false },
                    { title: 'SSL', select: 'ssl', dView:false },
                    { title: 'SSH', select: 'ssh', dView:false },
                    { title: 'FTP', select: 'ftp', dView:false },
                    { title: 'IRC', select: 'irc', dView:false },
                    { title: 'SMTP', select: 'smtp', dView:false },
                    { title: 'File', select: 'file', dView:false },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Remote IP Traffic',
                    hide_proxy: req.user.hide_proxy
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};