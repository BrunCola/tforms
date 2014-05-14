'use strict';
 var CronJob = require('cron').CronJob,
	nodemailer = require("nodemailer"),
	config = require('./config'),
	phantom = require('phantom'),
	mysql = require('mysql'),
	fs = require('fs');

var smtpTransport = nodemailer.createTransport("SMTP", {
	host: "smtp.emailsrvr.com", // hostname
	secureConnection: true, // use SSL
	port: 465, // port for secure SMTP
	auth: {
		user: "notice@rapidphire.com",
		pass: "r@p1dph1r3"
	}
});

function sendReport(user) {
	var fileName = user.email+'_rapidphire_'+Math.round(new Date().getTime() / 1000)+'.pdf';
	var mailOptions = {
		from: "rapidPHIRE <notice@rapidphire.com>", // sender address
		// to: user.email, // list of receivers
		to: user.email, // list of receivers
		subject: 'rapidPHIRE IOC Event report', // Subject line
		text: 'Text body goes here!', // plaintext body
		// html: "<b>Testing</b>", // html body
		attachments: [{
			fileName: fileName,
			filePath: './temp/'+fileName
		}]
	};
	phantom.create('--ignore-ssl-errors=yes', function(ph) {
		return ph.createPage(function(page) {
			page.set('viewportSize', {
				width: 1056,
				height: 600
			});
			page.set('paperSize', {
				orientation: 'portrait',
				format: 'A4',
				margin: '0.4cm',
				// footer: {
				//  height: "0.5cm",
				//  contents: phantom.callback(function(pageNum, numPages) {
				//      if (pageNum === 0) {
				//          return "";
				//      }
				//      return "<p style='font-size:9px;letter-spacing:0.5px;'>© 2014 Phirelight Security Solutions <span style='float:right;margin-left:-10px'>" + pageNum + " / " + numPages + "</span></p style='font-size:10px'>";
				//  })
				// }
			});
			var testindex = 0, loadInProgress = false, interval;
			page.onConsoleMessage = function(msg) {
				console.log(msg);
			};
			page.onLoadStarted = function() {
				loadInProgress = true;
				console.log("load started");
			};
			page.onLoadFinished = function() {
				loadInProgress = false;
				console.log("load finished");
			};
			var steps = [
				function() {
					//Load Login Page
					page.open("https://localhost:3000/#!/login");
				},
				function() {
					page.open('https://localhost:3000/login', 'post', 'email=samyotte@phirelight.com&password=mainstreet', function (status) {
						if (status !== 'success') {
							console.log('Unable to post!');
						} else {
							console.log(page.content);
						}
						// phantom.exit();
					});
				},
				function() {
					//Load Login Page
					var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
					var end = Math.round(new Date().getTime() / 1000);
					page.open("https://localhost:3000/report#!/ioc_events_report?start="+start+"&end="+end);
				},
				function() {
					page.render('./temp/'+fileName);
				},
				function() {
					setTimeout(function(){
						smtpTransport.sendMail(mailOptions, function(error, response){
							if (error) {
								console.log(error);
							} else {
								console.log("Message sent: " + response.message);
								fs.unlinkSync('./temp/'+fileName);
							}
						})
					}, 30000)
				},
				function() {
					//sign out of session
					page.open("https://localhost:3000/logout");
				},
			];
			interval = setInterval(function() {
				if (!loadInProgress && typeof steps[testindex] == "function") {
					console.log("step " + (testindex + 1));
					steps[testindex]();
					testindex++;
				}
				if (typeof steps[testindex] != "function") {
					console.log("Report complete!");
					ph.exit();
					clearInterval(interval);
				}
			}, 5000);
		});
	});
}

module.exports = function(db) {
	// get users and send reports
	new CronJob('0,15,30,45 * * * *', function(){
		var connection = mysql.createConnection(db);
		var sql="SELECT * FROM user WHERE email_report = '1'";
		db.query(sql, function(err, users, fields) {
			console.log(users)
			if (err) throw err;
			for (var n in users) {
				sendReport(users[n]);
			}
		});
	}, null, true, null);
};