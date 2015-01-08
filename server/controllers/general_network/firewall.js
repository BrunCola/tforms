'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
    return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                 query: 'SELECT '+
                            '`time`,'+
                            '`email`,'+
                            '`type`,'+
                            '`rule` '+
                        'FROM '+
                            '`firewall` ',
                insert: [req.query.start, req.query.end],
                params: [
                    { title: 'Time', select: 'time' },
                    { title: 'Email', select: 'email' },
                    { title: 'Type', select: 'type' },
                    { title: 'Rule', select: 'rule' },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Firewall Rules'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};