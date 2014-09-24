'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			// var database = null;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			//var results = [];
			var tables = [];
			var info = [];
			var table1 = {
				query: 'SELECT '+
						'count(*) AS count, ' +
                        'max(`time`) AS `time`,'+ // Last Seen
						'`remote_ip`, ' +
						'`remote_port`, '  +
						'`remote_cc`, ' +
						'`remote_country`, ' +
						'`remote_asn_name` ' +
					'FROM '+
						'`irc` '+
					'WHERE '+
						'time BETWEEN ? AND ? '+
					'GROUP BY '+
						'`remote_ip`',
				insert: [start, end],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						 link: {
							type: 'irc_remote2local', 
							// val: the pre-evaluated values from the query above
							val: ['remote_ip'],
							crumb: false
						},
					},
					{ title: 'Connections', select: 'count' },
					{ title: 'Remote IP', select: 'remote_ip'},
					{ title: 'Remote port', select: 'remote_port' },
					{ title: 'Flag', select: 'remote_cc' },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Remote ASN Name', select: 'remote_asn_name' }
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'Remote IRC'
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