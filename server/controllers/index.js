'use strict';

var mean = require('../config/meanio'),
    config = require('../config/config');

module.exports = function (version) {
    return {
        render: function (req, res) {            
            res.render('index', {
                version: version
            });
        }
    };
};
