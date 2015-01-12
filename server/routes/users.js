'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function (app, version, pool) {

	// User routes use users controller
	var users = require('../controllers/users')(pool);
	
	app.route('/api/loggedin')
		.get(users.loggedin)
		
	// Setting the local strategy route
	app.route('/auth')
		.post(users.login);

	app.route('/2factor/verify')
		.post(users.twoStep);

};
