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
	if (req.query.remote_ip && req.query.mime) {
		var tables = [];
		var table1SQL = 'SELECT '+
			// SELECTS
			'date_format(from_unixtime(time), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
			'`mime`, '+
			'`name`, '+
			'`machine`, '+
			'`lan_ip`, '+
			'`lan_port`, '+
			'`lan_zone`, '+
			'`remote_ip`, '+
			'`remote_port`, '+
			'`remote_asn`, '+
			'`remote_asn_name`, '+
			'`remote_country`, '+
			'`remote_cc`, '+
			'`proto`, '+
			'`md5`, '+
			'`http_host`, '+
			'`ioc`, '+
			'`ioc_typeIndicator`, '+
			'`ioc_typeInfection`, '+
			'size as size '+
			// !SELECTS
			'FROM `file` '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND mime = \''+req.query.mime+'\' AND remote_ip = \''+req.query.remote_ip+'\' ';

			var table1Params = [
				{ title: 'Last Seen', select: 'time' },
				{ title: 'MIME', select: 'mime' },
				{ title: 'Name', select: 'name', sClass:'file'},
				{ title: 'Size', select: 'size' },
				{ title: 'Zone', select: 'lan_zone' },
				{ title: 'Machine', select: 'machine' },
				{ title: 'LAN IP', select: 'lan_ip' },
				{ title: 'LAN Port', select: 'lan_port' },
				{ title: 'Remote IP', select: 'remote_ip' },
				{ title: 'Remote Port', select: 'remote_port' },
				{ title: 'ASN', select: 'remote_asn' },
				{ title: 'ASN Name', select: 'remote_asn_name' },
				{ title: 'Remote Country', select: 'remote_country' },
				{ title: 'Flag', select: 'remote_cc' },
				{ title: 'Protocol', select: 'proto' },
				{ title: 'HTTP Host', select: 'http_host' },
				{ title: 'IOC', select: 'ioc' },
				{ title: 'IOC Type', select: 'ioc_typeIndicator' },
				{ title: 'IOC Stage', select: 'ioc_typeInfection' },
				{ title: 'MD5', select: 'md5' }
			];
			var table1Settings = {
				sort: [[0, 'desc']],
				div: 'table',
				title: 'Extracted Files by Remote IP'
			}

			async.parallel([
			// Table function(s)
			function(callback) {
				new dataTable(table1SQL, table1Params, table1Settings, database, function(err,data){
					tables.push(data);
					callback();
				});
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
			var results = {
				tables: tables
			};
			//console.log(results);
			res.json(results);
		});
	} else {
		res.redirect('/');
	}

};