'use strict';

var dataTable = require('../constructors/datatable'),
	query = require('../constructors/query'),
	config = require('../../config/config'),
	async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	// var database = null;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	if (req.query.remote_ip) {
		//var results = [];
		var tables = [];
		var crossfilter = [];
		var info = [];

		var table1SQL = 'SELECT '+
				'sum(`count`) AS `count`, '+
				'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
				'`lan_zone`, ' +
				'`lan_ip`, ' +
				'`remote_ip`, ' +
				'`remote_port`, ' +
				'`remote_cc`, ' +
				'`remote_country`, ' +
				'`remote_asn_name`, ' +
				'sum(`ioc_count`) AS `ioc_count` ' +
			'FROM ' +
				'`http_meta` '+
			'WHERE ' +
				'time BETWEEN '+start+' AND '+end+' '+
				'AND `remote_ip` = \''+req.query.remote_ip+'\' '+
			'GROUP BY '+
				'`lan_zone`, ' +
				'`lan_ip`';

		var table1Params = [
			{
				title: 'Last Seen',
				select: 'time',
				link: {
					type: 'http_remote2local_drill',
					// val: the pre-evaluated values from the query above
					val: ['lan_ip','lan_zone','remote_ip'],
					crumb: false
				}
			},
			{ title: 'Count', select: 'count' },
			{ title: 'Zone', select: 'lan_zone' },
			{ title: 'LAN IP', select: 'lan_ip' },
			{ title: 'Remote IP', select: 'remote_ip'},
			{ title: 'Remote port', select: 'remote_port' },
			{ title: 'Flag', select: 'remote_cc' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Remote ASN Name', select: 'remote_asn_name' },
			{ title: 'IOC Count', select: 'ioc_count' }
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table',
			title: 'Local/Remote HTTP'
		}

		async.parallel([
			// Table function(s)
			function(callback) {
				new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
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
	} else {
		res.redirect('/');
	}

};