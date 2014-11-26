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
            if (req.query.lan_zone && req.query.lan_ip && req.query.mime && req.query.http_host) {
                var tables = [];
                var table1 = {
                    query: 'SELECT '+
                                '`time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_asn`,'+
                                '`remote_asn_name`,'+
                                '`remote_country`,'+
                                '`remote_cc`,'+
                                '`proto`,'+
                                '`http_host`,'+
                                '`mime`,'+
                                '`name`,'+
                                '(`size` / 1024) AS `size`, '+    
                                '`md5`,'+
                                '`sha1`,'+
                                '`ioc`,'+
                                '`ioc_rule`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection` '+
                            'FROM '+ 
                                '`file` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `mime` = ? '+
                                'AND `http_host` = ?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.mime, req.query.http_host],
                    params: [
                        { title: 'Last Seen', select: 'time' },
                        { title: 'File Type', select: 'mime' },
                        { title: 'Name', select: 'name', sClass:'file'},
                        { title: 'Size (KB)', select: 'size' },
                        { title: 'Stealth', select: 'stealth', access: [3] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Local Port', select: 'lan_port' },
                        { title: 'Remote IP', select: 'remote_ip' },
                        { title: 'Remote Port', select: 'remote_port' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'ASN', select: 'remote_asn' },
                        { title: 'ASN Name', select: 'remote_asn_name' },
                        { title: 'Protocol', select: 'proto' },
                        { title: 'Domain', select: 'http_host' },
                        { title: 'IOC', select: 'ioc' },
                        { title: 'IOC Type', select: 'ioc_typeIndicator' },
                        { title: 'IOC Stage', select: 'ioc_typeInfection' },
                        { title: 'IOC Rule', select: 'ioc_rule' },
                        { title: 'MD5', select: 'md5' },
                        { title: 'SHA1', select: 'sha1' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Extracted Files by Local IP, Domain, Type',
                        access: req.session.passport.user.level
                    }
                }
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        new dataTable(table1, {database: database, pool: pool}, function(err,data){
                            tables.push(data);
                            callback();
                        });
                    }
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err)
                    var results = {
                        tables: tables
                    };
                    res.json(results);
                });
            } else {
                res.redirect('/');
            }
        }
    }
};