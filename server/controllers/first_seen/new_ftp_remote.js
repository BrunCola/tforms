'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.session.passport.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            var tables = [];
            var crossfilter = [];
            var info = [];
            var table1 = {
                query: 'SELECT '+
                            'date_format(from_unixtime(ftp_uniq_remote_ip.time), "%Y-%m-%d %H:%i:%s") AS time,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            'ftp_uniq_remote_ip.lan_ip,'+
                            '`lan_port`,'+
                            '`remote_ip`,'+
                            '`remote_port`,'+
                            '`remote_asn`,'+
                            '`remote_asn_name`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            'ftp_uniq_remote_ip.user AS ftp_user '+
                        'FROM '+
                            '`ftp_uniq_remote_ip` '+
                        'WHERE '+
                            'ftp_uniq_remote_ip.time BETWEEN ? AND ?',
                insert: [start, end],
                params: [
                    { title: 'Last Seen', select: 'time' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Machine Name', select: 'machine' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Local Port', select: 'lan_port' },
                    { title: 'FTP User', select: 'ftp_user' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Port', select: 'remote_port' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc', },
                    { title: 'Remote ASN', select: 'remote_asn_name' },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'New Remote IP Addresses Detected'
                }
            }
            var crossfilterQ = {
                query: 'SELECT '+
                            'count(*) AS count,'+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time, '+
                            '`remote_country` '+
                        'FROM '+
                            '`ftp_uniq_remote_ip` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            'month(from_unixtime(`time`)),'+
                            'day(from_unixtime(`time`)),'+
                            'hour(from_unixtime(`time`)),'+
                            '`remote_country`',
                insert: [start, end]
            }
            async.parallel([
                // Table function(s)
                function(callback) {
                    new dataTable(table1, {database: database, pool: pool}, function(err,data){
                        tables.push(data);
                        callback();
                    });
                },
                // Crossfilter function
                function(callback) {
                    new query(crossfilterQ, {database: database, pool: pool}, function(err,data){
                        crossfilter = data;
                        callback();
                    });
                }
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables,
                    crossfilter: crossfilter
                };
                res.json(results);
            });
        }
    }
};