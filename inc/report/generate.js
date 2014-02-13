var page = require('webpage').create(),
	system = require('system'),
	address, size, hHead;
var pizza = 1;

if (system.args.length < 3 || system.args.length > 10) {
    console.log('Usage: generate.js dir filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log(' paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    phantom.exit(1);
}
else {
	size = 'A4';
	var dir = system.args[1];
	var type = system.args[2].split(',');
	// var eType = system.args[2];
	var eType = type[0]; // I have to change this, but emails aren't really listing the types right now anyway
    var output = system.args[3].split(',');
    var eOutput  = system.args[3];
	var email = system.args[4].split(',');
	var start = system.args[5];
	var end = system.args[6];
	var timespan = system.args[7];
	var client = system.args[8];
	var waitFor = function(testFx, onReady, timeOutMillis) {
		var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
		start = new Date().getTime(),
		condition = false,
		interval = setInterval(function() {
			if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
				// If not time-out yet and condition not yet fulfilled
				condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
			}
			else {
				if (!condition) {
					// If condition still not fulfilled (timeout but condition is 'false')
					console.log("'waitFor()' timeout/finished");
					for (var e = 0; e < email.length; e++) {
						MailNow(eType, eOutput, email[e]);
					}
					phantom.exit(1);
				}
				else {
					// Condition fulfilled (timeout and/or condition is 'true')
					console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
					typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
					clearInterval(interval); //< Stop this interval
				}
			}
		}, 250); //< repeat check every 250ms
	};
	var render = function (type, output, callback) {
		address = dir+'report.php?&type='+type+'&query=summary&start='+start+'&end='+end;
		page.viewportSize = {
			width: 1056,
			height: 600
		};

		if (pizza === 1) {
			hHead = {
				height: "0.5cm",
				contents: phantom.callback(function(pageNum, numPages) {
				return "<div style='background:#D0D3DB; width:110%; padding-right:30px;margin-left:-30px'><p style='font-size:15px;text-align: center;letter-spacing:0.5px;margin-bottom:15px;'>This is currently a trial version of rapidPHIRE</p></div>";
				})
			};
		}
		page.paperSize = {
			format: 'A4',
			margin: '0.4cm',
			header: hHead,
			footer: {
				height: "0.5cm",
				contents: phantom.callback(function(pageNum, numPages) {
					if (pageNum === 0) {
						return "";
					}
					return "<p style='font-size:9px;letter-spacing:0.5px;'>© 2014 Phirelight Security Solutions <span style='float:right;margin-left:-10px'>" + pageNum + " / " + numPages + "</span></p style='font-size:10px'>";
				})
			}
		};
		page.open(address, function (status) {
			// Check for page load success
			if (status !== "success") {
				console.log("Unable to access network");
			}
			else {
				waitFor(
					function() {
						// Check in the page if a specific element is now visible
						return page.evaluate(function() {
							return $("svg").is(":visible");
						});
					},
					function() {
						page.render(output, { format: "pdf" });
						callback(true);
					}
				);
			}
		});
	};
	var next_page = function() {
		if(!output) {
			page.close();
		}
		else {
			init();
		}
	};
	var init = function() {
		render(type[0], output[0], function(ret) {
			if (ret === true) {
				console.log(type[0]+' processing...');
				output.shift();
				type.shift();
				next_page();
			}
		});
	};
	var MailNow = function(type, output, email) {
		console.log('Loading mailer');
		console.log(email);
		//var page = require('webpage').create(); //dont need to define page again here
		var url = dir+'inc/report/mailer.php?&email='+email+'&report_type='+type+'&output='+output+'&timespan='+timespan+'&client='+client;
		page.open(url, function (status) {
			phantom.exit();
		});
	};
	init();
}

// phantomjs generate.js http://localhost/rapidPHIRE_dev/ "ioc_hits_report,X,XYZ" "snap.pdf,XX.pdf,XYZ.pdf" andrewdillion6@gmail.com 1390487340 1391005740 "7 days" "Oshawa Clinic"
