'use strict';

var iochits = require('../controllers/iochits'),
	ioc_drill = require('../controllers/ioc_drill'),
	authorization = require('./middlewares/authorization.js');

module.exports = function(app) {
    // Home route
    //app.get('/iochits', authorization.requiresLogin, iochits.render);
    app.get('/iochits', iochits.render);
    app.get('/ioc_drill', ioc_drill.render);
};