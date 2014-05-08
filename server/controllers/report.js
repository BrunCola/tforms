'use strict';

var mean = require('../config/meanio'),
	config = require('../config/config');

module.exports = function(version) {
	return {
		render: function(req, res) {
			var modules = [];

			// Preparing angular modules list with dependencies
			for (var name in mean.modules) {
				modules.push({
					name: name,
					module: 'mean.' + name,
					angularDependencies: mean.modules[name].angularDependencies
				});
			}

			// Send some basic starting info to the view
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			res.render('report', {
				user: req.user ? JSON.stringify({
					email: req.user.email,
					checkpoint: req.user.checkpoint,
					_id: req.user._id,
					username: req.user.username,
					database: req.user.database,
					roles: (req.user ? req.user.roles : ['anonymous'])
				}) : 'null',
				modules: JSON.stringify(modules),
				version: version,
				start: start,
				end: end
			});
		},
	};
};