'use strict';

var config = require('../../config/config'),
	mysql = require('mysql'),
	nodemailer = require("nodemailer"),
	phantom = require('node-phantom');

exports.init = function(req, res) {
	var io = req.app.get('io');
	var connection = req.app.get('connection');
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

		//PHANTOM FUNCITONS
		// phantom.create(function(err,ph) {
		// 	return ph.createPage(function(err,page) {
		// 		return page.open("http://github.com/", function(err,status) {
		// 			console.log("opened site? ", status);
		// 			page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
		// 				//jQuery Loaded.
		// 				//Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
		// 				setTimeout(function() {
		// 					return page.evaluate(function() {
		// 						//Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
		// 						var h2Arr = [],
		// 						pArr = [];
		// 						$('h2').each(function() {
		// 							h2Arr.push($(this).html());
		// 						});
		// 						$('p').each(function() {
		// 							pArr.push($(this).html());
		// 						});
		// 						return {
		// 							h2: h2Arr,
		// 							p: pArr
		// 						};
		// 					}, function(err,result) {
		// 					console.log(result);
		// 					ph.exit();
		// 			 	});
		// 			}, 5000);
		// 			});
		// 		});
		// 	});
		// });

		// Socket has connected, increase socket count
		socketCount++
		// Let all sockets know how many are connected
		io.sockets.emit('users connected', socketCount)

		socket.on('disconnect', function() {
			// Decrease the socket count on a disconnect, emit
			socketCount--
			io.sockets.emit('users connected', socketCount)
		})

		// socket.on('new note', function(data){
		// 	// New note added, push to all sockets and insert into db
		// 	notes.push(data)
		// 	io.sockets.emit('new note', data)
		// 	// Use node's db injection format to filter incoming data
		// 	connection.query('INSERT INTO notes (note) VALUES (?)', data.note)
		// })

		socket.on('report_generate', function(data){
			var mailOptions = {
				from: "Andrew Billion ✔ <andrewdillion6@gmail.com>", // sender address
				to: "andrewdillion6@gmail.com", // list of receivers
				subject: "Hello ✔", // Subject line
				text: "Hello world ✔", // plaintext body
				html: "<b>Hello world ✔</b>", // html body
				attachments: [{
					fileName: "github.pdf",
					filePath: "./temp/github.pdf"
				}]
			};
			// phantom.create(function(err,ph) {
			// 	return ph.createPage(function(err,page) {
			// 		return page.open("http://localhost:3000/report#!/iochits", function(err,status) {
			// 			console.log("opened site? ", status);
			// 			setTimeout(function() {
			// 				page.render('./temp/github.png');
		 // 					ph.exit();
		 // 					smtpTransport.sendMail(mailOptions, function(error, response){
			// 					if(error){
			// 						console.log(error);
			// 					}else{
			// 						console.log("Message sent: " + response.message);
			// 					}
			// 				})
		 // 				}, 5000);
			// 		});
			// 	});
			// });



phantom.create(function(err,ph) {
  return ph.createPage(function(err,page) {
    return page.open("http://localhost:3000/report#!/iochits", function(err,status) {
      console.log("opened site? ", status);
		
		//page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
        //jQuery Loaded.
        //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
        setTimeout(function() {
          return page.render('./temp/github.pdf').paperSize = {
			format: 'A4',
			margin: '0.4cm'
		}
          }, function(err,result) {
            smtpTransport.sendMail(mailOptions, function(error, response){
				if(error){
					console.log(error);
				}else{
					console.log("Message sent: " + response.message);
				}
            ph.exit();
          });
        }, 5000);
      //});
    });
  });
});

			// New note added, push to all sockets and insert into db
			// notes.push(data)
			// io.sockets.emit('new note', data)
			// // Use node's db injection format to filter incoming data
			// connection.query('INSERT INTO notes (note) VALUES (?)', data.note)
			console.log(data.email);
		})

		// Check to see if initial query/notes are set
		if (! isInitIoc) {
			// Initial app start, run connection query
			connection.query("SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = 'rapidPHIRE' AND alert.trash is null ORDER BY alert.added DESC LIMIT 5")
				.on('result', function(data){
					// Push results onto the notes array
					alerts.push(data)
				})
				.on('end', function(){
					// Only emit notes after query has been completed
					socket.emit('initial iocs', alerts)
				})

			isInitIoc = true
		} else {
			// Initial iocs already exist, send out
			socket.emit('initial iocs', alerts)
		}
	})
};
