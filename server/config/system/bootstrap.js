'use strict';

var express = require('express'),
	fs = require('fs'),
	appPath = process.cwd(),
	pjson = require('../../../package.json');

var mean = require('../meanio');
mean.app('Mean Demo App', {});

module.exports = function(passport, db) {

	var d = new Date();
	var n = d.getFullYear();
	var version = n +' Phirelight Security Solutions - rapidPHIRE version: '+pjson.version;

	// Bootstrap passport config
	require(appPath + '/server/config/passport')(passport, db);

	function bootstrapDependencies() {
		// Register passport dependency
		mean.register('passport', function() {
			return passport;
		});

		// Register auth dependency
		mean.register('auth', function() {
			return require(appPath + '/server/routes/middlewares/authorization');
		});

		// Register database dependency
		mean.register('database', {
			connection: db
		});

		// Register app dependency
		mean.register('app', function() {
			return app;
		});
	}

	bootstrapDependencies();

	// Express settings
	var app = express();
	require(appPath + '/server/config/express')(app, passport, db, version);

	return app;
};
