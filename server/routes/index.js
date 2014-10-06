'use strict';

var authorization = require('./middlewares/authorization');

module.exports = function(app, passport, version, io, pool) {

	// Home route
	var index = require('../controllers/index')(version);
	var actions = require('../controllers/actions')(pool);
	var upload = require('../controllers/upload')(pool);

	app.route('/')
		.get(index.render);

	// ioc Actions
	app.route('/actions/archive')
		.post(authorization.requiresLogin, actions.archive);

	app.route('/actions/restore')
		.post(authorization.requiresLogin, actions.restore);

	app.route('/actions/clear')
		.post(authorization.requiresLogin, actions.clear);

	app.route('/actions/update')
		.post(authorization.requiresLogin, actions.update);

	app.route('/actions/local_cc')
		.post(authorization.requiresLogin, actions.local_cc);

	//other actions
	app.route('/actions/add_user_image')
		.post(authorization.requiresLogin, actions.add_user_image);

	app.route('/actions/add_user_to_map')
		.post(authorization.requiresLogin, actions.add_user_to_map);

	//upload file
	app.route('/upload/render')
		.post(authorization.requiresLogin, upload.render);

};
