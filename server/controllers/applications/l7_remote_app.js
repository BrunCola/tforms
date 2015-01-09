'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
	return {
		crossfilter: function(req, res) {
            var get = {
					query: 'SELECT '+
							'time, '+ // Last Seen
							'(sum(in_bytes + out_bytes) / 1048576) AS count, '+
							'(sum(`in_bytes`) / 1048576) AS in_bytes, '+
							'(sum(`out_bytes`) / 1048576) AS out_bytes '+
						'FROM `conn_l7_meta` '+
						'WHERE '+
							'`time` BETWEEN ? AND ? '+
							'AND `remote_ip` = ? '+
						'GROUP BY '+
							'month(from_unixtime(time)),'+
							'day(from_unixtime(time)),'+
							'hour(from_unixtime(time))',
					insert: [req.query.start, req.query.end, req.query.remote_ip]
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
						'sum(`count`) AS `count`,'+
						'max(`time`) AS `time`,'+
						'`l7_proto`,'+
						'`remote_ip`,'+
						'`remote_country`,'+
						'`remote_cc`,'+
						'`remote_asn_name`,'+
						'sum(`in_packets`) AS in_packets,'+
						'sum(`out_packets`) AS out_packets,'+
						'(sum(`in_bytes`) / 1048576) AS in_bytes,'+
						'(sum(`out_bytes`) / 1048576) AS out_bytes,'+
						'sum(`dns`) AS `dns`,'+
						'sum(`http`) AS `http`,'+
						'sum(`ssl`) AS `ssl`,'+
						'sum(`ftp`) AS `ftp`,'+
						'sum(`irc`) AS `irc`,'+
						'sum(`smtp`) AS `smtp`,'+
						'sum(`file`) AS `file`,'+
						'sum(`ioc_count`) AS `ioc_count` '+
					'FROM `conn_l7_meta` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
						'AND `remote_ip` = ? '+
					'GROUP '+
						'BY `l7_proto`',
				insert: [req.query.start, req.query.end, req.query.remote_ip],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						dView: true,
						link: {
							type: 'l7_remote_drill',
							// val: the pre-evaluated values from the query above
							val: ['remote_ip','l7_proto'],
							crumb: false
						},
					},
					{ title: 'Applications', select: 'l7_proto' },
					{ title: 'Remote IP', select: 'remote_ip', dView:false },
					{ title: 'Remote Country', select: 'remote_country', dView:false },
					{ title: 'Flag', select: 'remote_cc', dView:false },
					{ title: 'Remote ASN', select: 'remote_asn_name', dView:false },
					{ title: 'MB to Remote', select: 'in_bytes' },
					{ title: 'MB from Remote', select: 'out_bytes'},
					{ title: 'Packets to Remote', select: 'in_packets', dView:false },
					{ title: 'Packets from Remote', select: 'out_packets', dView:false },
					{ title: 'IOC Count', select: 'ioc_count' },
					{ title: 'Connections', select: 'count' },
					{ title: 'DNS', select: 'dns' },
					{ title: 'HTTP', select: 'http' },
					{ title: 'SSL', select: 'ssl' },
					{ title: 'FTP', select: 'ftp' },
					{ title: 'IRC', select: 'irc' },
					{ title: 'SMTP', select: 'smtp' },
					{ title: 'File', select: 'file' },
				],
				settings: {
					sort: [[3, 'desc']],
					div: 'table',
					title: 'Remote IP Bandwidth Usage'
				}
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
	}
};