'use strict';

var dataTable = require('../constructors/datatable'),
    query = require('../constructors/query');

module.exports = function(pool) {
    return {        
        crossfilter: function(req, res) {
            var get = {
                query: 'SELECT '+
                        'count(*) AS count,'+
                        'time '+
                    'FROM '+
                        '`endpoint_events` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                    'GROUP BY '+
                        'month(from_unixtime(`time`)),'+
                        'day(from_unixtime(`time`)),'+
                        'hour(from_unixtime(`time`))',
                insert: [req.query.start, req.query.end]
            }
            new query(get, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        crossfilterpie: function(req, res) {
            var piechart = {
                query: 'SELECT '+
                        'time,'+
                        '`lan_zone`,'+
                        '`lan_user`, '+
                        '`lan_ip`, '+
                        'count(*) AS `count` '+
                    'FROM '+
                        '`endpoint_events` '+
                    'WHERE '+
                        '`time` BETWEEN ? AND ? '+
                        'AND `lan_user` !=\'-\' '+
                        'AND `lan_ip` !=\'-\' '+
                    'GROUP BY '+
                        '`lan_zone`,'+
                        '`lan_user`, '+
                        '`lan_ip` ',
                insert: [req.query.start, req.query.end]
            }
            new query(piechart, {database: req.user.database, pool: pool}, function(err,data){
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
                            'count(*) AS `count`,'+
                            'max(`time`) AS `time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`, '+
                            '`lan_user`, '+
                            '`lan_ip` '+
                        'FROM '+
                            '`endpoint_events` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                        'GROUP BY '+
                            '`lan_zone`,'+
                            '`lan_user`,'+
                            '`lan_ip`',
                insert: [req.query.start, req.query.end],
                params: [
                    {
                        title: 'Last Seen',
                        select: 'time',
                        link: {
                            type: 'endpoint_by_user_and_type',
                            val: ['lan_zone','lan_user'], // the pre-evaluated values from the query above
                            crumb: false
                        },
                    },
                    { title: 'Events', select: 'count' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine'},
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    {
                        title: '',
                        select: '',
                        dView: true,
                        link: {
                            type: 'Upload Image',
                        },
                    },
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Local Endpoint Events',
                    hide_stealth: req.user.hide_stealth
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};