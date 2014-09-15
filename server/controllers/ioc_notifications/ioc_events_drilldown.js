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
                    // data.aaData.columns = data.params;
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
                lanes = ['ioc', 'conn', 'file', 'dns', 'http', 'ssl', 'endpoint', 'stealth'];
            } else {
                lanes = ['ioc', 'conn', 'file', 'dns', 'http', 'ssl', 'endpoint'];
            }
            var result = {
                lanes: lanes,
                data: []
            };

            if (req.query.type === 'drill') {
                var conn_ioc = {
                    query: 'SELECT '+
                            '\'conn_ioc\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
                            '`ioc_count`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            '`lan_ip`,'+
                            '`lan_port`,'+
                            '`remote_ip`,'+
                            '`remote_port`,'+
                            '`remote_country`,'+
                            '`remote_asn_name`,'+
                            '`in_bytes`,'+
                            '`out_bytes`,'+
                            '`l7_proto`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`conn` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`= ? '+
                            'AND `remote_ip`= ? '+
                            'AND `ioc`=? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine", select: "machine"},
                        {title: "Local IP", select: "lan_ip"},
                        {title: "Local Port", select: "lan_port"},
                        {title: "Remote IP", select: "remote_ip"},
                        {title: "Remote Port", select: "remote_port"},
                        {title: "Remote Country", select: "remote_country"},
                        {title: "Remote ASN", select: "remote_asn_name"},
                        {title: "Application", select: "l7_proto"},
                        {title: "Bytes to Remote", select: "in_bytes"},
                        {title: "Bytes from  Remote", select: "out_bytes"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var conn = {
                    query: 'SELECT '+
                            '\'conn\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`ioc_count`,'+
                            '`lan_zone`,'+
                            '`machine`,'+
                            '`lan_ip`,'+
                            '`lan_port`,'+
                            '`remote_ip`,'+
                            '`remote_port`,'+
                            '`remote_country`,'+
                            '`remote_asn_name`,'+
                            '`in_bytes`,'+
                            '`out_bytes`,'+
                            '`l7_proto`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`conn` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`= ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine", select: "machine"},
                        {title: "Local IP", select: "lan_ip"},
                        {title: "Local Port", select: "lan_port"},
                        {title: "Remote IP", select: "remote_ip"},
                        {title: "Remote Port", select: "remote_port"},
                        {title: "Remote Country", select: "remote_country"},
                        {title: "Remote ASN", select: "remote_asn_name"},
                        {title: "Application", select: "l7_proto"},
                        {title: "Bytes to Remote", select: "in_bytes"},
                        {title: "Bytes from Remote", select: "out_bytes"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var dns_ioc = {
                    query: 'SELECT '+
                            '\'dns_ioc\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`ioc_count`,'+
                            '`proto`, '+
                            '`qclass_name`, '+
                            '`qtype_name`, '+
                            '`query`, '+
                            '`answers`, '+
                            '`TTLs`, '+
                            '`ioc`, '+
                            '`ioc_severity`, '+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`, '+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`dns` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`= ? '+
                            'AND `remote_ip`= ? '+
                            'AND `ioc`=?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Protocol", select: "proto"},
                        {title: "Query Class", select: "qclass_name"},
                        {title: "Query Type", select: "qtype_name"},
                        {title: "Query", select: "query"},
                        {title: "Answers", select: "answers"},
                        {title: "TTLs", select: "TTLs"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var dns = {
                    query: 'SELECT '+
                            '\'dns\' AS type,'+
                            '`time` AS raw_time,'+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                            '`proto`,'+
                            '`qclass_name`,'+
                            '`qtype_name`,'+
                            '`query`,'+
                            '`answers`,'+
                            '`TTLs`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`dns` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_ip` = ?',
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
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var http_ioc = {
                    query: 'SELECT '+
                            '\'http_ioc\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
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
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`http` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`= ? '+
                            'AND `remote_ip`= ? '+
                            'AND `ioc`=?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
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
                    ]
                }
                var http = {
                    query: 'SELECT '+
                            '\'http\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
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
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`http` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ?'+
                            'AND `lan_ip`= ?',
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
                    ]
                }
                var ssl_ioc = {
                    query: 'SELECT '+
                            '\'ssl_ioc\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`ioc_count`,'+
                            '`version`,'+
                            '`cipher`,'+
                            '`server_name`,'+
                            '`subject`,'+
                            '`issuer_subject`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+    
                        'FROM '+
                            '`ssl` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`= ? '+
                            'AND `remote_ip`= ? '+
                            'AND `ioc`=?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Server Name", select: "server_name"},
                        {title: "Version", select: "version"},
                        {title: "Cipher", select: "cipher"},
                        {title: "Subject", select: "subject"},
                        {title: "Issuer", select: "issuer_subject"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var ssl = {
                    query: 'SELECT '+
                            '\'ssl\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`ioc_count`,'+
                            '`version`,'+
                            '`cipher`,'+
                            '`server_name`,'+
                            '`subject`,'+
                            '`issuer_subject`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+    
                        'FROM '+
                            '`ssl` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ?'+
                            'AND `lan_ip`= ?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Server Name", select: "server_name"},
                        {title: "Version", select: "version"},
                        {title: "Cipher", select: "cipher"},
                        {title: "Subject", select: "subject"},
                        {title: "Issuer", select: "issuer_subject"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var file_ioc = {
                    query: 'SELECT '+
                            '\'file_ioc\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`ioc_count`,'+
                            '`mime`,'+
                            '`name`,'+
                            '`size`,'+
                            '`md5`,'+
                            '`sha1`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`file` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ? '+
                            'AND `lan_ip`=? '+
                            'AND `remote_ip`= ? '+
                            'AND `ioc`=?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "File Type", select: "mime"},
                        {title: "Name", select: "name"},
                        {title: "Size", select: "size"},
                        {title: "MD5", select: "md5"},
                        {title: "SHA1", select: "sha1"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var file = {
                    query: 'SELECT '+
                            '\'file\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`ioc_count`,'+
                            '`mime`,'+
                            '`name`,'+
                            '`size`,'+
                            '`md5`,'+
                            '`sha1`,'+
                            '`ioc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+
                            '`file` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone`= ?'+
                            'AND `lan_ip`= ?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "File Type", select: "mime"},
                        {title: "Name", select: "name"},
                        {title: "Size", select: "size"},
                        {title: "MD5", select: "md5"},
                        {title: "SHA1", select: "sha1"},
                        {title: "IOC", select: "ioc"},
                        {title: "IOC Severity", select: "ioc_severity"},
                        {title: "IOC Type", select: "ioc_typeIndicator"},
                        {title: "IOC Stage", select: "ioc_typeInfection"},
                        {title: "IOC Rule", select: "ioc_rule"},
                    ]
                }
                var endpoint = {
                    query: 'SELECT '+
                                '\'endpoint\' AS type,'+
                                '`time` AS raw_time,'+
                                'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
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
                                'AND `lan_ip` = ? ',
                    insert: [start, end, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Zone", select: "lan_zone"},
                        {title: "Machine Name", select: "lan_machine"},
                        {title: "User", select: "lan_user"},
                        {title: "Lan IP", select: "lan_ip"},
                        {title: "Event Type", select: "event_type"},
                        {title: "Event Detail", select: "event_detail"},
                        {title: "Event Source", select: "event_src"},
                        {title: "Event ID", select: "event_id"},
                    ]
                }
                var stealth_conn = {
                    query: 'SELECT '+
                            '\'stealth\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`src_ip`,'+
                            '`dst_ip`,'+
                            '(`in_bytes` / 1048576) as in_bytes,'+
                            '(`out_bytes` / 1048576) as out_bytes,'+
                            '`in_packets`,'+
                            '`out_packets` '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `src_ip`= ? '+
                            'AND `in_bytes` > 0 '+
                            'AND `out_bytes` > 0 ',
                    insert: [start, end, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Source IP", select: "src_ip"},
                        {title: "Destination IP", select: "dst_ip"},
                        {title: "MB from Remote", select: "in_bytes"},
                        {title: "MB to Remote", select: "out_bytes"},
                        {title: "Packets from Remote", select: "in_packets"},
                        {title: "Packets to Remote", select: "out_packets"}
                    ]
                }
                var stealth_drop = {
                    query: 'SELECT '+
                            '\'stealth_block\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`src_ip`, '+
                            '`dst_ip`, '+
                            '(`in_bytes` / 1048576) as in_bytes, '+
                            '(`out_bytes` / 1048576) as out_bytes, '+
                            '`in_packets`, '+
                            '`out_packets` '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND `src_ip` = ? '+
                            'AND (`in_bytes` = 0 OR `out_bytes` = 0)',
                    insert: [start, end, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Source IP", select: "src_ip"},
                        {title: "Destination IP", select: "dst_ip"},
                        {title: "MB from Remote", select: "in_bytes"},
                        {title: "MB to Remote", select: "out_bytes"},
                        {title: "Packets from Remote", select: "in_packets"},
                        {title: "Packets to Remote", select: "out_packets"}
                    ]
                }

                async.parallel([
                    // Table function(s)
                    function(callback) { // conn_ioc
                        new lanegraph(conn_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // conn
                        new lanegraph(conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // dns_ioc
                        new lanegraph(dns_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // dns
                        new lanegraph(dns, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // http_ioc
                        new lanegraph(http_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // http
                        new lanegraph(http, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // ssl_ioc
                        new lanegraph(ssl_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // ssl
                        new lanegraph(ssl, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // file_ioc
                        new lanegraph(file_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
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
                    }
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    res.json({
                        laneGraph: result
                    });
                });
            } else if (req.query.type === 'assets') {
                if (req.query.lan_ip && req.query.lan_zone) {
                    var sql = {
                        query: 'SELECT `file` FROM assets where lan_ip = ? AND lan_zone = ?',
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
                                    '\'conn_ioc\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
                                    '`ioc_count`,'+
                                    '`lan_zone`,'+
                                    '`machine`,'+
                                    '`lan_ip`,'+
                                    '`lan_port`,'+
                                    '`remote_ip`,'+
                                    '`remote_port`,'+
                                    '`remote_country`,'+
                                    '`remote_asn_name`,'+
                                    '`in_bytes`,'+
                                    '`out_bytes`,'+
                                    '`l7_proto`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`= ? '+
                                    'AND `remote_ip`= ? '+
                                    'AND `ioc`=? '+
                                    'LIMIT 250',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "Zone", select: "lan_zone"},
                                {title: "Machine", select: "machine"},
                                {title: "Local IP", select: "lan_ip"},
                                {title: "Local Port", select: "lan_port"},
                                {title: "Remote IP", select: "remote_ip"},
                                {title: "Remote Port", select: "remote_port"},
                                {title: "Remote Country", select: "remote_country"},
                                {title: "Remote ASN", select: "remote_asn_name"},
                                {title: "Application", select: "l7_proto"},
                                {title: "Bytes to Remote", select: "in_bytes"},
                                {title: "Bytes from  Remote", select: "out_bytes"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var conn = {
                            query: 'SELECT '+
                                    '\'conn\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`ioc_count`,'+
                                    '`lan_zone`,'+
                                    '`machine`,'+
                                    '`lan_ip`,'+
                                    '`lan_port`,'+
                                    '`remote_ip`,'+
                                    '`remote_port`,'+
                                    '`remote_country`,'+
                                    '`remote_asn_name`,'+
                                    '`in_bytes`,'+
                                    '`out_bytes`,'+
                                    '`l7_proto`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`conn_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`= ? '+
                                    'LIMIT 250',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "Zone", select: "lan_zone"},
                                {title: "Machine", select: "machine"},
                                {title: "Local IP", select: "lan_ip"},
                                {title: "Local Port", select: "lan_port"},
                                {title: "Remote IP", select: "remote_ip"},
                                {title: "Remote Port", select: "remote_port"},
                                {title: "Remote Country", select: "remote_country"},
                                {title: "Remote ASN", select: "remote_asn_name"},
                                {title: "Application", select: "l7_proto"},
                                {title: "Bytes to Remote", select: "in_bytes"},
                                {title: "Bytes from Remote", select: "out_bytes"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var dns_ioc = {
                            query: 'SELECT '+
                                    '\'dns_ioc\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`proto`, '+
                                    '`qclass_name`, '+
                                    '`qtype_name`, '+
                                    '`query`, '+
                                    '`answers`, '+
                                    '`TTLs`, '+
                                    '`ioc`, '+
                                    '`ioc_severity`, '+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`, '+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`dns_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`= ? '+
                                    'AND `remote_ip`= ? '+
                                    'AND `ioc`=?',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "Protocol", select: "proto"},
                                {title: "Query Class", select: "qclass_name"},
                                {title: "Query Type", select: "qtype_name"},
                                {title: "Query", select: "query"},
                                {title: "Answers", select: "answers"},
                                {title: "TTLs", select: "TTLs"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var dns = {
                            query: 'SELECT '+
                                    '\'dns\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`proto`,'+
                                    '`qclass_name`,'+
                                    '`qtype_name`,'+
                                    '`query`,'+
                                    '`answers`,'+
                                    '`TTLs`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`dns_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone` = ? '+
                                    'AND `lan_ip` = ?',
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
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var http_ioc = {
                            query: 'SELECT '+
                                    '\'http_ioc\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
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
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`http_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`= ? '+
                                    'AND `remote_ip`= ? '+
                                    'AND `ioc`=?',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
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
                            ]
                        }
                        var http = {
                            query: 'SELECT '+
                                    '\'http\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
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
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`http_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ?'+
                                    'AND `lan_ip`= ?',
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
                            ]
                        }
                        var ssl_ioc = {
                            query: 'SELECT '+
                                    '\'ssl_ioc\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`ioc_count`,'+
                                    '`version`,'+
                                    '`cipher`,'+
                                    '`server_name`,'+
                                    '`subject`,'+
                                    '`issuer_subject`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+    
                                'FROM '+
                                    '`ssl_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`= ? '+
                                    'AND `remote_ip`= ? '+
                                    'AND `ioc`=?',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "Server Name", select: "server_name"},
                                {title: "Version", select: "version"},
                                {title: "cipher", select: "cipher"},
                                {title: "Subject", select: "subject"},
                                {title: "Issuer", select: "issuer_subject"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var ssl = {
                            query: 'SELECT '+
                                    '\'ssl\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`ioc_count`,'+
                                    '`version`,'+
                                    '`cipher`,'+
                                    '`server_name`,'+
                                    '`subject`,'+
                                    '`issuer_subject`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+    
                                'FROM '+
                                    '`ssl_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ?'+
                                    'AND `lan_ip`= ?',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "Server Name", select: "server_name"},
                                {title: "Version", select: "version"},
                                {title: "cipher", select: "cipher"},
                                {title: "Subject", select: "subject"},
                                {title: "Issuer", select: "issuer_subject"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var file_ioc = {
                            query: 'SELECT '+
                                    '\'file_ioc\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`ioc_count`,'+
                                    '`mime`,'+
                                    '`name`,'+
                                    '`size`,'+
                                    '`md5`,'+
                                    '`sha1`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`file_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ? '+
                                    'AND `lan_ip`=? '+
                                    'AND `remote_ip`= ? '+
                                    'AND `ioc`=?',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip, req.query.ioc],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "File Type", select: "mime"},
                                {title: "Name", select: "name"},
                                {title: "Size", select: "size"},
                                {title: "MD5", select: "md5"},
                                {title: "SHA1", select: "sha1"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var file = {
                            query: 'SELECT '+
                                    '\'file\' AS type, '+
                                    '`time` as raw_time, '+
                                    'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                    'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                    '`ioc_count`,'+
                                    '`mime`,'+
                                    '`name`,'+
                                    '`size`,'+
                                    '`md5`,'+
                                    '`sha1`,'+
                                    '`ioc`,'+
                                    '`ioc_severity`,'+
                                    '`ioc_rule`,'+
                                    '`ioc_typeIndicator`,'+
                                    '`ioc_typeInfection` '+
                                'FROM '+
                                    '`file_ioc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_zone`= ?'+
                                    'AND `lan_ip`= ?',
                            insert: [start, end, req.query.lan_zone, req.query.lan_ip],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "File Type", select: "mime"},
                                {title: "Name", select: "name"},
                                {title: "Size", select: "size"},
                                {title: "MD5", select: "md5"},
                                {title: "SHA1", select: "sha1"},
                                {title: "IOC", select: "ioc"},
                                {title: "IOC Severity", select: "ioc_severity"},
                                {title: "IOC Type", select: "ioc_typeIndicator"},
                                {title: "IOC Stage", select: "ioc_typeInfection"},
                                {title: "IOC Rule", select: "ioc_rule"},
                            ]
                        }
                        var endpoint = {
                           query: 'SELECT '+
                                '\'endpoint\' AS type,'+
                                '`time` AS raw_time,'+
                                'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
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
                                'AND `lan_ip` = ? ',
                            insert: [start, end, req.query.lan_ip],
                            params: [
                                {title: "Time", select: "time"},
                                {title: "Zone", select: "lan_zone"},
                                {title: "Machine Name", select: "lan_machine"},
                                {title: "User", select: "lan_user"},
                                {title: "Lan IP", select: "lan_ip"},
                                {title: "Event Type", select: "event_type"},
                                {title: "Event Detail", select: "event_detail"},
                                {title: "Event Source", select: "event_src"},
                                {title: "Event ID", select: "event_id"},
                            ]
                        }                        

                        var info = {};
                        var InfoSQL = {
                            query: 'SELECT '+
                                    'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as last, '+
                                    'date_format(min(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as first, '+
                                    'sum(`in_packets`) as in_packets, '+
                                    'sum(`out_packets`) as out_packets, '+
                                    'sum(`in_bytes`) as in_bytes, '+
                                    'sum(`out_bytes`) as out_bytes, '+
                                    '`machine`, '+
                                    '`lan_zone`, '+
                                    '`lan_port`, '+
                                    '`remote_port`, '+
                                    '`remote_cc`, '+
                                    '`remote_country`, '+
                                    '`remote_asn`, '+
                                    '`remote_asn_name`, '+
                                    '`l7_proto`, '+
                                    '`ioc_rule`, '+
                                    '`ioc_typeIndicator` '+
                                'FROM `conn_ioc` '+
                                'WHERE '+
                                    '`lan_ip` = ? AND '+
                                    '`remote_ip` = ? AND '+
                                    '`ioc` = ? '+
                                'LIMIT 1',
                            insert: [req.query.lan_ip, req.query.remote_ip, req.query.ioc]
                        }
                        var Info2SQL = {
                            query: 'SELECT '+
                                '`description` '+
                                'FROM `ioc_parent` '+
                                'WHERE '+
                                '`ioc_parent` = ? '+
                                'LIMIT 1',
                            insert: [req.query.ioc]
                        }
                        var treereturn = [];
                        var treeSQL = {
                            query: 'SELECT '+
                                // SELECTS
                                    'ioc_attrID, '+
                                    'ioc_childID, '+
                                    'ioc_parentID, '+
                                    'ioc_typeIndicator, '+
                                    'ioc_severity, '+
                                    'conn_ioc.ioc '+
                            //        'id_attr, '+
                            //        'typeIndicator '+
                                // !SELECTS
                                'FROM conn_ioc '+
                            //    'JOIN cyrin.ioc '+
                            //        'ON ioc_childID = id_child '+
                                'WHERE time BETWEEN ? AND ? '+
                                    'AND `lan_ip`= ? '+
                                'GROUP BY  ioc_parentID, ioc_childID, ioc_attrID',// id_attr',
                            insert: [start, end, req.query.lan_ip]
                        }
                        var forcereturn = [];
                        var forceSQL = {
                            query: 'SELECT '+
                                // SELECTS
                                '`remote_ip`, '+
                                'count(*) as count '+
                                // !SELECTS
                                'FROM conn_ioc '+
                                'WHERE time BETWEEN ? AND ? '+
                                'AND `lan_ip`= ? '+
                                'GROUP BY remote_ip',
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
                            function(callback) { // conn
                                new lanegraph(conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // dns_ioc
                                new lanegraph(dns_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // dns
                                new lanegraph(dns, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // http_ioc
                                new lanegraph(http_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // http
                                new lanegraph(http, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // ssl_ioc
                                new lanegraph(ssl_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // ssl
                                new lanegraph(ssl, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            },
                            function(callback) { // file_ioc
                                new lanegraph(file_ioc, {database: database, pool:pool, lanes: lanes}, function(err, data){
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
                            // function(callback) { // stealth
                            //     if (req.session.passport.user.level === 3) {
                            //         new lanegraph(stealth_conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            //             console.log(data)
                            //             handleReturn(data, callback);
                            //         });
                            //     } else {
                            //         callback();
                            //     }
                            // },
                            // function(callback) { // stealth block
                            //     if (req.session.passport.user.level === 3) {
                            //         new lanegraph(stealth_block, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            //             console.log(data)
                            //             handleReturn(data, callback);
                            //         });
                            //     } else {
                            //         callback();
                            //     }
                            // },
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
                            // var results = {
                            //     info: info,
                            //     tables: tables
                            // };
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
            }
    }
};