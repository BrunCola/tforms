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
					'count(*) AS count,'+
					'max(`time`) AS `time`,'+
					'`lan_user`,'+
					'`lan_ip`,'+
					'`lan_machine`, ' +
					'`lan_zone`, ' +
					'`event_id`, ' +
					'`event_src`, '  +
					'`event_type`, ' +
					'`event_detail`, ' +
					'`event_full`, ' +
					'`event_level` ' +
				'FROM '+
					'`sharepoint_events` '+
				'WHERE '+
					'`time` BETWEEN ? AND ? '+
					'AND `event_type` = ? '+
				'GROUP BY '+
					'`lan_user`, '+
					'`lan_ip`, '+
					'`lan_zone`',
				insert: [req.query.start, req.query.end, req.query.event_type],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						link: {
							type: 'endpoint_events_sharepoint_full',
							val: ['event_type','lan_zone','lan_user', 'lan_ip'], // pre-evaluated values from the query above
							crumb: false
						}
					},
					{ title: 'Events', select: 'count'},
					{ title: 'Zone', select: 'lan_zone'},
					{ title: 'Local Machine', select: 'lan_machine'},
					{ title: 'Local User', select: 'lan_user'},
					{ title: 'Local IP', select: 'lan_ip'},
					{ title: 'Event Type', select: 'event_type' },
					{ title: 'Event Details', select: 'event_detail'},
					{ title: 'Event Source', select: 'event_src'},
					{ title: 'Event ID', select: 'event_id'},
				],
				settings: {
					sort: [[0, 'desc']],
					div: 'table',
					title: 'Full Endpoint Event Logs',
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