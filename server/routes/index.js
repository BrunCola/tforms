'use strict';

module.exports = function(app, passport, version) {

	// Home route
	var index = require('../controllers/index')(version);
	// var actions = require('../controllers/actions')(version);

	app.route('/')
		.get(index.render);
};
