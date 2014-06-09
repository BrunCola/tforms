'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    passport = require('passport'),
    config = require('./server/config/config'),
	mysql = require('mysql'),
    express = require('express');
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
var app = require('./server/config/system/bootstrap')(passport, db, options);

var httpapp = express(),
    http = require('http').createServer(httpapp),
    https = require('https'),
    server = https.createServer(options, app),
    io = require('socket.io').listen(server);

require('./server/config/socket.js')(app, passport, io);
require('./server/config/report.js')(db);

var SSLport = process.env.sslPORT || config.SSLport;
var HTTPport = process.env.httpPORT || config.HTTPport;
httpapp.get('*',function(req, res){
    if (config.httpRedirect.link && config.portEnabled) {
        res.redirect(config.httpRedirect.link+':'+SSLport+req.url);
    } else {
        res.redirect(config.httpRedirect.link+'/'+req.url);
    }
});
server.listen(SSLport);
http.listen(HTTPport);

console.log('rapidPHIRE has started');

// Initializing logger
// logger.init(app, passport, mongoose);

// Expose app
exports = module.exports = app;