'use strict';



module.exports = function(app, passport, version, io, pool) {
	var auth = require('./middlewares/authorization')();

	// Home route
	var index = require('../controllers/index')(version);
	var actions = require('../controllers/actions')(pool);
	var upload = require('../controllers/upload')(pool);

	app.route('/')
		.get(index.render);

	// ioc Actions
	app.route('/actions/archive')
		.post(auth.permission, actions.archive);

	app.route('/actions/restore')
		.post(auth.permission, actions.restore);

	app.route('/actions/clear')
		.post(auth.permission, actions.clear);

	app.route('/actions/update')
		.post(auth.permission, actions.update);

	app.route('/actions/local_cc')
		.post(auth.permission, actions.local_cc);

	//other actions

	app.route('/actions/add_user_to_map')
		.post(auth.permission, actions.add_user_to_map);
		
	app.route('/actions/change_custom_user')
		.post(auth.permission, actions.change_custom_user);

	//upload file
	app.route('/upload/render')
		.post(auth.permission, upload.render);

};
