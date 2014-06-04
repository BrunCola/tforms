'use strict';

var dataTable = require('../constructors/datatable'),
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
	//var results = [];
	var tables = [];
	var info = [];
	var table1SQL = 'SELECT '+
			'count(*) AS count, ' +
			'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'`machine`, ' +
			'`lan_zone`, ' +
			'`lan_ip`, ' +
			'`lan_port` ' +
		'FROM '+
			'`irc` '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'`lan_zone`,`lan_ip`';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			link: {
			 	type: 'irc_local2remote', 
			 	// val: the pre-evaluated values from the query above
			 	val: ['lan_ip', 'lan_zone'],
			 	crumb: false
			},
		},
		{ title: 'Count', select: 'count' },
		{ title: 'Zone', select: 'lan_zone' },
		{ title: 'Machine', select: 'machine' },
		{ title: 'LAN IP', select: 'lan_ip' }
	];
	var table1Settings = {
		sort: [[1, 'desc']],
		div: 'table',
		title: 'Local IRC'
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

};