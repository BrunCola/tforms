'use strict';

var query = require('./constructors/query'),
	bcrypt = require('bcrypt');

module.exports = function(pool) {
	return {
		archive: function(req, res) {
			var database = req.session.passport.user.database;
			var archive = {
				query: "UPDATE `conn_ioc` SET `trash` = UNIX_TIMESTAMP(NOW()) WHERE `lan_ip`= ? AND `remote_ip`= ? AND ioc= ?",
				insert: [req.body.lan_ip, req.body.remote_ip, req.body.ioc]
			}
			new query(archive, {database: database, pool: pool}, function(err,data){
				if (err) {
					res.send(500);
				} else {
					res.send(200);
				}
			});
		},
		restore: function(req, res) {
			var database = req.session.passport.user.database;
			var restore = {
				query: "UPDATE `conn_ioc` SET `trash` = null WHERE `lan_ip`= ? AND `remote_ip`= ? AND ioc= ?",
				insert: [req.body.lan_ip, req.body.remote_ip, req.body.ioc]
			}
			new query(restore, {database: database, pool: pool}, function(err,data){
				if (err) {
					res.send(500);
				} else {
					res.send(200);
				}
			});
		},
		clear: function(req, res) {
			var database = req.session.passport.user.database;
			var clear = {
				query: "DELETE FROM `conn_ioc` WHERE `trash` IS NOT NULL",
				insert: []
			}
			new query(clear, {database: database, pool: pool}, function(err,data){
				if (err) {
					res.send(500);
				} else {
					res.send(200);
				}
			});
		},
		update: function(req, res) {
			if (req.body.newPass) {
				bcrypt.hash(req.body.newPass, 10, function( err, bcryptedPassword) {
					if (err) { res.send(500) }
					var update = {
						query: "UPDATE `user` SET `email`= ?, `password`= ? WHERE `email` = ?",
						insert: [req.body.newemail, bcryptedPassword, req.session.passport.user.email]
					}
					new query(update, {database: 'rp_users', pool: pool}, function(err,data){
						if (err) {
							res.send(500);
						} else {
							res.send(200);
						}
					});
				});
			} else {
				var update = {
					query: "UPDATE `user` SET `email`= ? WHERE `email` = ?",
					insert: [req.body.newemail, req.session.passport.user.email]
				}
				new query(update, {database: 'rp_users', pool: pool}, function(err,data){
					if (err) {
						res.send(500);
					} else {
						res.send(200);
					}
				});
			}
		},
		local_cc: function(req, res) {
			var zone = req.body.zone;
			if (zone !== undefined) {
				var clear = {
					query: "SELECT zone_cc FROM zone WHERE client = ? AND zone = ?",
					insert: [database, zone]
				}
				new query(clear, {database: 'rp_users', pool: pool}, function(err,data){
					if (err) {
						res.send(500);
					} else {
						res.json(data);
					}
				});
			} else {
				res.send(500);
			}
		}
	}
}