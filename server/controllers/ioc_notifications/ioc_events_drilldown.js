'use strict';

var lanegraph = require('../constructors/lanegraph'),
    config = require('../../config/config'),
    query = require('../constructors/query'),
    force = require('../constructors/force'),
    treechart = require('../constructors/treechart'),
    async = require('async');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var columns = {};
            function handleReturn(data, callback) {
                if ((data !== null) && (data.length > 0)) {
                    result.data.push(data);
                    return callback();
                } else {
                    return callback();
                }
            }
            var database = req.session.passport.user.database;
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            if (req.query.start && req.query.end) {
                start = req.query.start;
                end = req.query.end;
            }
            var pointGroup;
            if (req.query.group) {
                pointGroup = req.query.group;
            } else {
                pointGroup = 1;
            }
            var lanes;
            if (req.session.passport.user.level === 3) {
                lanes = ['IOC', 'IOC Severity', 'Conn', 'Stealth', 'Applications', 'DNS', 'HTTP', 'SSL', 'Email', 'File', 'Endpoint'];
            } else {
                lanes = ['IOC', 'IOC Severity', 'Conn', 'Applications', 'DNS', 'HTTP', 'SSL', 'Email', 'File', 'Endpoint'];
            }
            var result = {
                lanes: lanes,
                data: []
            };
            if (req.query.type === 'drill') {
                var conn_ioc = {
                    query: 'SELECT '+
                                '\'Conn_ioc\' AS type,'+
                                '`time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_country`,'+
                                '`remote_asn_name`,'+
                                '`l7_proto`,'+
                                '`conn_uids`,'+
                                '`in_bytes`,'+
                                '`out_bytes`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `remote_ip` = ? '+
                                'AND `ioc` = ? '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                    params: [
                        {title: "Time", select: "time"},
                        {title: 'Stealth', select: 'stealth', access: [3] },
                        {title: 'ABP', select: 'proxy_blocked', access: [2] },
                        {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine", select: "lan_machine", pattern: true},
                        {title: "Local User", select: "lan_user", pattern: true},
                        {title: "Local IP", select: "lan_ip", pattern: true},
                        // {title: "Local Port", select: "lan_port", pattern: true},
                        {title: "Remote IP", select: "remote_ip", pattern: true},
                        // {title: "Remote Port", select: "remote_port", pattern: true},
                        // {title: "Remote Country", select: "remote_country", pattern: true},
                        // {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                        // {title: "Application", select: "l7_proto", pattern: true},
                        // {title: "Bytes to Remote", select: "in_bytes"},
                        // {title: "Bytes from  Remote", select: "out_bytes"},
                        {title: "IOC", select: "ioc"},
                        // {title: "IOC Type", select: "ioc_typeIndicator"},
                        // {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: "IOC Severity", select: "ioc_severity"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var iocseverity = {
                    query: 'SELECT '+
                                '\'IOC Severity\' AS type,'+
                                '`time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_country`,'+
                                '`remote_asn_name`,'+
                                '`l7_proto`,'+
                                '`conn_uids`,'+
                                '`in_bytes`,'+
                                '`out_bytes`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `ioc_severity` > 0 ' + 
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: 'Stealth', select: 'stealth', access: [3] },
                        {title: 'ABP', select: 'proxy_blocked', access: [2] },
                        // {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        {title: "Zone", select: "lan_zone"},
                        // {title: "Machine", select: "lan_machine", pattern: true},
                        {title: "Local User", select: "lan_user", pattern: true},
                        {title: "Local IP", select: "lan_ip", pattern: true},
                        // {title: "Local Port", select: "lan_port", pattern: true},
                        {title: "Remote IP", select: "remote_ip", pattern: true},
                        // {title: "Remote Port", select: "remote_port", pattern: true},
                        {title: "Remote Country", select: "remote_country", pattern: true},
                        // {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                        // {title: "Application", select: "l7_proto", pattern: true},
                        // {title: "Bytes to Remote", select: "in_bytes"},
                        // {title: "Bytes from Remote", select: "out_bytes"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Count", select: "ioc_count"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var conn = {
                    query: 'SELECT '+
                                '\'Conn\' AS type,'+
                                '`time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_country`,'+
                                '`remote_asn_name`,'+
                                '`l7_proto`,'+
                                '`conn_uids`,'+
                                '`in_bytes`,'+
                                '`out_bytes`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`conn` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: 'Stealth', select: 'stealth', access: [3] },
                        {title: 'ABP', select: 'proxy_blocked', access: [2] },
                        {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine", select: "lan_machine", pattern: true},
                        {title: "Local User", select: "lan_user", pattern: true},
                        {title: "Local IP", select: "lan_ip", pattern: true},
                        {title: "Local Port", select: "lan_port", pattern: true},
                        {title: "Remote IP", select: "remote_ip", pattern: true},
                        {title: "Remote Port", select: "remote_port", pattern: true},
                        {title: "Remote Country", select: "remote_country", pattern: true},
                        {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                        {title: "Application", select: "l7_proto", pattern: true},
                        {title: "Bytes to Remote", select: "in_bytes"},
                        {title: "Bytes from Remote", select: "out_bytes"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Count", select: "ioc_count"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var application = {
                    query: 'SELECT '+
                                '\'Applications\' AS type,'+
                                '`time`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_country`,'+
                                '`remote_asn_name`,'+
                                '`l7_proto`,'+
                                '`conn_uids`,'+
                                '`in_bytes`,'+
                                '`out_bytes`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`conn` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `l7_proto` != \'-\' '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine", select: "lan_machine", pattern: true},
                        {title: "Local IP", select: "lan_ip", pattern: true},
                        {title: "Local Port", select: "lan_port", pattern: true},
                        {title: "Remote IP", select: "remote_ip", pattern: true},
                        {title: "Remote Port", select: "remote_port", pattern: true},
                        {title: "Remote Country", select: "remote_country", pattern: true},
                        // {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                        {title: "Application", select: "l7_proto", pattern: true},
                        {title: "Bytes to Remote", select: "in_bytes"},
                        {title: "Bytes from Remote", select: "out_bytes"},
                        // {title: "IOC", select: "ioc"},
                        // {title: "IOC Type", select: "ioc_typeIndicator"},
                        // {title: "IOC Stage", select: "ioc_typeInfection"},
                        // {title: "IOC Rule", select: "ioc_rule"},
                        // {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Count", select: "ioc_count"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var stealth_conn = {
                    query: 'SELECT '+
                            '\'Stealth\' AS type,'+
                            '`time`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`remote_machine`,'+
                            '`remote_user`,'+
                            '`remote_ip`,'+
                            '`conn_uids`,'+
                            '(`in_bytes` / 1048576) as in_bytes,'+
                            '(`out_bytes` / 1048576) as out_bytes,'+
                            '`in_packets`,'+
                            '`out_packets` '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`= ? '+
                            'AND `in_bytes` > 0 '+
                            'AND `out_bytes` > 0 '+
                        'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Source Machine", select: "lan_machine"},
                        {title: "Source User", select: "lan_user"},
                        {title: "Source IP", select: "lan_ip"},
                        {title: "Destination Machine", select: "remote_machine"},
                        {title: "Destination User", select: "remote_user"},
                        {title: "Destination IP", select: "remote_ip"},
                        {title: "MB from Remote", select: "in_bytes"},
                        {title: "MB to Remote", select: "out_bytes"},
                        {title: "Packets from Remote", select: "in_packets"},
                        {title: "Packets to Remote", select: "out_packets"}
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var stealth_drop = {
                    query: 'SELECT '+
                                '\'Stealth_drop\' AS type,'+
                                '`time`,'+
                                '`lan_machine`, '+
                                '`lan_user`, '+
                                '`lan_ip`, '+
                                '`remote_machine`, '+
                                '`remote_user`, '+
                                '`remote_ip`, '+
                                '`conn_uids`,'+
                                '(`in_bytes` / 1048576) as in_bytes, '+
                                '(`out_bytes` / 1048576) as out_bytes, '+
                                '`in_packets`, '+
                                '`out_packets` '+
                            'FROM '+
                                '`stealth_conn_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND (`in_bytes` = 0 OR `out_bytes` = 0) '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Source Machine", select: "lan_machine"},
                        {title: "Source User", select: "lan_user"},
                        {title: "Source IP", select: "lan_ip"},
                        {title: "Destination Machine", select: "remote_machine"},
                        {title: "Destination User", select: "remote_user"},
                        {title: "Destination IP", select: "remote_ip"},
                        {title: "MB from Remote", select: "in_bytes"},
                        {title: "MB to Remote", select: "out_bytes"},
                        {title: "Packets from Remote", select: "in_packets"},
                        {title: "Packets to Remote", select: "out_packets"}
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var dns = {
                    query: 'SELECT '+
                                '\'DNS\' AS type,'+
                                '`time`,'+
                                '`proto`,'+
                                '`qclass_name`,'+
                                '`qtype_name`,'+
                                '`query`,'+
                                '`answers`,'+
                                '`TTLs`,'+
                                '`conn_uids`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity` '+
                            'FROM '+
                                '`dns` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Protocol", select: "proto"},
                        {title: "Query Class", select: "qclass_name"},
                        {title: "Query Type", select: "qtype_name"},
                        {title: "Query", select: "query"},
                        {title: "Answers", select: "answers"},
                        {title: "TTLs", select: "TTLs"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: "IOC Severity", select: "ioc_severity"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var http = {
                    query: 'SELECT '+
                                '\'HTTP\' AS type,'+
                                '`time`,'+
                                '`ioc_count`,'+
                                '`host`,'+
                                '`uri`,'+
                                '`referrer`,'+
                                '`user_agent`,'+
                                '`request_body_len`,'+
                                '`response_body_len`,'+
                                '`status_code`,'+
                                '`status_msg`,'+
                                '`info_code`,'+
                                '`info_msg`,'+
                                '`conn_uids`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`http` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Host", select: "host"},
                        {title: "URI", select: "uri"},
                        {title: "Referrer", select: "referrer"},
                        {title: "User Agent", select: "user_agent"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: 'Allowed By Proxy', select: 'proxy_blocked', access: [2] },
                        {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }   
                var ssl = {
                    query: 'SELECT '+
                                '\'SSL\' AS type, '+
                                '`time`,'+
                                '`server_name`,'+
                                '`version`,'+
                                '`cipher`,'+
                                '`subject`,'+
                                '`issuer_subject`,'+
                                '`conn_uids`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+    
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`ssl` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: 'Time', select: 'time'},
                        {title: 'Server Name', select: 'server_name', pattern: true},
                        {title: 'Version', select: 'version'},
                        {title: 'Cipher', select: 'cipher'},
                        {title: 'Subject', select: 'subject'},
                        {title: 'Issuer', select: 'issuer_subject'},
                        {title: 'IOC', select: 'ioc'},
                        {title: 'IOC Type', select: 'ioc_typeIndicator'},
                        {title: 'IOC Stage', select: 'ioc_typeInfection'},
                        {title: 'IOC Rule', select: 'ioc_rule'},
                        {title: 'IOC Severity', select: 'ioc_severity'},
                        {title: 'Allowed By Proxy', select: 'proxy_blocked', access: [2] },
                        {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var email = {
                    query: 'SELECT '+
                                '\'Email\' AS type, '+
                                'time, '+
                                '`lan_machine`,'+
                                '`lan_zone`,'+
                                '`lan_ip`,'+
                                '`remote_ip`,'+
                                '`remote_country`,'+
                                '`mailfrom`,'+
                                '`receiptto`,'+
                                '`reply_to`,'+
                                '`in_reply_to`,'+
                                '`subject`,'+
                                '`conn_uids`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`, '+    
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count` '+
                            'FROM '+
                                '`smtp` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: 'Zone', select: 'lan_zone' },
                        {title: 'Machine Name', select: 'lan_machine', pattern: true},
                        {title: 'Local IP', select: 'lan_ip', pattern: true },
                        {title: 'Remote IP', select: 'remote_ip', pattern: true },
                        {title: 'Remote Country', select: 'remote_country', pattern: true },
                        {title: 'From', select: 'mailfrom' },
                        {title: 'To', select: 'receiptto' },
                        {title: 'Reply To', select: 'reply_to' },
                        {title: 'In Reply To', select: 'in_reply_to' },
                        {title: 'Subject', select: 'subject' },
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Count", select: "ioc_count"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var file = {
                    query: 'SELECT '+
                                '\'File\' AS type, '+
                                '`time`, '+
                                '`mime`,'+
                                '`name`,'+
                                '`size`,'+
                                '`md5`,'+
                                '`sha1`,'+
                                '`conn_uids`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count` '+
                            'FROM '+
                                '`file` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `mime` NOT REGEXP \'text\' '+
                                'AND `mime` != \'-\' '+
                            'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "File Type", select: "mime", pattern: true},
                        {title: "Name", select: "name", pattern: true},
                        {title: "Size", select: "size", pattern: true},
                        {title: "MD5", select: "md5", pattern: true},
                        {title: "SHA1", select: "sha1", pattern: true},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                        {title: "IOC Severity", select: "ioc_severity"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                var endpoint = {
                    query: 'SELECT '+
                                '\'Endpoint\' AS type,'+
                                'time,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`event_src`,'+
                                '`event_id`,'+
                                '`event_type`,'+
                                '`event_detail` '+
                            'FROM '+
                                '`endpoint_events` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                        'LIMIT 2500',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine Name", select: "lan_machine", pattern: true},
                        {title: "User", select: "lan_user", pattern: true},
                        {title: "Lan IP", select: "lan_ip", pattern: true},
                        {title: "Event Type", select: "event_type"},
                        {title: "Event Detail", select: "event_detail"},
                        {title: "Event Source", select: "event_src"},
                        {title: "Event ID", select: "event_id"},
                    ],
                    settings: {
                        access: req.session.passport.user.level
                    }
                }
                async.parallel([
                    // Table function(s)
                    function(callback) { // conn_ioc
                        new lanegraph(conn_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // iocseverity
                        new lanegraph(iocseverity, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // conn
                        new lanegraph(conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // application
                        new lanegraph(application, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // stealth conn
                        if (req.session.passport.user.level === 3) {
                            new lanegraph(stealth_conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        } else {
                            callback();
                        }
                    },
                    function(callback) { // stealth drop
                        if (req.session.passport.user.level === 3) {
                            new lanegraph(stealth_drop, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        } else {
                            callback();
                        }
                    },
                    function(callback) { // dns
                        new lanegraph(dns, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // http
                        new lanegraph(http, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // ssl
                        new lanegraph(ssl, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // email
                        new lanegraph(email, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // file
                        new lanegraph(file, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // endpoint
                        new lanegraph(endpoint, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    res.json({
                        laneGraph: result
                    });
                });
            } else if (req.query.trigger_type === 'Quarantine') {
                new query({query: 'SELECT * FROM `stealth_user` WHERE `lan_user` = ? AND `group` = ? ', insert: [req.query.user_quarantine,req.query.trigger_type]}, {database: database, pool: pool}, function(err,data){
                    if (data) {
                        res.json(data);
                    }
                });   
            }  else if (req.query.trigger_type === 'firewall') {
                new query({query: 'SELECT count(*) AS firewall_count FROM `firewall` ', insert: []}, {database: database, pool: pool}, function(err,data){
                    if (data) {
                        res.json(data);
                    }
                });   
            } else if (req.query.type === 'child_id') {
                new query({query: 'SELECT `ioc`, `typeIndicator`, `type` FROM `ioc` WHERE id_child = ? ', insert: [req.query.ioc_childID]}, {database: 'cyrin', pool: pool}, function(err,data){
                    if (data) {
                        //need to know if only IP is given, or both IP and Port
                        var ioc_ip;
                        var ioc_port;
                        var toHighlight = false;
                        var ui_data = [];
                        for(var i = 0; i < data.length; i++) {
                            ui_data.push({
                                ioc: data[i].ioc, 
                                typeIndicator: data[i].typeIndicator
                            });
                            switch(data[i].type) {
                                case "IPType":
                                console.log("IPType")
                                    ioc_ip = data[i].ioc;
                                break;
                                case "PortType":
                                    ioc_port = data[i].ioc_port;
                                break;//COULD HANDLE OTHER IOC TYPES HERE ALSO...
                                default:
                                break;
                            }
                        }

                        // console.log(req.query.lan_user);
                        // console.log(req.query.lan_ip);
                        // console.log(req.query.lan_zone);
                        // console.log(ioc_ip);
                        // console.log(ioc_port);

                        //if both IP and Port are defined for the IOC, look for the combination of the two
                        if(ioc_ip && ioc_port) {
                            new query({query: 'SELECT * FROM `conn` WHERE `lan_user` = ? AND `lan_ip` = ? AND `lan_zone` = ? AND `remote_ip` = ? AND `remote_port` = ? ', insert: [req.query.lan_user, req.query.lan_ip, req.query.lan_zone, ioc_ip, ioc_port]}, {database: database, pool: pool}, function(err,result){
                                if(result) {
                                    toHighlight = true;
                                }
                            });
                        } else if(ioc_ip) { //if only the IP is defined, look for the IP
                            new query({query: 'SELECT * FROM `conn` WHERE `lan_user` = ? AND `lan_ip` = ? AND `lan_zone` = ? AND `remote_ip` = ? ', insert: [req.query.lan_user, req.query.lan_ip, req.query.lan_zone, ioc_ip]}, {database: database, pool: pool}, function(err,result){
                                if(result) {
                                    toHighlight = true;
                                }
                            });
                        } //DO WE WANT TO HANDLE OTHER IOC TYPES? (Domain, etc...)
                        

                        res.json({data: ui_data, highlight: toHighlight});
                    }
                });  
            } else if (req.query.type === 'assets') {
                if (req.query.lan_ip && req.query.lan_zone) {
                    var sql = {
                        query: 'SELECT '+
                                    '`file` '+
                                'FROM '+
                                    '`assets` '+
                                'WHERE '+
                                    '`lan_ip` = ? '+
                                    'AND `lan_zone` = ?',
                        insert: [req.query.lan_ip, req.query.lan_zone]
                    }
                    new query(sql, {database: database, pool: pool}, function(err,data){
                        res.json(data)
                    });
                }
            } else if (req.query.type === 'custom_user') {
                if (req.query.lan_ip && req.query.lan_zone) {
                    var sql = {
                        query: 'SELECT '+
                                    '`custom_user` '+
                                'FROM '+
                                    '`users` '+
                                'WHERE '+
                                    '`lan_ip` = ? '+
                                    'AND `lan_zone` = ?',
                        insert: [req.query.lan_ip, req.query.lan_zone]
                    }
                    new query(sql, {database: database, pool: pool}, function(err,data){
                        res.json(data)
                    });
                }
            } else {
                if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip && req.query.ioc && req.query.ioc_attrID) {
                    var crossfilter;
                    var conn_ioc = {
                        query: 'SELECT '+
                                    '\'Conn_ioc\' AS type,'+
                                    '`time`,'+
                                    '`stealth`,'+
                                    '`lan_zone`,'+
                                    '`lan_machine`,'+
                                    '`lan_user`,'+
                                    '`lan_ip`,'+
                                    '`lan_port`,'+
                                    '`remote_ip`,'+
                                    '`remote_port`,'+
                                    '`remote_country`,'+
                                    '`remote_asn_name`,'+
                                    '`in_bytes`,'+
                                    '`out_bytes`,'+
                                    '`l7_proto`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_count`,'+
                                    '`proxy_blocked`,'+
                                    '`proxy_rule` '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip` = ? '+
                                    'AND `remote_ip` = ? '+
                                    'AND `ioc`= ? '+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                        params: [
                            {title: "Time", select: "time"},
                            {title: 'Stealth', select: 'stealth', access: [3] },
                            {title: "Zone", select: "lan_zone"},
                            {title: "Machine", select: "lan_machine", pattern: true},
                            {title: "Local User", select: "lan_user", pattern: true},
                            {title: "Local IP", select: "lan_ip", pattern: true},
                            {title: "Local Port", select: "lan_port", pattern: true},
                            {title: "Remote IP", select: "remote_ip", pattern: true},
                            {title: "Remote Port", select: "remote_port", pattern: true},
                            {title: "Remote Country", select: "remote_country", pattern: true},
                            {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                            {title: "Application", select: "l7_proto", pattern: true},
                            {title: "Bytes to Remote", select: "in_bytes"},
                            {title: "Bytes from  Remote", select: "out_bytes"},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                            {title: 'ABP', select: 'proxy_blocked', access: [2] },
                            {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2]  },
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var iocseverity = {
                        query: 'SELECT '+
                                    '\'IOC Severity\' AS type, '+
                                    '`time`,'+
                                    '`stealth`,'+
                                    '`lan_zone`,'+
                                    '`lan_machine`,'+
                                    '`lan_user`,'+
                                    '`lan_ip`,'+
                                    '`lan_port`,'+
                                    '`remote_ip`,'+
                                    '`remote_port`,'+
                                    '`remote_country`,'+
                                    '`remote_asn_name`,'+
                                    '`in_bytes`,'+
                                    '`out_bytes`,'+
                                    '`l7_proto`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_count`,'+
                                    '`proxy_blocked`,'+
                                    '`proxy_rule` '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`= ? '+
                                    'AND `ioc_severity` >= 1 ' +  
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            // {title: 'Stealth', select: 'stealth', access: [3] },
                            // {title: 'ABP', select: 'proxy_blocked', access: [2] },
                            // {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                            {title: "Zone", select: "lan_zone"},
                            {title: "Machine", select: "lan_machine", pattern: true},
                            {title: "Local User", select: "lan_user", pattern: true},
                            {title: "Local IP", select: "lan_ip", pattern: true},
                            {title: "Local Port", select: "lan_port", pattern: true},
                            {title: "Remote IP", select: "remote_ip", pattern: true},
                            {title: "Remote Port", select: "remote_port", pattern: true},
                            {title: "Remote Country", select: "remote_country", pattern: true},
                            {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                            {title: "Application", select: "l7_proto", pattern: true},
                            {title: "Bytes to Remote", select: "in_bytes"},
                            {title: "Bytes from Remote", select: "out_bytes"},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var conn = {
                        query: 'SELECT '+
                                '\'Conn\' AS type, '+
                                '`time`,'+
                                '`stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_country`,'+
                                '`remote_asn_name`,'+
                                '`in_bytes`,'+
                                '`out_bytes`,'+
                                '`l7_proto`,'+
                                '`conn_uids`,'+
                                '`ioc`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_rule`,'+
                                '`ioc_severity`,'+
                                '`ioc_count`,'+
                                '`proxy_blocked`,'+
                                '`proxy_rule` '+
                            'FROM '+
                                '`conn_ioc` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone`= ? '+
                                'AND `lan_ip`= ? '+
                            'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: 'Stealth', select: 'stealth', access: [3] },
                            {title: "Zone", select: "lan_zone"},
                            {title: "Machine", select: "lan_machine", pattern: true},
                            {title: "Local User", select: "lan_user", pattern: true},
                            {title: "Local IP", select: "lan_ip", pattern: true},
                            {title: "Local Port", select: "lan_port", pattern: true},
                            {title: "Remote IP", select: "remote_ip", pattern: true},
                            {title: "Remote Port", select: "remote_port", pattern: true},
                            {title: "Remote Country", select: "remote_country", pattern: true},
                            {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                            {title: "Application", select: "l7_proto", pattern: true},
                            {title: "Bytes to Remote", select: "in_bytes"},
                            {title: "Bytes from Remote", select: "out_bytes"},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                            {title: "IOC Count", select: "ioc_count"},
                            {title: 'ABP', select: 'proxy_blocked', access: [2] },
                            {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var stealth_drop = {
                        query: 'SELECT '+
                                '\'Stealth_drop\' AS type, '+
                                'time,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`conn_uids`,'+
                                '`remote_machine`,'+
                                '`remote_user`,'+
                                '`remote_ip`,'+
                                '(`in_bytes` / 1048576) AS in_bytes,'+
                                '(`out_bytes` / 1048576) AS out_bytes,'+
                                '`in_packets`, '+
                                '`out_packets` '+
                            'FROM '+
                                '`stealth_conn_meta` '+
                            'WHERE '+
                                'time BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND (`in_bytes` = 0 OR `out_bytes` = 0)'+
                            'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "Zone", select: "lan_zone"},
                            {title: "Source Machine", select: "lan_machine"},
                            {title: "Source User", select: "lan_user"},
                            {title: "Source IP", select: "src_ip"},
                            {title: "Destination Machine", select: "remote_machine"},
                            {title: "Destination User", select: "remote_user"},
                            {title: "Destination IP", select: "remote_ip"},
                            {title: "MB from Remote", select: "in_bytes"},
                            {title: "MB to Remote", select: "out_bytes"},
                            {title: "Packets from Remote", select: "in_packets"},
                            {title: "Packets to Remote", select: "out_packets"}
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    } 
                    var application = {
                        query: 'SELECT '+
                                    '\'Applications\' AS type,'+
                                    '`time`,'+
                                    '`stealth`,'+
                                    '`lan_zone`,'+
                                    '`lan_machine`,'+
                                    '`lan_user`,'+
                                    '`lan_ip`,'+
                                    '`lan_port`,'+
                                    '`remote_ip`,'+
                                    '`remote_port`,'+
                                    '`remote_country`,'+
                                    '`remote_asn_name`,'+
                                    '`in_bytes`,'+
                                    '`out_bytes`,'+
                                    '`l7_proto`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_count`,'+
                                    '`proxy_blocked`,'+
                                    '`proxy_rule` '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ? '+
                                    'AND `l7_proto` != \'-\' '+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            // {title: 'Stealth', select: 'stealth', access: [3] },
                            // {title: "Zone", select: "lan_zone"},
                            {title: "Machine", select: "lan_machine", pattern: true},
                            {title: "Local User", select: "lan_user", pattern: true},
                            {title: "Local IP", select: "lan_ip", pattern: true},
                            {title: "Local Port", select: "lan_port", pattern: true},
                            {title: "Remote IP", select: "remote_ip", pattern: true},
                            {title: "Remote Port", select: "remote_port", pattern: true},
                            {title: "Remote Country", select: "remote_country", pattern: true},
                            // {title: "Remote ASN", select: "remote_asn_name", pattern: true},
                            {title: "Application", select: "l7_proto", pattern: true},
                            {title: "Bytes to Remote", select: "in_bytes"},
                            {title: "Bytes from Remote", select: "out_bytes"},
                            // {title: "IOC", select: "ioc"},
                            // {title: "IOC Type", select: "ioc_typeIndicator"},
                            // {title: "IOC Stage", select: "ioc_typeInfection"},
                            // {title: "IOC Rule", select: "ioc_rule"},
                            // {title: "IOC Severity", select: "ioc_severity"},
                            {title: "IOC Count", select: "ioc_count"},
                            // {title: 'ABP', select: 'proxy_blocked', access: [2] },
                            // {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var dns = {
                        query: 'SELECT '+
                                    '\'DNS\' AS type,'+
                                    '`time`,'+
                                    '`proto`,'+
                                    '`qclass_name`,'+
                                    '`qtype_name`,'+
                                    '`query`,'+
                                    '`answers`,'+
                                    '`TTLs`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_severity` '+
                                'FROM '+
                                    '`dns_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ? '+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "Protocol", select: "proto"},
                            {title: "Query Class", select: "qclass_name"},
                            {title: "Query Type", select: "qtype_name"},
                            {title: "Query", select: "query"},
                            {title: "Answers", select: "answers"},
                            {title: "TTLs", select: "TTLs"},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var http = {
                        query: 'SELECT '+
                                    '\'HTTP\' AS type,'+
                                    '`time`,'+
                                    '`host`,'+
                                    '`uri`,'+
                                    '`referrer`,'+
                                    '`user_agent`,'+
                                    '`request_body_len`,'+
                                    '`response_body_len`,'+
                                    '`status_code`,'+
                                    '`status_msg`,'+
                                    '`info_code`,'+
                                    '`info_msg`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_count`,'+
                                    '`proxy_blocked`,'+
                                    '`proxy_rule` '+
                                'FROM '+
                                    '`http_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ? '+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "Host", select: "host"},
                            {title: "URI", select: "uri"},
                            {title: "Referrer", select: "referrer"},
                            {title: "User Agent", select: "user_agent"},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                            {title: 'Allowed By Proxy', select: 'proxy_blocked', access: [2] },
                            {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var ssl = {
                        query: 'SELECT '+
                                    '\'SSL\' AS type,'+
                                    '`time`,'+
                                    '`ioc_count`,'+
                                    '`version`,'+
                                    '`cipher`,'+
                                    '`server_name`,'+
                                    '`subject`,'+
                                    '`issuer_subject`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+    
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`proxy_blocked`,'+
                                    '`proxy_rule` '+
                                'FROM '+
                                    '`ssl_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ?'+
                                    'AND `lan_ip`= ?'+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "Server Name", select: "server_name", pattern: true},
                            {title: "Version", select: "version"},
                            {title: "cipher", select: "cipher"},
                            {title: "Subject", select: "subject"},
                            {title: "Issuer", select: "issuer_subject"},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                            {title: 'Allowed By Proxy', select: 'proxy_blocked', access: [2] },
                            {title: 'Proxy Block Policy', select: 'proxy_rule', access: [2] },
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var email = {
                        query: 'SELECT '+
                                    '\'Email\' AS type, '+
                                    'time, '+
                                    '`lan_machine`,'+
                                    '`lan_zone`,'+
                                    '`lan_ip`,'+
                                    '`remote_ip`,'+
                                    '`remote_country`,'+
                                    '`mailfrom`,'+
                                    '`receiptto`,'+
                                    '`reply_to`,'+
                                    '`in_reply_to`,'+
                                    '`subject`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`, '+    
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_count` '+
                                'FROM '+
                                    '`smtp_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ? '+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: 'Zone', select: 'lan_zone' },
                            {title: 'Machine Name', select: 'lan_machine' },
                            {title: 'Local IP', select: 'lan_ip' },
                            {title: 'Remote IP', select: 'remote_ip', pattern: true },
                            {title: 'Remote Country', select: 'remote_country', pattern: true },
                            {title: 'From', select: 'mailfrom' },
                            {title: 'To', select: 'receiptto' },
                            {title: 'Reply To', select: 'reply_to' },
                            {title: 'In Reply To', select: 'in_reply_to' },
                            {title: 'Subject', select: 'subject' },
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                            {title: "IOC Severity", select: "ioc_severity"},
                            {title: "IOC Count", select: "ioc_count"},
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var file = {
                        query: 'SELECT '+
                                    '\'File\' AS type,'+
                                    '`time`,'+
                                    '`mime`,'+
                                    '`name`,'+
                                    '`size`,'+
                                    '`md5`,'+
                                    '`sha1`,'+
                                    '`conn_uids`,'+
                                    '`ioc`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_count` '+
                                'FROM '+
                                    '`file_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ? '+
                                    'AND `mime` NOT REGEXP \'text\' '+
                            'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "File Type", select: "mime", pattern: true},
                            {title: "Name", select: "name", pattern: true},
                            {title: "Size", select: "size", pattern: true},
                            {title: "MD5", select: "md5", pattern: true},
                            {title: "SHA1", select: "sha1", pattern: true},
                            {title: "IOC", select: "ioc"},
                            {title: "IOC Severity", select: "ioc_severity"},
                            {title: "IOC Type", select: "ioc_typeIndicator"},
                            {title: "IOC Stage", select: "ioc_typeInfection"},
                            {title: "IOC Rule", select: "ioc_rule"},
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var endpoint = {
                       query: 'SELECT '+
                                    '\'Endpoint\' AS type,'+
                                    '`time`,'+
                                    '`lan_zone`,'+
                                    '`lan_machine`,'+
                                    '`lan_user`,'+
                                    '`lan_ip`,'+
                                    '`event_src`,'+
                                    '`event_id`,'+
                                    '`event_type`,'+
                                    '`event_detail` '+
                                'FROM '+
                                    '`endpoint_events` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ? '+
                                'LIMIT 2500',
                        insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "Zone", select: "lan_zone"},
                            {title: "Machine Name", select: "lan_machine", pattern: true},
                            {title: "User", select: "lan_user", pattern: true},
                            {title: "Lan IP", select: "lan_ip", pattern: true},
                            {title: "Event Type", select: "event_type"},
                            {title: "Event Detail", select: "event_detail"},
                            {title: "Event Source", select: "event_src"},
                            {title: "Event ID", select: "event_id"},
                        ],
                        settings: {
                            access: req.session.passport.user.level
                        }
                    }
                    var info = {};
                    var InfoSQL = {
                        query: 'SELECT '+
                                    '`id`, '+
                                    '`time`, '+
                                    'min(`time`) as first, '+
                                    'max(`time`) as last, '+
                                    'sum(`in_packets`) as in_packets, '+
                                    'sum(`out_packets`) as out_packets, '+
                                    'sum(`in_bytes`) as in_bytes, '+
                                    'sum(`out_bytes`) as out_bytes, '+
                                    '`lan_machine`, '+
                                    '`lan_zone`, '+
                                    '`lan_user`, '+
                                    '`lan_port`, '+
                                    '`remote_port`, '+
                                    '`remote_cc`, '+
                                    '`remote_country`, '+
                                    '`remote_asn`, '+
                                    '`remote_asn_name`, '+
                                    '`l7_proto`, '+
                                    '`ioc_rule`, '+
                                    '`ioc_typeIndicator` '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    '`lan_ip` = ? '+
                                    'AND `remote_ip` = ? '+
                                    'AND `ioc` = ? '+
                                'LIMIT 1',
                        insert: [req.query.lan_ip, req.query.remote_ip, req.query.ioc]
                    }
                    var Info2SQL = {
                        query: 'SELECT '+
                                    '`description` '+
                                'FROM '+
                                    '`ioc_parent` '+
                                'WHERE '+
                                    '`ioc_parent` = ? '+
                                'LIMIT 1',
                        insert: [req.query.ioc]
                    }
                    var treereturn = [];
                    var treeSQL = {
                        query: 'SELECT '+
                                    'ioc_attrID, '+
                                    'ioc_childID, '+
                                    'ioc_parentID, '+
                                    'ioc_typeIndicator, '+
                                    'ioc_severity, '+
                                    'conn_ioc.ioc '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+
                                'GROUP BY '+
                                    'ioc_parentID, '+
                                    'ioc_childID, '+
                                    'ioc_attrID',
                        insert: [start, end, req.query.lan_ip]
                    }
                    var forcereturn = [];
                    var forceSQL = {
                        query: 'SELECT '+
                                    '`remote_ip`, '+
                                    'count(*) as count '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `lan_ip`= ? '+
                                'GROUP BY '+
                                    'remote_ip',
                        insert: [start, end, req.query.lan_ip]
                    }
                    var lanIP = req.query.lan_ip;
                    var attrID = req.query.ioc_attrID;
                    async.parallel([
                        // Table function(s)
                        function(callback) { // conn_ioc
                            new lanegraph(conn_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // iocseverity
                            new lanegraph(iocseverity, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // conn
                            new lanegraph(conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // application
                            new lanegraph(application, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // stealth block
                            if (req.session.passport.user.level === 3) {
                                new lanegraph(stealth_drop, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    console.log(data)
                                    handleReturn(data, callback);
                                });
                            } else {
                                callback();
                            }
                        },
                        function(callback) { // dns
                            new lanegraph(dns, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // http
                            new lanegraph(http, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // ssl
                            new lanegraph(ssl, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // email
                            new lanegraph(email, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // file
                            new lanegraph(file, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // endpoint
                            new lanegraph(endpoint, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        },
                        function(callback) { // InfoSQL
                            new query(InfoSQL, {database: database, pool: pool}, function(err,data){
                                info.main = data;
                                callback();
                            });
                        },
                        function(callback) { // Info2SQL
                            new query(Info2SQL, {database: 'rp_ioc_intel', pool: pool}, function(err,data){
                                info.desc = data;
                                callback();
                            });
                        },
                        function(callback) { // forceSQL
                            new force(forceSQL, {database: database, pool: pool}, lanIP, function(err,data){
                                forcereturn = data;
                                callback();
                            });
                        },
                        function(callback) { // treeSQL
                            new treechart(treeSQL, {database: database, pool: pool}, lanIP, attrID, function(err,data){
                                treereturn = data;
                                callback();
                            });
                        },
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err);
                        res.json({
                            info: info,
                            laneGraph: result,
                            start: start,
                            end: end,
                            tree: treereturn,
                            force: forcereturn
                        });
                    });
                } else {
                    res.redirect('/');
                }
            }
        },
        set_info: function(req, res) {
            var database = req.session.passport.user.database;
            if (req.query.trigger_type === 'Quarantine' || req.query.trigger_type === 'rQuarantine') {
                var update_flag = {
                    query: "INSERT INTO `script_trigger` (`type`, `flag`,`time`, `email`) VALUES (?,?,?,?)",
                    insert: [req.query.trigger_type, req.query.flag, req.query.currenttime, req.query.email]
                }
                new query(update_flag, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    } else {
                        res.send(200);
                    }
                });

            } /*else if (req.query.trigger_type === 'stealthquarantine') {
               var update_quarantine = {
                    query: "INSERT INTO `stealth_quarantine` (`time`, `email`, `lan_zone`, `lan_user`) VALUES (?,?,?,?)",
                    insert: [req.query.currenttime, req.query.email, req.query.lan_zone, req.query.lan_user]
                }
                new query(update_quarantine, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    } else {
                        res.send(200);
                    }
                });
            } */else if (req.query.trigger_type === 'firewall') {
                var update_firewall = {
                    query: "INSERT INTO `firewall` (`time`,`email`,`rule`,`type`) VALUES (?,?,?,?)",
                    insert: [req.query.currenttime, req.query.email, req.query.rule, req.query.type]
                }
                new query(update_firewall, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.send(500);
                    } else {
                        res.send(200);
                    }
                });
            }
        },
        pattern: function(req, res) {
            // set the datbase the user queries
            var database = req.session.passport.user.database;
            // we make a whitelist since we will be relying on the front end to send up custom selects
            var allowedSelects = ['lan_user', 'lan_ip'];
            function makeQueries() {
                var queryList = [];
                var selectList = ['lan_user', 'lan_ip']; // TEMPORARY.. this is going to be sent up with user8
                var selectString = '';
                // make sure selects are present
                if (selectList.length < 1) { return false; }
                for (var n in selectList) {
                    // bail out if select is not in our allowed list
                    if (allowedSelects.indexOf(selectList[n]) === -1) { return false; }
                    // append string
                    selectString += selectList[n];
                    // if not at end of array, use a comma
                    if (selectList.indexOf(selectList[n]) !== (selectList.length-1)) {
                        selectString += ',';
                    // otherwise just add a space
                    }
                }
                for (var i in req.body) {
                    console.log(req.body[i])
                    if (i !== 'length') { // ignore the length key, since we placed it in manually for use on front-end 
                        // set current query object
                        var thisQuery = {
                            query: null,
                            insert: [],
                            passed: req.body[i]
                        }
                        // build string(s)
                        var queryString = 'SELECT '+selectString+' FROM ';
                        // switch for stating what query type connects to what table
                        switch (req.body[i].point.type) {
                            case 'Conn':
                                queryString += '`conn`';
                            break;
                            case 'File':
                                queryString += '`file`';
                            break;
                            case 'SSL':
                                queryString += '`ssl`';
                            break;
                            case 'Email':
                                queryString += '`smtp`';
                            break;
                            default:
                                queryString += '`conn`';
                            break;
                        }
                        queryString += ' WHERE ';
                        var total = 1; // we count so the last inserted doesn't get an AND.. we also know theres at least one
                        for (var s in req.body[i].search) {
                            // ignore the length key again, since we placed it in manually for use on front-end
                            if (s !== 'length') {
                                var searchItem = req.body[i].search[s];
                                if (total === req.body[i].search.length) {
                                    queryString += searchItem.select+' = ? ';
                                } else {
                                    queryString += searchItem.select+' = ? AND ';
                                }
                                // push escaped values seperately
                                thisQuery.insert.push(searchItem.value);
                                total++;
                            }
                        }
                        queryString += 'GROUP BY '+selectString;
                        thisQuery.query = queryString;
                        queryList.push(thisQuery);
                    }
                }
                return queryList;
            }
            function processQueries(queries, callback) {
                var results = [], qLength = queries.length, index = 0;
                for (var q in queries) {
                    // query every item in our query array
                    new query(queries[q], {database: database, pool: pool}, function(err, data, passed){
                        if (err) { callback(err); }
                        results.push({
                            result: data,
                            point: passed.point,
                            selected: passed.search
                        })
                        index++;
                        // within return, callback if we've reached gor responses from all queries
                        if (index === qLength) {
                            callback(null, results);
                        }
                    });
                }
            }
            var queries = makeQueries();
            processQueries(queries, function(err, results){
                if (err) throw console.log(err);
                res.json(results);
            });
        }
    }
};
