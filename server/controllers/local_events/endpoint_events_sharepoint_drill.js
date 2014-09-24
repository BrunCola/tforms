'use strict';

var dataTable = require('../constructors/datatable'),
config = require('../../config/config'),
async = require('async');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			// var database = null;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			//var results = [];
			if (req.query.event_id && req.query.lan_ip && req.query.src_user) {
				var tables = [];
				var info = [];
				var table1 = {
					query: 'SELECT '+
						'`timestamp` as time,'+
						'`sharepoint_user`,'+
						'`lan_ip`,'+
						'`machine`, ' +
						'`lan_zone`, ' +
						'`remote_ip`, ' +
						'`remote_port`, '  +
						'`remote_cc`, ' +
						'`remote_country`, ' +
						'`remote_asn_name`, ' +
						'`location`,'+
						'`event`,'+
						'`event_id`,'+
						'`event_location` '+
					'FROM '+
						'`sharepoint` '+
					'WHERE '+
						'`timestamp` BETWEEN ? AND ? '+
						'AND event_id = ? '+
						'AND lan_ip = ? ',//+
					//	'AND lan_zone = ?',
					insert: [start, end, req.query.event_id, req.query.lan_ip],
					params: [
						{ title: 'Time', select: 'time' },
						{ title: 'Local IP', select: 'lan_ip' },
						{ title: 'Sharepoint User', select: 'sharepoint_user'},
						{ title: 'Location', select: 'location' },
						{ title: 'Event', select: 'event' },
						{ title: 'Event ID', select: 'event_id'},
						{ title: 'Event Location', select: 'event_location' },
					],
					settings: {
						sort: [[0, 'desc']],
						div: 'table',
						title: 'Full Endpoint Event Logs'
					}
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						console.log(table1.query);
						new dataTable(table1, {database: database, pool: pool}, function(err,data){
							tables.push(data);
							callback();
						});
					},
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err)
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
		}
	}
};