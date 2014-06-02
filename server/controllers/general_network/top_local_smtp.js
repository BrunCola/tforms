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
			'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") AS time,'+
			'`from`,'+
			'sum(`ioc_count`) AS `ioc_count` '+
		'FROM '+
			'`smtp` '+
		'WHERE '+
			'`time` BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'`from`';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			 link: {
			 	type: 'top_smtp_from_sender', 
			 	val: ['from'],
			 	crumb: false
			},
		},
		{ title: 'Count', select: 'count' },
		{ title: 'From', select: 'from' },
		{ title: 'IOC Count', select: 'ioc_count' }
	];
	var table1Settings = {
		sort: [[1, 'desc']],
		div: 'table',
		title: 'Top Email Senders'
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