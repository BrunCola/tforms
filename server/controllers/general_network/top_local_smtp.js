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
		'count(*) AS count,' +
		'time, ' +
		//'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
		'`machine`, ' +
		'`lan_zone`, ' +
		'`lan_ip`, ' +
		'`lan_port`, ' +
		'`remote_ip`, ' +
		'`remote_port`, '  +
		'`remote_cc`, ' +
		'`remote_country`, ' +
		'`remote_asn`, ' +
		'`remote_asn_name`, ' +
		'`trans_depth`, ' +
		'`helo`, ' +
		'`mailfrom`, ' +
		'`receiptto`, ' +
		'`date`, ' +
		'`from`, ' +
		'`to`, ' +
		//'`relpy_to`, ' +
		'`msg_id`, ' +
		'`in_reply_to`, ' +
		'`subject`, ' +
		'`orig_ip`, ' +
		'`first_rcvd`, ' +
		'`second_rcvd`, ' +
		'`last_reply`, ' +
		'`path`, ' +
		'`user_agent`, ' +
		'`fuids`, ' +
		'`is_webmail`, ' +
		'`ioc`, ' +
		'`ioc_severity`, ' +
		'`ioc_typeInfection`, ' +
		'`ioc_typeIndicator`, ' +
		'`ioc_count` ' +
		'FROM `smtp` '+
		'WHERE time BETWEEN '+start+' AND '+end+' '+
		'GROUP BY '+
		'`receiptto`, `mailfrom`';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'time',
			 link: {
			 	type: 'top_ssh_remote', 
			 	// val: the pre-evaluated values from the query above
			 	val: ['lan_ip'],
			 	crumb: false
			},
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
		{ title: 'Remote ASN', select: 'remote_asn' },
		{ title: 'Remote ASN Name', select: 'remote_asn_name' },
		{ title: 'Trans Depth', select: 'trans_depth' },
		{ title: 'HELO', select: 'helo' },
		{ title: 'Mail From', select: 'mailfrom' },
		{ title: 'Receipt To', select: 'receiptto' },
		{ title: 'Date', select: 'date' },
		{ title: 'From', select: 'from' },
		{ title: 'To', select: 'to' },
		//{ title: 'Reply To', select: 'relpy_to' },
		{ title: 'Message ID', select: 'msg_id' },
		{ title: 'In Reply To', select: 'in_reply_to' },
		{ title: 'Subject', select: 'subject' },
		{ title: 'Original IP', select: 'orig_ip' },
		{ title: 'First Received', select: 'first_rcvd' },
		{ title: 'Second Received', select: 'second_rcvd' },
		{ title: 'Last Reply', select: 'last_reply' },
		{ title: 'Path', select: 'path' },
		{ title: 'User Agent', select: 'user_agent' },
		{ title: 'FUIDS', select: 'fuids' },
		{ title: 'Is Webmail', select: 'is_webmail' },
		{ title: 'IOC', select: 'ioc' },
		{ title: 'IOC Severity', select: 'ioc_severity' },
		{ title: 'Infection Stage', select: 'ioc_typeInfection' },
		{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
		{ title: 'IOC Count', select: 'ioc_count' }
	];
	var table1Settings = {
		sort: [[1, 'desc']],
		div: 'table',
		title: 'Local SMTP'
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