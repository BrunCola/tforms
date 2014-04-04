'use strict';
var mysql = require('mysql'),
	config = require('./config'),
	nodemailer = require("nodemailer"),
	phantom = require('node-phantom'),
	crypto = require('crypto');

module.exports = function(app, passport, io) {

	// grab config file
	//var connection = mysql.createConnection(config.db);
	// change database get to user's
	// establish new connection

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
		socketCount++;
		// Let all sockets know how many are connected
		io.sockets.emit('users connected', socketCount);

		socket.on('disconnect', function() {
			// Decrease the socket count on a disconnect, emit
			socketCount--
			io.sockets.emit('users connected', socketCount);
			// socket.emit('disconnected');
		})

		// Archive functions
		socket.on('archiveIOC', function(data){
			var db = config.db;
			db.database = data.database;
			var connection = mysql.createConnection(db);
			connection.query("UPDATE `conn_ioc` SET `trash` = UNIX_TIMESTAMP(NOW()) WHERE `lan_ip`='"+data.lan_ip+"' AND `remote_ip`='"+data.remote_ip+"' AND ioc='"+data.ioc+"'");
		});
		socket.on('restoreIOC', function(data){
			var db = config.db;
			db.database = data.database;
			var connection = mysql.createConnection(db);
			connection.query("UPDATE `conn_ioc` SET `trash` = null WHERE `lan_ip`='"+data.lan_ip+"' AND `remote_ip`='"+data.remote_ip+"' AND ioc='"+data.ioc+"'");
		});
		socket.on('emptyArchive', function(data){
			var db = config.db;
			db.database = data.database;
			var connection = mysql.createConnection(db);
			connection.query("DELETE FROM `conn_ioc` WHERE `trash` IS NOT NULL", function (err, response){
				if (response) {
					socket.emit('emptyArchiveConfirm');
				}
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
			});
		});
		socket.on('checkPass', function(data){
			var db = config.db;
			db.database = 'rp_users';
			var connection = mysql.createConnection(db);
			if (data.password) {
				var pass = crypto.createHash('md5').update(data.password).digest('hex');
				var sql="SELECT * FROM user WHERE id = '"+ data.id +"' and password = '"+ pass +"' limit 1";
				console.log(sql);
				connection.query(sql,
					function (err,results) {
						if (err) throw err;
						if(results.length > 0){
							socket.emit('passGood');
						}else{
							socket.emit('passBad');
						}
					}
				);
			}
		});
		socket.on('updateUser', function(data){
			var db = config.db;
			db.database = 'rp_users';
			var connection = mysql.createConnection(db);
			var pass = crypto.createHash('md5').update(data.password).digest('hex');
			if (data.newPass) {
				var newpass = crypto.createHash('md5').update(data.newPass).digest('hex');
				connection.query("UPDATE `user` SET `email`='"+data.email+"', `username`='"+data.username+"', `password`='"+newpass+"' WHERE `id` = '"+data.id+"' AND `password` = '"+pass+"'");
			} else {
				connection.query("UPDATE `user` SET `email`='"+data.email+"', `username`='"+data.username+"' WHERE `id` = '"+data.id+"' AND `password` = '"+pass+"'");
			}
		});

	// 	// socket.on('new note', function(data){
	// 	//  // New note added, push to all sockets and insert into db
	// 	//  notes.push(data)
	// 	//  io.sockets.emit('new note', data)
	// 	//  // Use node's db injection format to filter incoming data
	// 	//  connection.query('INSERT INTO notes (note) VALUES (?)', data.note)
	// 	// })


	// 	socket.on('report_generate', function(data){
	// 		var mailOptions = {
	// 			from: "rapidPHIRE <notice@rapidphire.com>", // sender address
	// 			to: "andrewdillion6@gmail.com", // list of receivers
	// 			subject: "Test", // Subject line
	// 			text: "Hello world", // plaintext body
	// 			html: "<b>BALLS</b>", // html body
	// 			attachments: [{
	// 				fileName: "rp.pdf",
	// 				filePath: "./temp/rp.pdf"
	// 			}]
	// 		};
	// 		phantom.create(function(err,ph) {
	// 			return ph.createPage(function(err,page) {

	// 				return page.open("http://localhost:3000/report#!/iochits_report", function(err,status) {
	// 					console.log("opened site? ", status);
	// 					setTimeout(function() {
	// 						page.paperSize = {
	// 							format: 'A4',
	// 							margin: '0.4cm',
	// 						};
	// 						page.render('./temp/rp.pdf');
	// 						ph.exit();
	// 						smtpTransport.sendMail(mailOptions, function(error, response){
	// 							if(error){
	// 								console.log(error);
	// 							}else{
	// 								console.log("Message sent: " + response.message);
	// 							}
	// 						})
	// 					}, 5000);
	// 				});
	// 			});
	// 		});

	// 		// New note added, push to all sockets and insert into db
	// 		// notes.push(data)
	// 		// io.sockets.emit('new note', data)
	// 		// // Use node's db injection format to filter incoming data
	// 		// connection.query('INSERT INTO notes (note) VALUES (?)', data.note)
	// 		console.log(data.email);
	// 	});

		var POLLCheckpoint, timer, userConnection, connection;
		socket.on('init', function(userData) {
			// console.log(userData)
			var alerts = [], newIOCcount = 0;
			var cdb = {
				port: config.db.port,
				host: config.db.host,
				user: config.db.user,
				password: config.db.password,
				database: 'rp_users'
			};
			userConnection = mysql.createConnection(cdb);
			// get user's checkpoint from session data (to avoid caching)
			userConnection.query("SELECT checkpoint FROM user WHERE username = '"+userData.username +"'", function(err, results){
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
				userConnection.query("UPDATE `user` SET `checkpoint`= "+newCheckpoint+" WHERE `id` = '"+userData.id+"'");
			}
			newCP();
		});
		socket.on('disconnect', function () {
			clearInterval(timer);
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