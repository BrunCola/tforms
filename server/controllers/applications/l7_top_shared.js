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
	if (req.query.lan_zone && req.query.lan_ip && req.query.remote_ip && req.query.l7_proto) {
		var tables = [];
		var info = [];
		var table1SQL = 'SELECT '+
				'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") AS time,'+
				'`machine`,'+
				'`l7_proto`,'+
				'`lan_zone`,'+
				'`lan_ip`,'+
				'`lan_port`,'+
				'`remote_ip`,'+
				'`remote_port`,'+
				'`remote_cc`,'+
				'`remote_country`,'+
				'`remote_asn`,'+
				'`remote_asn_name`,'+
				'`dns`,'+
				'`http`,'+
				'`ssl`,'+
				'`ftp`,'+
				'`irc`,'+
				'`smtp`,'+
				'`file`,'+
				'`ioc`,'+
				'`ioc_severity`,'+
				'`ioc_typeInfection`,'+
				'`ioc_typeIndicator`,'+
				'`ioc_count` '+
			'FROM '+
				'`conn` ' +
			'WHERE '+
				'`time` BETWEEN '+start+' AND '+end+' ' +
				'AND `lan_zone` = \''+req.query.lan_zone+'\' '+
				'AND `lan_ip` = \''+req.query.lan_ip+'\' ' +
				'AND `remote_ip` = \''+req.query.remote_ip+'\' ' +
				'AND `l7_proto` = \''+req.query.l7_proto+'\'';
		var table1Params = [
			{ title: 'Time', select: 'time' },
			{ title: 'Applications', select: 'l7_proto' },
			{ title: 'LAN Zone', select: 'lan_zone' },
			{ title: 'LAN IP', select: 'lan_ip' },
			{ title: 'LAN port', select: 'lan_port' },
			{ title: 'Machine Name', select: 'machine' },
			{ title: 'Remote IP', select: 'remote_ip'},
			{ title: 'Remote port', select: 'remote_port' },
			{ title: 'Flag', select: 'remote_cc' },
			{ title: 'Remote Country', select: 'remote_country' },
			{ title: 'Remote ASN', select: 'remote_asn' },
			{ title: 'Remote ASN Name', select: 'remote_asn_name' },
			{ title: 'IOC', select: 'ioc' },
			{ title: 'Infection Stage', select: 'ioc_typeInfection' },
			{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
			{ title: 'IOC Severity', select: 'ioc_severity' },
			{ title: 'IOC Count', select: 'ioc_count' },
			{ title: 'DNS', select: 'dns' },
			{ title: 'HTTP', select: 'http' },
			{ title: 'SSL', select: 'ssl' },
			{ title: 'FTP', select: 'ftp' },
			{ title: 'IRC', select: 'irc' },
			{ title: 'SMTP', select: 'smtp' },
			{ title: 'File', select: 'file' }
		];
		var table1Settings = {
			sort: [[0, 'desc']],
			div: 'table',
			title: 'Common IP Connections between Remote and Local Host'
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