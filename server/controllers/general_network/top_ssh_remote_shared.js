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
	if (req.query.lan_ip && req.query.remote_ip) {
		var tables = [];
		var info = [];
		var table1SQL = 'SELECT '+
			'date_format(from_unixtime(`time`), "%Y-%m-%d %H:%i:%s") as time, '+ // Last Seen
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
			'`status_code`, ' +
			'`direction`, ' +
			'`lan_client`, ' +
			'`remote_server`, ' +
			'`ioc`, ' +
			'`ioc_attrID`, ' +
			'`ioc_childID`, ' +
			'`ioc_parentID`, ' +
			'`ioc_severity`, ' +
			'`ioc_typeInfection`, ' +
			'`ioc_typeIndicator`, ' +
			'`ioc_count` ' +
			'FROM `ssh` '+
			'WHERE time BETWEEN '+start+' AND '+end+' '+
			'AND `lan_ip` = \''+req.query.lan_ip+'\' '+
			'AND `remote_ip` = \''+req.query.remote_ip+'\'';
		var table1Params = [
			{
				title: 'Time',
				select: 'time'
			},
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
			{ title: 'Status Code', select: 'status_code' },
			{ title: 'Direction', select: 'direction' },
			{ title: 'LAN client', select: 'lan_client' },
			{ title: 'Remote Server', select: 'remote_server' },
			{ title: 'IOC', select: 'ioc' },
			{ title: 'IOC Attribute ID', select: 'ioc_attrID' },
			{ title: 'IOC Child ID', select: 'ioc_childID' },
			{ title: 'IOC Parent ID', select: 'ioc_parentID' },
			{ title: 'IOC Severity', select: 'ioc_severity' },
			{ title: 'IOC Type Infection', select: 'ioc_typeInfection' },
			{ title: 'IOC Type Indicator', select: 'ioc_typeIndicator' },
			{ title: 'IOC Count', select: 'ioc_count' }
		];
		var table1Settings = {
			sort: [[1, 'desc']],
			div: 'table',
			title: 'Common SSH Connections between Remote and Local Host'
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