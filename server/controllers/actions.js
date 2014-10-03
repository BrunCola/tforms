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
					query: "SELECT zone_cc, zone_country FROM zone WHERE `database` = ? AND zone = ?",
					insert: [req.session.passport.user.database, zone]
				}
				new query(clear, {database: 'rp_users', pool: pool}, function(err,data){
					if (err) {
						res.send(500);
					} else {
						res.json(data[0]);
					}
				});
			} else {
				res.send(500);
			}
		},
		add_map_image: function(req, res) {
			var database = req.session.passport.user.database;
			var zone = req.body.zone;
			if (zone !== undefined) {
				var insert_map_image = {
					query: "INSERT INTO `assets` (`type`, `asset_name`, `lan_zone`, `path`) VALUES ('map',?,?,?)",
					insert: [req.body.image_name, zone, req.body.image_path]
				}
				new query(insert_map_image, {database: database, pool: pool}, function(err,data){
					if (err) {
						res.send(500);
					} else {
						res.send(200);
					}
				}); 
			} else {
				res.send(500);
			}
		},
		add_user_image: function(req, res) {
			//need to get the client name or ID here...
			var database = req.session.passport.user.database;
			var zone = req.body.zone;
			if (zone !== undefined) {
				var update_user_image = {
					query: "INSERT INTO `assets` (`type`, `asset_name`, `lan_zone`, `lan_user`, `path`) VALUES ('user',?,?,?,?)",
					insert: [req.body.image_name, zone, req.body.lan_user, req.body.image_path]
				}
				new query(update_user_image, {database: database, pool: pool}, function(err,data){
					if (err) {
						res.send(500);
					} else {
						res.send(200);
					}
				});
			} else {
				res.send(500);
			}
		},
		add_user_to_map: function(req, res) {
			var database = req.session.passport.user.database;
			var lan_ip = req.body.lan_ip;
			var lan_zone = req.body.lan_zone;
			if (lan_ip !== undefined && lan_zone !== undefined) {
				var update_user_ref = {
					query: "UPDATE `users` SET `x`= ?, `y`=?, `map`=? WHERE `lan_ip` = ? AND `lan_zone` = ?",
					insert: [req.body.x_coord, req.body.y_coord, req.body.map_name, req.body.lan_ip, req.body.lan_zone]
				}
				new query(update_user_ref, {database: database, pool: pool}, function(err,data){
					if (err) {
						res.send(500);
					} else {
						res.send(200);
					}
				});
			}else{
				res.send(500);
			}
		}
	}
}