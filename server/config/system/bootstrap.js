'use strict';

var express = require('express'),
    fs = require('fs'),
    appPath = process.cwd();

var mean = require('../meanio');
mean.app('Mean Demo App', {});

module.exports = function(passport, db) {

    // Get version number
    function get_line(filename, line_no, callback) {
        var data = fs.readFileSync(filename, 'utf8');
        var lines = data.split("\n");
        if(+line_no > lines.length){
          throw new Error('File end reached without finding line');
        }
        callback(null, lines[+line_no]);
    }
    var versionNum;
    get_line('VERSION', 0, function(err, line){
        versionNum = line.toString();
    });
    var d = new Date();
    var n = d.getFullYear();
    var version = n +' Phirelight Security Solutions - rapidPHIRE version: '+versionNum;

    function bootstrapModels() {
        // Bootstrap models
        require('../util').walk(appPath + '/server/models', null, function(path) {
            require(path);
        });
    }

    bootstrapModels();

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
