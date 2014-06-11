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
			'`remote_ip`, ' +
			'`remote_port`, '  +
			'`remote_cc`, ' +
			'`remote_country`, ' +
			'`remote_asn_name` ' +
		'FROM '+
			'`irc` '+
		'WHERE '+
			'time BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
			'`remote_ip`';
	var table1Params = [
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
	];
	var table1Settings = {
		sort: [[1, 'desc']],
		div: 'table',
		title: 'Remote IRC'
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