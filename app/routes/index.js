'use strict';
	var index = require('../controllers/index'),
		report = require('../controllers/report');

module.exports = function(app, passport) {
    app.get('/', index.render);
    app.get('/report', report.render);
};
