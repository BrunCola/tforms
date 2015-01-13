'use strict';

var dataTable = require('./constructors/datatable'),
query = require('./constructors/query');

module.exports = function(pool) {
	return {
		crossfilter: function(req, res) {
            var get = {
				query: 'SELECT '+
					// SELECTS
					'time, '+ // Last Seen
					'`remote_country`, '+
					'ioc_severity, '+
					'count(*) as count, '+
					'`ioc` '+
					// !SELECTS
					'FROM conn_ioc '+
					'WHERE time BETWEEN ? AND ? '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NOT NULL '+
					'GROUP BY month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity, ioc',
                insert: [req.query.start, req.query.end]
            }
            new query(get, {database: req.user.database, pool: pool}, function(err,data){
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
					// SELECTS
					'max(`time`) AS `time`,'+ // Last Seen
					'`ioc_severity`, '+
					'count(*) AS count, '+
					'`ioc`, '+
					'`ioc_typeIndicator`, '+
					'`ioc_typeInfection`, '+
					'`ioc_rule`, '+
					'`lan_zone`, '+
					'`lan_ip`, '+
					'`lan_machine`, '+
					'`remote_ip`, '+
					'`remote_asn`, '+
					'`remote_asn_name`, '+
					'`remote_country`, '+
					'`remote_cc`, '+
					'sum(in_packets) AS in_packets, '+
					'sum(out_packets) AS out_packets, '+
					'sum(`in_bytes`) AS in_bytes, '+
					'sum(`out_bytes`) AS out_bytes '+
					// !SELECTS
					'FROM conn_ioc '+
					'WHERE time BETWEEN ? AND ? '+
					'AND `ioc_count` > 0 '+
					'AND `trash` IS NOT NULL '+
					'GROUP BY `lan_ip`,`remote_ip`,`ioc`',
				insert: [req.query.start, req.query.end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						dView: true,
						link: {
							type: 'ioc_drill',
							// val: the pre-evaluated values from the query above
							val: ['lan_ip','remote_ip','ioc'],
							crumb: false
						},
					},
					{ title: 'Severity', select: 'ioc_severity' },
					{ title: 'IOC Hits', select: 'count' },
					{ title: 'IOC', select: 'ioc' },
					{ title: 'IOC Type', select: 'ioc_typeIndicator' },
					{ title: 'IOC Stage', select: 'ioc_typeInfection' },
					{ title: 'IOC Rule', select: 'ioc_rule' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Machine Name', select: 'lan_machine' },
					{ title: 'Remote IP', select: 'remote_ip' },
					{ title: 'Remote ASN', select: 'remote_asn' },
					{ title: 'Remote ASN Name', select: 'remote_asn_name' },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Flag', select: 'remote_cc', },
					{ title: 'Packets to Remote', select: 'in_packets' },
					{ title: 'Packets from Remote', select: 'out_packets' },
					{ title: 'Bytes to Remote', select: 'in_bytes', dView: false },
					{ title: 'Bytes from Remote', select: 'out_bytes', dView: false },
					{
						title: '',
						select: null,
						dView: true,
						link: {
							type: 'Restore',
						},
					}
				],
				settings: {
					sort: [[0, 'desc']],
					div: 'table',
					title: 'Archived Indicators of Compromise (IOC) Notifications'
				}
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
	}
};