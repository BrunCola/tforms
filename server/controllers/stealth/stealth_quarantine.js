'use strict';

var dataTable = require('../constructors/datatable');

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
                            '`lan_zone`,'+
                            '`lan_user` '+
                        'FROM '+
                            '`stealth_quarantine`',
                insert: [],
                params: [
                    { title: 'Time', select: 'time' },
                    { title: 'rapidPHIRE User Responsible', select: 'email' },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Quarantined User', select: 'lan_user' },
                ],
                settings: {
                    sort: [[0, 'desc']],
                    div: 'table',
                    title: 'Quarantined Endpoints'
                }
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
    }
};