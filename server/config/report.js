'use strict';
 var CronJob = require('cron').CronJob,
	nodemailer = require("nodemailer"),
	config = require('./config'),
	phantom = require('phantom'),
	mysql = require('mysql');

var smtpTransport = nodemailer.createTransport("SMTP", {
	host: "smtp.emailsrvr.com", // hostname
	secureConnection: true, // use SSL
	port: 465, // port for secure SMTP
	auth: {
		user: "notice@rapidphire.com",
		pass: "r@p1dph1r3"
	}
});

module.exports = function(db) {
	// // var now = Math.round(new Date().getTime() / 1000);
	// // get users and send reports
	// var connection = mysql.createConnection(db);
	// var sql="SELECT * FROM user WHERE email = 'samyotte@phirelight.com'";
	// db.query(sql, function(err, users, fields) {
	// 	if (err) throw err;
	// 		for (var n in users) {
	// 		// new CronJob('* * * * * *', function(){
	// 			var mailOptions = {
	// 				from: "rapidPHIRE <notice@rapidphire.com>", // sender address
	// 				// to: users[n].email, // list of receivers
	// 				to: 'andrewdillion6@gmail.com', // list of receivers
	// 				subject: 'rapidPHIRE IOC Event report', // Subject line
	// 				text: 'some body', // plaintext body
	// 				// html: "<b>Testing</b>", // html body
	// 				attachments: [{
	// 					fileName: users[n].username+'_'+Math.round(new Date().getTime() / 1000)+".pdf",
	// 					filePath: "./temp/"+users[n].username+'_'+Math.round(new Date().getTime() / 1000)+".pdf"
	// 				}]
	// 			};
	// 			phantom.create('--ignore-ssl-errors=yes', function(ph) {
	// 				return ph.createPage(function(page) {
	// 					page.set('viewportSize', {
	// 						width: 1056,
	// 						height: 600
	// 					});
	// 					page.set('paperSize', {
	// 						orientation: 'portrait',
	// 						format: 'A4',
	// 						margin: '0.4cm',
	// 						// footer: {
	// 						//  height: "0.5cm",
	// 						//  contents: phantom.callback(function(pageNum, numPages) {
	// 						//      if (pageNum === 0) {
	// 						//          return "";
	// 						//      }
	// 						//      return "<p style='font-size:9px;letter-spacing:0.5px;'>© 2014 Phirelight Security Solutions <span style='float:right;margin-left:-10px'>" + pageNum + " / " + numPages + "</span></p style='font-size:10px'>";
	// 						//  })
	// 						// }
	// 					});
	// 					var testindex = 0, loadInProgress = false, interval;
	// 					page.onConsoleMessage = function(msg) {
	// 						console.log(msg);
	// 					};
	// 					page.onLoadStarted = function() {
	// 						loadInProgress = true;
	// 						console.log("load started");
	// 					};
	// 					page.onLoadFinished = function() {
	// 						loadInProgress = false;
	// 						console.log("load finished");
	// 					};
	// 					var steps = [
	// 						function() {
	// 							//Load Login Page
	// 							page.open("https://localhost:3000/#!/login");
	// 						},
	// 						function() {
								
	// 								page.evaluate(function() {

	// 									setTimeout(function() {
	// 									document.getElementById("email").value = "samyotte@phirelight.com";
	// 									document.getElementById("password").value = "mainstreet";
	// 									document.getElementById("login_button").click();
	// 									console.log("Login submitted!");
	// 									// console.log(result)
	// 									}, 10000);
	// 								});
							
	// 						},
	// 						function() {
	// 							//Load Login Page
	// 							var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	// 							var end = Math.round(new Date().getTime() / 1000);
	// 							page.open("https://localhost:3000/report#!/ioc_events?start="+start+"&end="+end);
	// 						},
	// 						function() {
	// 							page.render('./temp/'+users[n].username+'_'+Math.round(new Date().getTime() / 1000)+'.pdf');
	// 						},
	// 						function() {
	// 							setTimeout(function(){
	// 								smtpTransport.sendMail(mailOptions, function(error, response){
	// 									if (error) {
	// 										console.log(error);
	// 									} else {
	// 										console.log("Message sent: " + response.message);
	// 									}
	// 								})
	// 							}, 5000)
	// 						},
	// 						function() {
	// 							//sign out of session
	// 							page.open("https://localhost:3000/logout");
	// 						},
	// 					];
	// 					interval = setInterval(function() {
	// 						if (!loadInProgress && typeof steps[testindex] == "function") {
	// 							console.log("step " + (testindex + 1));
	// 							steps[testindex]();
	// 							testindex++;
	// 						}
	// 						if (typeof steps[testindex] != "function") {
	// 							console.log("Report complete!");
	// 							ph.exit();
	// 							clearInterval(interval);
	// 						}
	// 					}, 5000);
	// 				});
	// 			});
	// 		// }, null, true, null);
	// 	}
	// });
};