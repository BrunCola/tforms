'use strict';
var mysql = require('mysql'),
	config = require('./config'),
	nodemailer = require("nodemailer"),
	phantom = require('phantom'),
	bcrypt = require('bcrypt');

module.exports = function(app, passport, io, pool) {
	var alerts = [];
	var isInitIoc = false;
	var socketCount = 0;
	var smtpTransport = nodemailer.createTransport("SMTP", {
		host: "smtp.emailsrvr.com", // hostname
		secureConnection: true, // use SSL
		port: 465, // port for secure SMTP
		auth: {
			user: "notice@rapidphire.com",
			pass: "r@p1dph1r3"
		}
	});
	io.sockets.on('connection', function(socket){
		var POLLCheckpoint, timer, connection;
		socketCount++;
		// Let all sockets know how many are connected
		io.sockets.emit('users connected', socketCount);

		socket.on('disconnect', function() {
			// Decrease the socket count on a disconnect, emit
			socketCount--
			io.sockets.emit('users connected', socketCount);
		})

		// Archive functions
		socket.on('archiveIOC', function(data){
			var db = config.db;
			db.database = data.database;
			var connection = mysql.createConnection(db);
			connection.query("UPDATE `conn_ioc` SET `trash` = UNIX_TIMESTAMP(NOW()) WHERE `lan_ip`='"+data.lan_ip+"' AND `remote_ip`='"+data.remote_ip+"' AND ioc='"+data.ioc+"'", function(err, rows, fields){
				connection.destroy();
			});
		});
		socket.on('restoreIOC', function(data){
			var db = config.db;
			db.database = data.database;
			var connection = mysql.createConnection(db);
			connection.query("UPDATE `conn_ioc` SET `trash` = null WHERE `lan_ip`='"+data.lan_ip+"' AND `remote_ip`='"+data.remote_ip+"' AND ioc='"+data.ioc+"'", function(err, rows, fields){
				connection.destroy();
			});
		});
		socket.on('emptyArchive', function(data){
			var db = config.db;
			db.database = data.database;
			var connection = mysql.createConnection(db);
			connection.query("DELETE FROM `conn_ioc` WHERE `trash` IS NOT NULL", function (err, response){
				if (response) {
					socket.emit('emptyArchiveConfirm');
				}
				connection.destroy();
			});
		});
		socket.on('updateUser', function(data){
			var db = config.db;
			db.database = 'rp_users';
			var connection = mysql.createConnection(db);
			if (data.newPass) {
				bcrypt.hash(data.newPass, 10, function( err, bcryptedPassword) {
					connection.query("UPDATE `user` SET `email`='"+data.newemail+"', `password`='"+bcryptedPassword+"' WHERE `email` = '"+data.oldemail+"'", function(err, rows, fields){
						connection.destroy();
					});
				});
			} else {
				connection.query("UPDATE `user` SET `email`='"+data.newemail+"' WHERE `email` = '"+data.oldemail+"'", function(err, rows, fields){
					connection.destroy();
				});
			}
		});


		socket.on('init', function(userData) {
			// console.log(userData)
			var alerts = [], newIOCcount = 0;
			// get user's checkpoint from session data (to avoid caching)
			pool.query("SELECT checkpoint FROM user WHERE username = '"+userData.username +"'", function(err, results){
				if (err) throw err;
				if (results.length > 0) {
					// if result is returned, run query checking for new alerts
					var checkpoint = results[0].checkpoint;
					var db = {
						port: config.db.port,
						host: config.db.host,
						user: config.db.user,
						password: config.db.password,
						database: userData.database
					};
					connection = mysql.createConnection(db);
					connection.query("SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = '"+userData.username+"' AND alert.added >= '"+checkpoint+"' ORDER BY alert.added",function (err, results) {
						if (results) {
							newIOCcount = results.length;
						}
					});
					connection.query("SELECT "+
						"alert.added, "+
						"conn_ioc.ioc, "+
						"conn_ioc.ioc_severity "+
						"FROM alert, conn_ioc "+
						"WHERE alert.conn_uids = conn_ioc.conn_uids "+
						"AND alert.username = '"+userData.username+"' "+
						"AND alert.trash is null "+
						"ORDER BY alert.added DESC "+
						"LIMIT 10")
					.on('result', function(data) {
						if (data.added >= checkpoint) {
							data.newIOC = true;
						}
						alerts.push(data);
					})
					.on('end', function(){
						socket.emit('initial iocs', alerts, newIOCcount);
						POLLCheckpoint = Math.round(new Date().getTime() / 1000);
						timer = setInterval(function(){polling(userData.username, POLLCheckpoint, connection)}, 5000);
					})
				}
			})
		});
		socket.on('checkpoint', function(userData){
			function newCP() {
				var newCheckpoint = Math.round(new Date().getTime() / 1000);
				POLLCheckpoint = newCheckpoint;
				console.log('checkpoint now set to: '+newCheckpoint);
				// var config = require('./config');
				// config.db.database = 'rp_users';
				// var connection = mysql.createConnection(db);
				clearInterval(timer);
				timer = setInterval(function(){polling(userData.username, POLLCheckpoint, connection)}, 5000);
				pool.query("UPDATE `user` SET `checkpoint`= "+newCheckpoint+" WHERE `username` = '"+userData.username+"'");
			}
			newCP();
		});
		function polling(username, POLLCheckpoint, connection) {
			var newarr = []; var arr = []; var topAdded = 0;
			connection.query("SELECT "+
						"alert.added, "+
						"conn_ioc.ioc, "+
						"conn_ioc.ioc_severity "+
						"FROM alert, conn_ioc "+
						"WHERE alert.conn_uids = conn_ioc.conn_uids "+
						"AND alert.username = '"+username+"' "+
						"AND alert.added >= '"+POLLCheckpoint+"' "+
						"ORDER BY alert.added")
				.on('result', function(data) {
					data.newIOC = true;
					arr.push(data);
					if (data.added > topAdded) {
						topAdded = data.added;
					}
				})
				.on('end', function(){
					if (arr.length > 0) {
						for (var d = 1; d < 11; d++){
							if (arr[arr.length-d] !== undefined) {
								newarr.push(arr[arr.length-d]);
							}
						}
						topAdded += 1;
						clearInterval(timer); // add a second to the timer
						socket.emit('newIOC', newarr, arr.length);
						timer = setInterval(function(){polling(username, topAdded, connection)}, 300000); //change to 5 minutes on result
					}
				})
			console.log('CHECKING for alert > '+POLLCheckpoint);
		}

	})
};