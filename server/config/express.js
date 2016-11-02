'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressJwt = require('express-jwt'),
    config = require('./config'),
    expressValidator = require('express-validator'),
    // path = require('path'),
    appPath = process.cwd(),
    util = require('./util');

module.exports = function (app, version, pool) {
    // app.param('end', /^[0-9]{1,10}$/);
    app.set('showStackError', true);

    // restrict the origin of requests to our portal
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", config.xhttpAccess.origin);
        res.header('Access-Control-Allow-Methods', config.xhttpAccess.methods );
        res.header("Access-Control-Allow-Headers", config.xhttpAccess.headers);
        next();
    });

    // cache=memory or swig dies in NODE_ENV=production
    app.locals.cache = 'memory';

    // Should be placed before express.static
    // To ensure that all assets and data are compressed (utilize bandwidth)
    app.use(compression({
        // Levels are specified in a range of 0 to 9, where-as 0 is
        // no compression and 9 is best compression, but slowest
        level: 9
    }));

    // Only use logger for development environment //NOW USING IN ALL ENVIRONMENTS
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }
    app.use('/api', expressJwt({secret: config.sessionSecret})); // token route for all pages

    // Request body parsing middleware should be above methodOverride
    app.use(expressValidator());
    app.use(bodyParser.json());
    app.use(methodOverride());

    util.walk(appPath + '/routes', 'middlewares', function (path) {
        require(path)(app, version, pool);
    });
};