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
						'count(*) AS count,'+
						'time,'+
						'`remote_country` '+
					'FROM '+
						'`ssh_uniq_remote_ip` '+
					'WHERE '+
						'`time` BETWEEN ? AND ? '+
					'GROUP BY '+
						'month(from_unixtime(`time`)),'+
						'day(from_unixtime(`time`)),'+
						'hour(from_unixtime(`time`)),'+
						'`remote_country`',
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
						'ssh_uniq_remote_ip.time AS `time`,'+
						'`lan_zone`,'+
						'`lan_machine`,'+
						'ssh_uniq_remote_ip.lan_ip,'+
						'`remote_ip`,'+
						'`remote_country`,'+
						'`remote_cc`,'+
						'`remote_asn`,'+
						'`remote_asn_name`,'+
						'`lan_client`,'+
						'`remote_server` '+
					'FROM '+
						'`ssh_uniq_remote_ip` '+
					'WHERE '+
						'ssh_uniq_remote_ip.time BETWEEN ? AND ?',
                insert: [req.query.start, req.query.end],
                params: [
					{ title: 'Last Seen', select: 'time' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Machine Name', select: 'lan_machine' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Local Client', select: 'lan_client' },
					{ title: 'Remote IP', select: 'remote_ip' },
					{ title: 'Remote Server', select: 'remote_server', },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Flag', select: 'remote_cc', },
					{ title: 'Remote ASN', select: 'remote_asn_name' },
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'New Remote IP Addresses Detected'
				}
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
	}
};