'use strict';
 var CronJob = require('cron').CronJob,
	nodemailer = require("nodemailer"),
	config = require('./config'),
	phantom = require('phantom'),
	mysql = require('mysql'),
	$ = require('jquery'),
	fs = require('fs');

var smtpTransport = nodemailer.createTransport("SMTP", {
	host: config.mailer.host, // hostname
	secureConnection: config.mailer.secure, // use SSL
	port: config.mailer.port, // port for secure SMTP
	auth: {
		user: config.mailer.user,
		pass: config.mailer.pass
	}
});

function sendReport(user) {
	var fileName = user.email+'_rapidphire_'+Math.round(new Date().getTime() / 1000)+'.pdf';
	var mailOptions = {
		from: "rapidPHIRE <notice@rapidphire.com>", // sender address
		to: user.email, // list of receivers
		subject: 'rapidPHIRE IOC Event report', // Subject line
		text: 'Attached is a report, generated by the rapidPHIRE reporting bot, displaying IOC Hit Summaries detected within the last 24 hours.', // plaintext body
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
			page.setHeaders({'content-type': 'application/x-www-form-urlencoded'});
			var steps = [
				function() {
					page.open(config.reports.url+'/login', 'post', 'email='+config.reports.email+'&password='+config.reports.pass, function (status) {
						if (status !== 'success') {
							console.log('Unable to post!');
						} else {
							console.log('logged in');
						}
					});
				},
				function() {
					//Load Login Page
					var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
					var end = Math.round(new Date().getTime() / 1000);
					page.open(config.reports.url+"/report#!/ioc_events_report?start="+start+"&end="+end+"&database="+user.database, function (status) {
						loadInProgress = false;
					});
				},
				function() {
					page.render('./temp/'+fileName);
				},
				function() {
					loadInProgress = true;
					setTimeout(function(){
						smtpTransport.sendMail(mailOptions, function(error, response){
							if (error) {
								console.log(error);
								loadInProgress = false;
							} else {
								fs.exists('./temp/'+fileName, function(exists) {
									if (exists) {
										fs.unlinkSync('./temp/'+fileName);
										loadInProgress = false;
										return;
									} else {
										loadInProgress = false;
										return;
									}
								});
								return;
							}
						})
					}, 30000)
				},
				function() {
					//sign out of session
					page.open(config.reports.url+"/logout");
				},
			];
			interval = setInterval(function() {
				if (!loadInProgress && typeof steps[testindex] == "function") {
					console.log("step " + (testindex + 1)+' '+user.email);
					steps[testindex]();
					testindex++;
				}
				if (typeof steps[testindex] != "function") {
					console.log("Report complete for "+user.email);
					ph.exit();
					clearInterval(interval);
				}
			}, 20000);
		});
	});
}

module.exports = function(db) {
	// get users and send reports
	if (config.reports.active === true) {
		new CronJob(config.reports.schedule, function(){
			var connection = mysql.createConnection(db);
			var sql="SELECT * FROM user WHERE email_report = '1'";
			db.query(sql, function(err, users, fields) {
				if (err) throw err;
				for (var n in users) {
					sendReport(users[n]);
				}
				connection.destroy();
			});
		}, null, true, null);
	}
};
