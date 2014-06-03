'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	var tables = [];
	var info = [];
	var table1SQL = 'SELECT '+
			'count(*) AS count,'+
			'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") AS time, '+
			'`machine`,'+
			'`lan_zone`,'+
			'`lan_ip`,'+
			'sum(`ioc_count`) AS ioc_count '+
		'FROM '+
			'`ssh` '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'`lan_zone`,'+
			'`lan_ip`';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			link: {
			 	type: 'ssh_remote', 
			 	val: ['lan_zone','lan_ip'],
			 	crumb: false
			},
		},
		{ title: 'Connections', select: 'count' },
		{ title: 'Zone', select: 'lan_zone' },
		{ title: 'Machine Name', select: 'machine' },
		{ title: 'LAN IP', select: 'lan_ip' },
		{ title: 'IOC Count', select: 'ioc_count' }
	];
	var table1Settings = {
		sort: [[1, 'desc']],
		div: 'table',
		title: 'SSH'
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
		res.json(results);
	});
};