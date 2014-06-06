'use strict';

var dataTable = require('../constructors/datatable'),
query = require('../constructors/query'),
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
	if (req.query.mime) {
		var tables = [];
		var table1SQL = 'SELECT '+
				'sum(`count`) AS `count`,'+
				'date_format(max(from_unixtime(`time`)), "%Y-%m-%d %H:%i:%s") AS time,'+
				'`mime`,'+
				'`lan_zone`,'+
				'`machine`,'+
				'`lan_ip`,'+
				'(sum(`size`) / 1048576) AS size,'+
				'sum(`ioc_count`) AS ioc_count '+
			'FROM '+
				'`file_meta` '+
			'WHERE '+
				'time BETWEEN '+start+' AND '+end+' '+
				'AND `mime` = \''+req.query.mime+'\' '+
			'GROUP BY '+
				'`lan_zone`,'+
				'`lan_ip`';
			var table1Params = [
				{
					title: 'Last Seen',
					select: 'time',
					dView: true,
					link: {
						type: 'file_local',
						val: ['lan_zone','lan_ip', 'mime'],
						crumb: false
					},
				},
				{ title: 'Total Extracted Files', select: 'count' },
				{ title: 'Zone', select: 'lan_zone' },
				{ title: 'Machine Name', select: 'machine' },
				{ title: 'Lan IP', select: 'lan_ip' },
				{ title: 'Total Size (MB)', select: 'size' },
				{ title: 'Total IOC Hits', select: 'ioc_count' }
			];
			var table1Settings = {
				sort: [[0, 'desc']],
				div: 'table',
				title: 'Extracted File Types'
			}
			async.parallel([
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