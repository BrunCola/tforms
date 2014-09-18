'use strict';

var sankey = require('../constructors/sankey_new'),
    lanegraph = require('../constructors/lanegraph'),
    networktree = require('../constructors/networktree'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async');

var permissions = [3];

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
                pointGroup = 60;
            }
            var lanes;
            if (req.session.passport.user.level === 3) {
                lanes = ['ioc', 'conn', 'applications', 'stealth', 'dns', 'http', 'ssl', 'file', 'endpoint'];
            } else {
                lanes = ['ioc', 'conn', 'applications', 'dns', 'http', 'ssl', 'file', 'endpoint'];
            }
            var result = {
                lanes: lanes,
                data: []
            };

            if (req.query.type === 'drill') {
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
                            'AND `lan_ip`= ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
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
                var l7 = {
                    query: 'SELECT '+
                            '\'applications\' AS type, '+
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
                            'AND `lan_ip` = ? '+
                            'AND `l7_proto` != \'-\''+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
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
                var dns = {
                    query: 'SELECT '+
                            '\'dns\' AS type,'+
                            '`time` AS raw_time,'+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                            '`ioc_count`,'+
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
                            'AND `lan_ip`= ?'+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
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
                            'AND `lan_ip`= ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
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
                            'AND `lan_ip`= ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "Server Name", select: "server_name"},
                        {title: "Version", select: "version"},
                        {title: "cipher", select: "cipher"},
                        {title: "Subject", select: "subject"},
                        {title: "Issuer Subject", select: "issuer_subject"},
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
                            'AND `lan_ip`= ? '+
                            'AND `mime` NOT REGEXP \'text\''+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
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
                            '\'endpoint\' AS type, '+
                            '`time` as raw_time, '+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                            '`src_ip`,'+
                            '`dst_ip`,'+
                            '`src_user`,'+
                            '`alert_source`,'+
                            '`program_source`,'+
                            '`alert_info` '+
                        'FROM '+
                            '`ossec` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `src_ip`= ? '+
                            'LIMIT 250',
                    insert: [start, end, req.query.lan_ip],
                    params: [
                        {title: "Time", select: "time"},
                        {title: "User", select: "src_user"},
                        {title: "Source IP", select: "src_ip"},
                        {title: "Destination IP", select: "dst_ip"},
                        {title: "Alert Source", select: "alert_source"},
                        {title: "Program Source", select: "program_source"},
                        {title: "Alert Info", select: "alert_info"},
                    ]
                }
                var stealth_conn = {
                    query: 'SELECT '+
                            '\'stealth\' AS type,'+
                            '`time` AS raw_time,'+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                            '`src_ip`,'+
                            '`dst_ip`,'+
                            '(`in_bytes` / 1048576) AS in_bytes,'+
                            '(`out_bytes` / 1048576) AS out_bytes,'+
                            '`in_packets`,'+
                            '`out_packets` '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `src_ip`= ? '+
                            'AND `in_bytes` > 0 '+
                            'AND `out_bytes` > 0 '+
                            'LIMIT 250',
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
                            '\'stealth_drop\' AS type, '+
                            '`time` AS raw_time,'+
                            'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                            'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                            '`src_ip`, '+
                            '`dst_ip`, '+
                            '(`in_bytes` / 1048576) AS in_bytes,'+
                            '(`out_bytes` / 1048576) AS out_bytes,'+
                            '`in_packets`, '+
                            '`out_packets` '+
                        'FROM '+
                            '`stealth_conn_meta` '+
                        'WHERE '+
                            'time BETWEEN ? AND ? '+
                            'AND `src_ip` = ? '+
                            'AND (`in_bytes` = 0 OR `out_bytes` = 0)'+
                            'LIMIT 250',
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
                    function(callback) { // conn
                        new lanegraph(conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
                    },
                    function(callback) { // application
                        new lanegraph(l7, {database: database, pool:pool, lanes: lanes}, function(err, data){
                            handleReturn(data, callback);
                        });
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
                    function(callback) { // stealth block
                        if (req.session.passport.user.level === 3) {
                            new lanegraph(stealth_drop, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
                        } else {
                            callback();
                        }
                    },
                ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw console.log(err);
                    res.json({
                        laneGraph: result
                    });
                });

                //break;
                //}
            } else {
                if (req.query.lan_ip && (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1)) {

                switch (req.query.type) {

                    case 'remote_ip_conn_meta':
                        new query({query: 'SELECT DISTINCT `remote_ip` FROM `conn_meta` WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data.length);
                            }
                        });
                        break;
                    case 'remote_country_conn_meta':
                        new query({query: 'SELECT DISTINCT `remote_country` FROM `conn_meta` WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") AND (`remote_country` <> "-" ) ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data.length);
                            }
                        });
                        break;
                    ///
                    case 'bandwidth_in':
                        new query({query: 'SELECT ROUND(sum(`in_bytes`)) AS `bandwidth` FROM `conn_local`  WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [end, start, start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });
                        break;
                    case 'bandwidth_out':
                        new query({query: 'SELECT ROUND(sum(`out_bytes`)) AS `bandwidth` FROM `conn_local`  WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [end, start, start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });
                        break;
                    case 'new_ip':
                        new query({query: 'SELECT DISTINCT `remote_ip` FROM `conn_uniq_remote_ip`  WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data.length);
                            }
                        });
                        break;
                    case 'new_dns':
                        new query({query: 'SELECT `query` FROM `dns_uniq_query`  WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data);
                            }
                        });
                        break;
                    case 'new_http':
                        new query({query: 'SELECT DISTINCT `host` FROM `http_uniq_host`  WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data.length);
                            }
                        });
                        break;
                    case 'new_ssl':
                        new query({query: 'SELECT `remote_ip` FROM `ssl_uniq_remote_ip` WHERE ( `time` BETWEEN ? AND ? ) AND ( `lan_ip` = ? ) AND ( `lan_zone` = "Stealth") ', insert: [start, end, req.query.lan_ip]}, {database: database, pool: pool}, function(err,data){
                            if (data) {
                                res.json(data.length);
                            }
                        });
                        break;
                    default:


                    var info = [];
                    // SWIMLANE QUERIES
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
                                'AND `lan_ip` = ? '+
                            'LIMIT 250',
                        insert: [start, end, req.query.lan_ip],
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
                    var l7 = {
                        query: 'SELECT '+
                                '\'applications\' AS type, '+
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
                                'AND `lan_ip` = ? '+
                                'AND `l7_proto` != \'-\''+
                            'LIMIT 250',
                        insert: [start, end, req.query.lan_ip],
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
                    var dns = {
                        query: 'SELECT '+
                                '\'dns\' AS type,'+
                                '`time` AS raw_time,'+
                                'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                                '`ioc_count`,'+
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
                                'AND `lan_ip`= ? ',
                        insert: [start, end, req.query.lan_ip],
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
                                'AND `lan_ip`= ? ',
                        insert: [start, end, req.query.lan_ip],
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
                                'AND `lan_ip`= ? ',
                        insert: [start, end, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "Server Name", select: "server_name"},
                            {title: "Version", select: "version"},
                            {title: "cipher", select: "cipher"},
                            {title: "Subject", select: "subject"},
                            {title: "Issuer Subject", select: "issuer_subject"},
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
                                'AND `lan_ip`= ? '+
                                'AND `mime` NOT REGEXP \'text\'',
                        insert: [start, end, req.query.lan_ip],
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
                                '\'endpoint\' AS type, '+
                                '`time` as raw_time, '+
                                'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+
                                '`src_ip`,'+
                                '`dst_ip`,'+
                                '`src_user`,'+
                                '`alert_source`,'+
                                '`program_source`,'+
                                '`alert_info` '+
                            'FROM '+
                                '`ossec` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `src_ip`= ? ',
                        insert: [start, end, req.query.lan_ip],
                        params: [
                            {title: "Time", select: "time"},
                            {title: "User", select: "src_user"},
                            {title: "Source IP", select: "src_ip"},
                            {title: "Destination IP", select: "dst_ip"},
                            {title: "Alert Source", select: "alert_source"},
                            {title: "Program Source", select: "program_source"},
                            {title: "Alert Info", select: "alert_info"},
                        ]
                    }
                    var stealth_drop = {
                        query: 'SELECT '+
                                '\'stealth_drop\' AS type, '+
                                '`time` AS raw_time,'+
                                'date_format(from_unixtime(time), "%m-%d %H:%i:%s") as time_info, '+
                                'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") AS time,'+
                                '`src_ip`, '+
                                '`dst_ip`, '+
                                '(`in_bytes` / 1048576) AS in_bytes,'+
                                '(`out_bytes` / 1048576) AS out_bytes,'+
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
                    // USER TREE
                    var tree_conn = {
                        query: 'SELECT '+
                                   'count(*) AS `count`,'+
                                    '\'Connections\' AS type,'+
                                    '`remote_ip` '+
                                'FROM '+
                                    '`conn_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+
                                'GROUP BY '+
                                    '`remote_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_dns = {
                       query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'DNS\' AS type,' +
                                    '`remote_ip` '+
                                'FROM '+
                                    '`dns_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+
                                'GROUP BY '+
                                    '`remote_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_http = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'HTTP\' AS type,' +
                                    '`host` '+
                                'FROM '+
                                    '`http_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+   
                                'GROUP BY '+
                                    '`host` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_ssl = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'SSL\' AS type,' +
                                    '`server_name` '+
                                'FROM '+
                                    '`ssl_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+
                                'GROUP BY '+
                                    '`server_name` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_ssh = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'SSH\' AS type,' +
                                    '`remote_ip` '+
                                'FROM '+
                                    '`ssh` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+    
                                'GROUP BY '+
                                    '`remote_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_ftp = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'FTP\' AS type,' +
                                    '`remote_ip` '+
                                'FROM '+
                                    '`ftp` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+    
                                'GROUP BY '+
                                    '`lan_ip`,'+
                                    '`remote_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_irc = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'IRC\' AS type,' +
                                    '`remote_ip` '+
                                'FROM '+
                                    '`irc` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+   
                                'GROUP BY '+
                                    '`remote_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_files = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'Files\' AS type,' +
                                    '`mime` '+
                                'FROM '+
                                    '`file_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `lan_ip` = ? '+    
                                'GROUP BY '+
                                    '`mime` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_conn_drop = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'Connections Dropped\' AS type, '+
                                    '`remote_ip` '+
                                'FROM '+
                                    '`conn` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `out_bytes` = 0 '+
                                    'AND `lan_ip` = ? '+
                                    'AND `proto` = \'tcp\' '+
                                'GROUP BY '+
                                    '`remote_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip]
                    }
                    var tree_stealth_conn = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'Stealth\' AS type, '+
                                    '`dst_ip` AS `remote_ip` '+
                                'FROM '+
                                    '`stealth_conn_meta` '+
                                'WHERE '+
                                    '`time` BETWEEN ? AND ? '+
                                    'AND `src_ip`= ? '+
                                    'AND `in_bytes` > 0 '+
                                    'AND `out_bytes` > 0 '+
                                'GROUP BY '+
                                    '`dst_ip` '+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20',
                        insert: [start, end, req.query.lan_ip],
                    }
                    var tree_stealth_drop = {
                        query: 'SELECT '+
                                    'count(*) AS `count`, '+
                                    '\'Stealth Dropped\' AS type, '+
                                    '`dst_ip` AS `remote_ip` '+
                                'FROM '+
                                    '`stealth_conn_meta` '+
                                'WHERE '+
                                    'time BETWEEN ? AND ? '+
                                    'AND `src_ip` = ? '+
                                    'AND (`in_bytes` = 0 OR `out_bytes` = 0) '+
                                'GROUP BY '+
                                    '`dst_ip`'+
                                'ORDER BY '+
                                    '`count` DESC '+
                                'LIMIT 20'    ,
                        insert: [start, end, req.query.lan_ip],
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
                                '`lan_ip` = ? ' +
                            'LIMIT 1',
                        insert: [req.query.lan_ip]
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
                    var Info3SQL = {
                        query: 'SELECT '+
                            'max(date_format(from_unixtime(stealth_src.time), "%Y-%m-%d %H:%i:%s")) as time, '+ // Last Seen
                            '`src_ip` AS lan_ip, '+
                            '`user` AS lan_user, '+
                            'sum(`in_packets`) AS `in_packets`, '+
                            'sum(`out_packets`) AS `out_packets`, '+
                            '(sum(`in_bytes`) / 1048576) AS `in_bytes`, '+
                            '(sum(`out_bytes`) / 1048576) AS `out_bytes` '+
                        'FROM '+
                            '`stealth_src` '+
                        'JOIN '+
                            '`endpoint_tracking` ON `src_ip` = `lan_ip` '+
                        'WHERE '+
                            'stealth_src.time BETWEEN ? AND ? '+
                            'AND lan_ip = ? ',
                        insert: [start, end,req.query.lan_ip]
                    }

                    var treeArray = [], network = null;
                    async.parallel([
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
                        function(callback) { // InfoSQL
                            new query(Info3SQL, {database: database, pool: pool}, function(err,data){
                                info.main2 = data;
                                callback();
                            });
                        },
                        // SWIMLANE 
                        function(callback) { // conn
                            new lanegraph(conn, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                handleReturn(data, callback);
                            });
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
                                new lanegraph(stealth_drop, {database: database, pool:pool, lanes: lanes}, function(err, data){
                                    handleReturn(data, callback);
                                });
                            } else {
                                callback();
                            }
                        },
                        function(callback) { // TREE CHART
                            async.parallel([
                                function(callback) { // conn
                                    new query(tree_conn, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // dns
                                    new query(tree_dns, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // http
                                    new query(tree_http, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // ssl
                                    new query(tree_ssl, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // ssh
                                    new query(tree_ssh, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // ftp
                                    new query(tree_ftp, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // irc
                                    new query(tree_irc, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // files
                                    new query(tree_files, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // conn drop
                                    new query(tree_conn_drop, {database: database, pool: pool}, function(err,data){
                                        for(var i in data){
                                            treeArray.push(data[i]); 
                                        }
                                        callback();
                                    });
                                },
                                function(callback) { // stealth conn
                                    if (req.session.passport.user.level === 3) {
                                        new query(tree_stealth_conn, {database: database, pool: pool}, function(err,data){
                                            for(var i in data){
                                                treeArray.push(data[i]); 
                                            }
                                            callback();
                                        });
                                    } else {
                                        callback();
                                    }
                                },
                                function(callback) { // stealth drop
                                    if (req.session.passport.user.level === 3) {
                                        new query(tree_stealth_drop, {database: database, pool: pool}, function(err,data){
                                            for(var i in data){
                                                treeArray.push(data[i]); 
                                            }
                                            callback();
                                        });
                                    } else {
                                        callback();
                                    }
                                },
                            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                                if (err) throw console.log(err);
                                new networktree(treeArray, {database: database, pool: pool, type: 'users'}, function(err,data){
                                    network = data;
                                    callback();
                                });
                            });
                        }
                    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                        if (err) throw console.log(err)
                        res.json({
                            network: network,
                            laneGraph: result,
                            start: start,
                            info: info,
                            end: end
                        });
                    })
                break;
                }

                } else {
                    res.redirect('/');
                }
            }
        }
    }
};