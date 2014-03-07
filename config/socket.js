'use strict';
var mysql = require('mysql'),
	config = require('./config'),
	nodemailer = require("nodemailer"),
	phantom = require('node-phantom');

module.exports = function(app, passport, io) {

	// grab config file
	var connection = mysql.createConnection(config.db);
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

		// Socket has connected, increase socket count
		socketCount++
		// Let all sockets know how many are connected
		io.sockets.emit('users connected', socketCount)

		socket.on('disconnect', function() {
			// Decrease the socket count on a disconnect, emit
			socketCount--
			io.sockets.emit('users connected', socketCount)
		})

		socket.on('archiveIOC', function(data){
			console.log(data);
		})

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

	// 	socket.on('checkpoint', function(userData){
	// 		function newCP() {
	// 			var newCheckpoint = Math.round(new Date().getTime() / 1000);
	// 			//io.sockets.emit('checkpointSet', newCheckpoint);
	// 			connection.query("UPDATE `user` SET `checkpoint`= "+newCheckpoint+" WHERE `id` = '"+userData.id+"'");
	// 		}
	// 		newCP();
	// 	});

	// 	socket.on('init', function(userData) {
	// 		function init() {
	// 			console.log(userData)
	// 			var alerts = [];
	// 			var checkpoint = userData.checkpoint;
	// 			// select user checkpoint here
	// 			connection.query("SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = '"+userData.username+"' AND alert.added >= '"+checkpoint+"' ORDER BY alert.added")
	// 				.on('result', function(data){
	// 					if (data.added > userData.checkpoint) {
	// 						data.newIOC = true;
	// 					}
	// 					alerts.push(data);
	// 				})
	// 				.on('end', function(){
	// 					socket.emit('initial iocs', alerts);
	// 				})
	// 		}
	// 		init();
	// 	});
	})

};