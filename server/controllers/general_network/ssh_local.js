'use strict';

var dataTable = require('../constructors/datatable'),
	config = require('../../config/config'),
	async = require('async'),
	query = require('../constructors/query');

module.exports = function(pool) {
	return {
		//////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
				query: 'SELECT '+
							'count(*) AS count,'+
							'max(ssh.time) AS `time`, '+
							'`lan_stealth`,'+
							'`lan_zone`,'+
							'`lan_machine`,'+
							'`lan_user`,'+
							'`lan_ip`,'+
							'sum(`ioc_count`) AS ioc_count '+
						'FROM '+
							'`ssh` '+
						'WHERE '+
							'ssh.time BETWEEN ? AND ? '+
						'GROUP BY '+
							'`lan_zone`,'+
							'ssh.lan_ip',
                insert: [req.query.start, req.query.end],
                params: [
					{
						title: 'Last Seen',
						select: 'time',
						link: {
							 type: 'ssh_local2remote', 
							 val: ['lan_zone','lan_ip'],
							 crumb: false
						},
					},
					{ title: 'Connections', select: 'count' },
					{ title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Local Machine', select: 'lan_machine' },
					{ title: 'Local User', select: 'lan_user' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'IOC Count', select: 'ioc_count' }
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'SSH',
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