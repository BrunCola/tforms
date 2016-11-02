'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    config = require('./config/config'),
    mysql = require('mysql'),
    express = require('express'),
    pjson = require('./package.json'),
    path = require('path'),
    appPath = process.cwd();
 // console.log(process);

// console log errors and dont kill node
process.on('uncaughtException', function (err) {
   console.error(err);
   console.log("Node NOT Exiting...");
});

// Initializing system variables
var readPool = mysql.createPool(config.readDB, function(err) {
    if (err) {
        console.log('Error establishing database pool with read pool. '+err);
    }
});
var writePool = mysql.createPool(config.writeDB, function(err) {
    if (err) {
        console.log('Error establishing database pool with write pool. '+err);
    }
});

var options = {
    key: fs.readFileSync(config.sslAssets.key),
    cert: fs.readFileSync(config.sslAssets.cert)
    //requestCert: true
};

var d = new Date();
var n = d.getFullYear();
var l1 = n + ' tForms - Treatment form for message therapy';
var l2 = 'tForms version: ';
var l3 = pjson.version;
var version = JSON.stringify({
    l1: l1,
    l2: l2,
    l3: l3
});

// Express settings
var app = express();

var server = require('https').createServer(options, app);

// Bootstrap Models, Dependencies, Routes and the app as an express app
require(appPath + '/config/express')(app, readPool, writePool);

var port = process.env.sslPORT || config.port;
server.listen(port);

console.log('tForms has started on port '+port);

// Expose app
exports = module.exports = app;