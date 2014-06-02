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
			'count(*) AS count, ' +
			'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'`machine`, ' +
			'`lan_zone`, ' +
			'`lan_ip`, ' +
			'`lan_port`, ' +
			'`remote_ip`, ' +
			'`remote_port`, '  +
			'`remote_cc`, ' +
			'`remote_country`, ' +
			'`remote_asn_name`, ' +
			'`nick`, ' +
			'`user`, ' +
			'`command`, ' +
			'`value`, ' +
			'`addl`, ' +
			'`dcc_file_name`, ' +
			'`dcc_file_size`, ' +
			'`dcc_mime_type`, ' +
			'`fuid` ' +
			'FROM `irc` '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `remote_ip` = \''+req.query.remote_ip+'\' '+
			'GROUP BY '+
			'`lan_ip`';

		var table1Params = [
			{
				title: 'Last Seen',
				select: 'time',
				// link: {
				// 	type: 'top_ips_shared',
				// 	// val: the pre-evaluated values from the query above
				// 	val: ['lan_ip','lan_zone','remote_ip'],
				// 	crumb: false
				// }
			},
			{ title: 'Count', select: 'count' },
			{ title: 'Machine', select: 'machine' },
			{ title: 'LAN Zone', select: 'lan_zone' },
			{ title: 'LAN IP', select: 'lan_ip' },
			{ title: 'LAN port', select: 'lan_port' },
			{ title: 'Remote IP', select: 'remote_ip'},
			{ title: 'Remote port', select: 'remote_port' },
			{ title: 'Flag', select: 'remote_cc' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Remote ASN Name', select: 'remote_asn_name' },
			{ title: 'Nick', select: 'nick' },
			{ title: 'User', select: 'user' },
			{ title: 'Command', select: 'command' },
			{ title: 'Value', select: 'value'},
			{ title: 'Addl', select: 'addl' },
			{ title: 'DCC File Name', select: 'dcc_file_name' },
			{ title: 'DCC File Size', select: 'dcc_file_size' },
			{ title: 'DCC MIME Type', select: 'dcc_mime_type' },
			{ title: 'FUID', select: 'fuid' }
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table',
			title: 'Remote IRC/Local IRC Traffic'
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