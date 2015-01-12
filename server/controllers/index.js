'use strict';

var mean = require('../config/meanio'),
    config = require('../config/config');

module.exports = function (version) {
    return {
        render: function (req, res) {
            // Send some basic starting info to the view
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
    
            res.render('index', {
                version: version,
                start: start,
                end: end,
                report: 'null'
            });
        }
    };
};
