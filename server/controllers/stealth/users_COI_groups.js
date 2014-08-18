'use strict';

var force_stealth = require('../constructors/force_stealth'),
config = require('../../config/config'),
async = require('async');

var permissions = [3];

module.exports = function(pool) {
	return {
		render: function(req, res) {
			var database = req.session.passport.user.database;
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			if (req.query.start && req.query.end) {
				start = req.query.start;
				end = req.query.end;
			}
			if (permissions.indexOf(parseInt(req.session.passport.user.level)) !== -1) {
				var forceReturn = [];
				var info = [];
				var forceSQL1 = {
					query: 'SELECT '+
								'`user`, '+
								'`role` '+
							'FROM '+
								'`stealth_role_user` '+
							'WHERE '+
								'`archive` = 0',
					insert: []
				}
				var forceSQL2 = {
					query: 'SELECT '+
								'`lan_user` AS `user`, '+
								'stealth_user.group, '+
								'`role` '+
							'FROM '+
								'`stealth_user` '+
							'JOIN '+
								'`stealth_role_group` '+
							'ON '+
								'stealth_user.group = stealth_role_group.group '+
								'AND stealth_role_group.archive = 0 '+
								'AND stealth_user.archive = 0',
					insert: []
				}
				var forceSQL3 = {
					query: 'SELECT '+
								'`role`, '+
								'`cois`, '+
								'`rule`, '+
								'`rule_order` '+
							'FROM '+
								'`stealth_role_coi` '+
							'WHERE '+
								'`archive` = 0 ' +
							'ORDER BY '+
								'`cois`, `rule_order` ASC',
					insert: []
				}
				async.parallel([
					// Table function(s)
					function(callback) {
						new force_stealth(forceSQL1, forceSQL2, forceSQL3, {database: database, pool: pool}, function(err,data){
							forceReturn = data;
							callback();
						});
					},
				], function(err) { //This function gets called after the two tasks have called their "task callbacks"
					if (err) throw console.log(err);
					var results = {
						info: info,
						force: forceReturn
					};
					res.json(results);
				});
			} else {
				res.redirect('/');
			}
		}
	}
};