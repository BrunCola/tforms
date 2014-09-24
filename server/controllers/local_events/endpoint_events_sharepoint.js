'use strict';

var dataTable = require('../constructors/datatable'),
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
            var info = [];
            var table1 = {
                query: 'SELECT '+
                        'count(*) AS count,'+
                        'max(`timestamp`) as time,'+
                        '`sharepoint_user`,'+
                        '`lan_ip`,'+
                        '`machine`, ' +
                        '`lan_zone`, ' +
                        '`remote_ip`, ' +
                        '`remote_port`, '  +
                        '`remote_cc`, ' +
                        '`remote_country`, ' +
                        '`remote_asn_name`, ' +
                        '`location`,'+
                        '`event`,'+
                        '`event_id`,'+
                        '`event_location` '+
                    'FROM '+
                        '`sharepoint` '+
                    'WHERE '+
                        '`timestamp` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        '`event`, '+
                        '`lan_ip`, '+
                        '`lan_zone`', 
                insert: [start, end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        // link: {
                        //     type: 'endpoint_events_sharepoint_drill',
                        //     // val: the pre-evaluated values from the query above
                        //     val: ['event_id', 'lan_ip'],
                        //     crumb: false
                        // },
                    },
                    { title: 'Events', select: 'count' },
                    // { title: 'Machine', select: 'machine' },
                    // { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Sharepoint User', select: 'sharepoint_user'},
                    { title: 'Location', select: 'location' },
                    { title: 'Event', select: 'event' },
                    { title: 'Event ID', select: 'event_id'},
                    { title: 'Event Location', select: 'event_location' },
                    // { title: 'Remote IP', select: 'remote_ip'},
                    // { title: 'Remote port', select: 'remote_port' },
                    // { title: 'Flag', select: 'remote_cc' },
                    // { title: 'Remote Country', select: 'remote_country' },
                    // { title: 'Remote ASN Name', select: 'remote_asn_name' }
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Sharepoint Events by IP'
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
                if (err) throw console.log(err);
                var results = {
                    info: info,
                    tables: tables
                };
                //console.log(results);
                res.json(results);
            });
        }
    }
};