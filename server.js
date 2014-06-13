'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	passport = require('passport'),
	config = require('./server/config/config'),
	mysql = require('mysql'),
    express = require('express'),
    pjson = require('./package.json'),
    appPath = process.cwd();

    var mean = require('./server/config/meanio');
    mean.app('', {});
    // logger = require('mean-logger');


// Initializing system variables
var db = mysql.createPool(config.db, function(err) {
	if (err) {
		console.log('Error establishing database pool. '+err);
	} else {
		console.log('Connected to database!');
	}
});
// var db = mongoose.connect(config.db);
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
var options = {
	key: fs.readFileSync(config.sslAssets.key),
	cert: fs.readFileSync(config.sslAssets.cert)
	//requestCert: true
};

// Bootstrap Models, Dependencies, Routes and the app as an express app
var d = new Date();
var n = d.getFullYear();
var version = n +' Phirelight Security Solutions - rapidPHIRE version: '+pjson.version;

// Bootstrap passport config
require(appPath + '/server/config/passport')(passport, db);

// Express settings
var app = express();

var httpapp = express(),

http = require('http').createServer(httpapp),
https = require('https'),
server = https.createServer(options, app),
io = require('socket.io').listen(server);

require(appPath + '/server/config/express')(app, passport, db, version, io);

require('./server/config/socket.js')(app, passport, io, db);
require('./server/config/report.js')(db);

var SSLport = process.env.sslPORT || config.SSLport;
var HTTPport = process.env.httpPORT || config.HTTPport;
httpapp.get('*',function(req, res){
	if (config.httpRedirect.portEnabled) {
		res.redirect(config.httpRedirect.link+':'+SSLport+req.url);
	} else {
		res.redirect(config.httpRedirect.link+req.url);
	}
});
server.listen(SSLport);
http.listen(HTTPport);

console.log('rapidPHIRE has started on port '+SSLport);

// Initializing logger
// logger.init(app, passport, mongoose);

// Expose app
exports = module.exports = app;
