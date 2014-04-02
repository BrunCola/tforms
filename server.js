'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    passport = require('passport');
    //logger = require('mean-logger');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initializing system variables
var config = require('./config/config'),
    mysql = require('mysql');

var pool = mysql.createPool(config.db, function(err) {
    if (err) {
        console.log('Error establishing database pool. '+err);
    } else {
        console.log('Connected to database!');
    }
});
// console.log(pool);
// Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

// Bootstrap passport config
require('./config/passport')(passport, pool);

var options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.crt')
    //requestCert: true
};

var app = express()
    , httpapp = express()
    , http = require('http').createServer(httpapp)
    , https = require('https')
    , server = https.createServer(options, app)
    , io = require('socket.io').listen(server);

// Express settings
require('./config/express')(app, passport, pool);
require('./config/socket')(app, passport, io, pool);

// Bootstrap routes
var routes_path = __dirname + '/app/routes';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath)(app, passport, pool, io);
            }
        // We skip the app/routes/middlewares directory as it is meant to be
        // used and shared by routes as further middlewares and is not a
        // route by itself
        } else if (stat.isDirectory() && file !== 'middlewares') {
            walk(newPath);
        }
    });
};
walk(routes_path);


// Start the app by listening on <port>
var SSLport = process.env.sslPORT || config.SSLport;
var HTTPport = process.env.httpPORT || config.HTTPport;
httpapp.get('*',function(req, res){
    res.redirect('https://localhost:'+SSLport+req.url)
})
server.listen(SSLport),
http.listen(HTTPport);
console.log('rapidPHIRE app started on port ' + SSLport);

// Initializing logger
// logger.init(app, passport, mongoose);

// Expose app
exports = module.exports = server;
