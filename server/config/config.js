'use strict';

// Utilize Lo-Dash utility library
var _ = require('lodash'),
    fs = require('fs'),
    db_info = require('./env/db_info');

// Load configurations
// Set the node environment variable if not set before
process.env.NODE_ENV = db_info.environment;

// Extend the base configuration in db_info.js with environment
// specific configuration
module.exports = _.extend(
    require('./env/db_info'),
    require('./env/' + process.env.NODE_ENV) || {}
);