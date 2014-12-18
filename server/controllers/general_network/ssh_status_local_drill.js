'use strict';

var dataTable = require('../constructors/datatable'),
    config = require('../../config/config'),
    async = require('async'),
    query = require('../constructors/query');

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
            if (req.query.lan_zone && req.query.lan_ip && req.query.status_code) {
                var tables = [];
                var info = [];
                var table1 = {
                    query: 'SELECT '+
                                '`time`,'+
                                '`lan_stealth`,'+
                                '`lan_zone`,'+
                                '`lan_machine`,'+
                                '`lan_user`,'+
                                '`lan_ip`,'+
                                '`lan_port`,'+
                                '`remote_ip`,'+
                                '`remote_port`,'+
                                '`remote_cc`,'+
                                '`remote_country`,'+
                                '`remote_asn`,'+
                                '`remote_asn_name`,'+
                                '`status_code`,'+
                                '`direction`,'+
                                '`lan_client`,'+
                                '`remote_server`,'+
                                '`ioc`,'+
                                '`ioc_severity`,'+
                                '`ioc_typeInfection`,'+
                                '`ioc_typeIndicator`,'+
                                '`ioc_rule`,'+
                                '`ioc_count` '+
                            'FROM '+
                                '`ssh` '+
                            'WHERE '+
                                '`time` BETWEEN ? AND ? '+
                                'AND `lan_zone` = ? '+
                                'AND `lan_ip` = ? '+
                                'AND `status_code` = ?',
                    insert: [start, end, req.query.lan_zone, req.query.lan_ip, req.query.status_code],
                    params: [
                        { title: 'Time', select: 'time' },
                        { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                        { title: 'Zone', select: 'lan_zone' },
                        { title: 'Local Machine', select: 'lan_machine' },
                        { title: 'Local User', select: 'lan_user' },
                        { title: 'Local IP', select: 'lan_ip' },
                        { title: 'Local Port', select: 'lan_port' },
                        { title: 'Local client', select: 'lan_client' },
                        { title: 'Remote IP', select: 'remote_ip'},
                        { title: 'Remote Port', select: 'remote_port' },
                        { title: 'Remote Server', select: 'remote_server' },
                        { title: 'Remote Country', select: 'remote_country' },
                        { title: 'Flag', select: 'remote_cc' },
                        { title: 'Remote ASN', select: 'remote_asn' },
                        { title: 'Remote ASN Name', select: 'remote_asn_name' },
                        { title: 'Status Code', select: 'status_code' },
                        { title: 'IOC', select: 'ioc' },
                        { title: 'Infection Stage', select: 'ioc_typeInfection' },
                        { title: 'Indicator Type', select: 'ioc_typeIndicator' },
                        { title: 'Severity', select: 'ioc_severity' },
                        { title: 'IOC Rule', select: 'ioc_rule' },
                        { title: 'IOC Count', select: 'ioc_count' }
                    ],
                    settings: {
                        sort: [[1, 'desc']],
                        div: 'table',
                        title: 'Local SSH Connections by Status',
                        hide_stealth: req.user.hide_stealth
                    }
                }
                var table2 = {
                    query: 'SELECT '+
                                'time, '+ 
                                '`stealth_COIs`, ' +
                                '`lan_stealth`, '+
                                '`lan_ip`, ' +
                                '`event`, ' +
                                '`user` ' +
                            'FROM ' + 
                                '`endpoint_tracking` '+
                            'WHERE ' + 
                                'stealth > 0 '+
                                'AND event = "Log On" ',
                    insert: [],
                    params: [
                        { title: 'Stealth', select: 'lan_stealth' },
                        { title: 'COI Groups', select: 'stealth_COIs' },
                        { title: 'User', select: 'user' }
                    ],
                    settings: {}
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