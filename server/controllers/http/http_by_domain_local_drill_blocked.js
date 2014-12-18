'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            if (req.query.lan_zone && req.query.lan_ip && req.query.host) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT ' +
                                '`time`, '+
                                '`lan_stealth`, ' +
                                '`lan_machine`, ' +
                                '`lan_zone`, ' +
                                '`lan_user`, ' +
                                '`lan_ip`, ' +
                                '`remote_ip`, ' +
                                '`remote_port`, ' +
                                '`remote_cc`, ' +
                                '`remote_country`, ' +
                                '`remote_asn_name`, ' +
                                '`depth`, ' +
                                '`method`, ' +
                                '`host`, ' +
                                '`uri`, ' +
                                '`url`, ' +
                                '`referrer`, ' +
                                '`user_agent`, ' +
                                '`request_body_len`, ' +
                                '`response_body_len`, ' +
                                '`status_code`, ' +
                                '`status_msg`, ' +
                                '`info_code`, ' +
                                '`info_msg`, ' +
                                '`filename`, ' +
                                '`tags`, ' +
                                '`proxied`, ' +
                                '`local_mime_types`, ' +
                                '`remote_mime_types`, ' +
                                '`proxy_blocked`, '+
                                '`proxy_rule`, '+
                                '`ioc_count` ' +
                            'FROM ' +
                                '`http` ' +
                            'WHERE '+ 
                                '`time` BETWEEN ? AND ? ' +
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? ' +
                                'AND proxy_blocked > 0 '+
                                'AND `host` = ?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.host],
                    params: [
                        { title: 'Time', select: 'time' },
                        { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                        { title: 'ABP', select: 'proxy_blocked', hide_proxy: [1] },
                        { title: 'Proxy Block Policy', select: 'proxy_rule', hide_proxy: [1] },
                        { title: 'Domain', select: 'host' },
                        { title: 'URI', select: 'uri' },
                        { title: 'URL', select: 'url' },
                        { title: 'Referrer', select: 'referrer' },
                        { title: 'User Agent', select: 'user_agent' },
                        { title: 'Depth', select: 'depth' },
                        { title: 'Method', select: 'method' },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Local Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Remote IP', select: 'remote_ip'},
                        { title: 'Remote Port', select: 'remote_port' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Remote ASN Name', select: 'remote_asn_name' },
                        { title: 'Request Body Length', select: 'request_body_len', dView:false },
                        { title: 'Response Body Length', select: 'response_body_len', dView:false },
                        { title: 'Status Code', select: 'status_code', dView:false },
                        { title: 'Status Message', select: 'status_msg', dView:false },
                        { title: 'Info Code', select: 'info_code', dView:false },
                        { title: 'Info Message', select: 'info_msg', dView:false },
                        { title: 'File Name', select: 'filename', dView:false },
                        { title: 'Tags', select: 'tags', dView:false },
                        { title: 'Proxied', select: 'proxied', dView:false },
                        { title: 'Local File Type', select: 'local_mime_types', dView:false },
                        { title: 'Remote File Type', select: 'remote_mime_types', dView:false },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[0, 'desc']],
                        div: 'table',
                        title: 'Blocked HTTP Connections between Domain and Local Host',
                        hide_stealth: req.user.hide_stealth,
                        hide_proxy: req.user.hide_proxy
                    }
                }
                async.parallel([
                    // Table function(s)
                    function(callback) {
                        new dataTable(table1, {database: database, pool: pool}, function(err,data){
                            tables.push(data);
                            callback();
                        });
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err)
                    var results = {
                        info: info,
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