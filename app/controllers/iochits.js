'use strict';

var dataTable = require('./constructors/datatable'),
    query = require('./constructors/query'),
    async = require('async');

exports.render = function(req, res) {
    // if (req.user) {
    //var results = [];
    var tables = [];
    var crossfilter = [];
    var info = [];
    var table1SQL = 'SELECT '+
        // SELECTS
        'max(from_unixtime(time)) as time, '+ // Last Seen
        '`ioc_severity`, '+
        'count(*) as count, '+
        '`ioc`, '+
        '`ioc_type`, '+
        '`lan_zone`, '+
        '`lan_ip`, '+
        '`machine`, '+
        '`wan_ip`, '+
        '`remote_ip`, '+
        '`remote_asn`, '+
        '`remote_asn_name`, '+
        '`remote_country`, '+
        '`remote_cc`, '+
        'sum(in_packets) as in_packets, '+
        'sum(out_packets) as out_packets, '+
        'sum(`in_bytes`) as in_bytes, '+
        'sum(`out_bytes`) as out_bytes '+
        // !SELECTS
        'FROM conn_ioc '+
        'WHERE time BETWEEN 1388552400 AND 1391230740 '+
        'AND `ioc_count` > 0 AND `trash` IS NULL '+
        'GROUP BY `lan_ip`,`wan_ip`,`remote_ip`,`ioc`';

    var table1Params = [
        {
            title: 'Last Seen',
            select: 'time',
            dView: true,
            link: {
                type: 'ioc_drill',
                // val: the pre-evaluated values from the query above
                val: ['lan_ip','wan_ip','remote_ip','ioc'],
                crumb: false
            },
        },
        { title: 'Severity', select: 'ioc_severity' },
        { title: 'IOC Hits', select: 'count' },
        { title: 'IOC', select: 'ioc' },
        { title: 'IOC Type', select: 'ioc_type' },
        { title: 'LAN Zone', select: 'lan_zone' },
        { title: 'LAN IP', select: 'lan_ip' },
        { title: 'Machine Name', select: 'machine' },
        { title: 'WAN IP', select: 'wan_ip', dView: false },
        { title: 'Remote IP', select: 'remote_ip' },
        { title: 'Remote ASN', select: 'remote_asn' },
        { title: 'Remote ASN Name', select: 'remote_asn_name' },
        { title: 'null', select: 'remote_cc' },
        { title: 'Packets to Remote', select: 'in_packets' },
        { title: 'Packets from Remote', select: 'out_packets' },
        { title: 'Bytes to Remote', select: 'in_bytes', dView: false },
        { title: 'Bytes from Remote', select: 'out_bytes', dView: false }
    ];

    var crossfilterSQL = 'SELECT '+
        // SELECTS
        'from_unixtime(time) as time, '+ // Last Seen
        '`remote_country`, '+
        'ioc_severity, '+
        'count(*) as count, '+
        '`ioc` '+
        // !SELECTS
        'FROM conn_ioc '+
        'WHERE time BETWEEN 1388552400 AND 1391230740 '+
        'AND `ioc_count` > 0 AND `trash` IS NULL '+
        'GROUP BY month(from_unixtime(`time`)), day(from_unixtime(`time`)), hour(from_unixtime(`time`)), `remote_country`, `ioc_severity`';


    async.parallel([
        // Table function(s)
        function(callback) {
            new dataTable(table1SQL, table1Params, function(err,data){
                tables.push(data);
                callback();
            });
        },
        // Crossfilter function
        function(callback) {
            new query(crossfilterSQL, function(err,data){
                crossfilter = data;
                callback();
            });
        },
        // Info function(s)
        function(callback) {
            new query('SELECT count(*) as count FROM conn_ioc WHERE (time between 1388552400 AND 1391230740) AND ioc_count > 0 AND trash IS NULL', function(err,data){
                info.push({
                    ioc_notifications: data
                });
                callback();
            });
        },
        function(callback) {
            new query('SELECT SQL_CALC_FOUND_ROWS ioc FROM conn_ioc WHERE (time between 1388552400 AND 1391230740) AND ioc_count > 0 AND trash IS NULL GROUP BY ioc', function(err,data){
                info.push({
                    ioc_groups: data.length
                });
                callback();
            });
        },
        function(callback) {
            new query('SELECT SQL_CALC_FOUND_ROWS lan_ip,wan_ip FROM conn_ioc WHERE (time between 1388552400 AND 1391230740) AND ioc_count > 0 AND trash IS NULL GROUP BY lan_ip,wan_ip', function(err,data){
                info.push({
                    local_ips: data.length
                });
                callback();
            });
        },
        function(callback) {
            new query('SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_ioc WHERE (time between 1388552400 AND 1391230740) AND ioc_count > 0 AND trash IS NULL GROUP BY remote_ip', function(err,data){
                info.push({
                    remote_ip: data.length
                });
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
        //console.log(results);
        res.json(results);
    });

    // } else {
    //     res.redirect('/signin');
    // }

};
