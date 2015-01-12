'use strict';

module.exports = function(app, version, pool) {
	var index = require('../controllers/index')(version);
	app.route('/')
		.get(index.render);
};
