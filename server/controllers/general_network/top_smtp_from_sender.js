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
	if (req.query.from) {
		var tables = [];
		var info = [];
		var table1SQL = 'SELECT '+
			'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'`machine`, ' +
			'`lan_port`, ' +
			'`remote_port`, '  +
			'`remote_cc`, ' +
			'`remote_country`, ' +
			'`remote_asn`, ' +
			'`remote_asn_name`, ' +
			'`from`, ' +
			'`to`, ' +
			'`reply_to`, ' +
			'`in_reply_to`, ' +
			'`subject`, ' +
			'`user_agent`, ' +
			'`fuids`, ' +
			'`ioc`, ' +
			'`ioc_severity`, ' +
			'`ioc_typeInfection`, ' +
			'`ioc_typeIndicator`, ' +
			'`ioc_count` ' +
			'FROM `smtp` '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `from` = \''+req.query.from+'\'';
		var table1Params = [
			{
				title: 'Time',
				select: 'time'
			},
			{ title: 'Machine', select: 'machine' },
			{ title: 'LAN port', select: 'lan_port' },
			{ title: 'Remote port', select: 'remote_port' },
			{ title: 'Flag', select: 'remote_cc' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Remote ASN', select: 'remote_asn' },
			{ title: 'Remote ASN Name', select: 'remote_asn_name' },
			{ title: 'From', select: 'from' },
			{ title: 'To', select: 'to' },
			{ title: 'Reply To', select: 'reply_to' },
			{ title: 'In Reply To', select: 'in_reply_to' },
			{ title: 'Subject', select: 'subject' },
			{ title: 'User Agent', select: 'user_agent' },
			{ title: 'FUIDS', select: 'fuids' },
			{ title: 'IOC', select: 'ioc' },
			{ title: 'IOC Severity', select: 'ioc_severity' },
			{ title: 'Infection Stage', select: 'ioc_typeInfection' },
			{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
			{ title: 'IOC Count', select: 'ioc_count' }
		];
		var table1Settings = {
			sort: [[1, 'desc']],
			div: 'table',
			title: 'Emails From Sender'
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