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
						'`dns_uniq_query` '+
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
						'dns_uniq_query.time AS `time`,'+
						'`lan_zone`,'+
						'`lan_machine`,'+
						'dns_uniq_query.lan_ip,'+
						'`remote_ip`,'+
						'`remote_port`,'+
						'`remote_asn_name`,'+
						'`remote_country`,'+
						'`remote_cc`,'+
						'`proto`,'+
						'`qtype_name` AS qtype,'+
						'`qclass_name` AS qclass,'+
						'`rcode_name` AS rcode,'+
						'`query` '+
					'FROM '+
						'`dns_uniq_query` '+
					'WHERE '+
						'dns_uniq_query.time BETWEEN ? AND ?',
                insert: [req.query.start, req.query.end],
                params: [
					{ title: 'First Seen', select: 'time' },
					{ title: 'Query Type', select: 'qtype' },
					{ title: 'Query Class', select: 'qclass', dView: false },
					{ title: 'Response Code', select: 'rcode', dView: false },
					{ title: 'DNS Query', select: 'query' },
					{ title: 'Protocol', select: 'proto' },
					{ title: 'DNS Server', select: 'remote_ip' },
					{ title: 'Remote Port', select: 'remote_port' },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Flag', select: 'remote_cc', },
					{ title: 'Remote ASN', select: 'remote_asn_name' },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Machine Name', select: 'lan_machine' },
					{ title: 'Local IP', select: 'lan_ip' },
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