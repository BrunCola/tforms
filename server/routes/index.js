'use strict';
module.exports = function(app, version, pool) {
	var auth = require('./middlewares/authorization')();

	// Home route
	var index = require('../controllers/index')(version);

	app.route('/').get(index.render);

};
