'use strict';

var mean = require('../config/meanio'),
    config = require('../config/config');

module.exports = function (version) {
    return {
        render: function (req, res) {
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
			
			res.render('index', {
				user: req.session.passport.user ? JSON.stringify({
					email: req.session.passport.user.email,
					checkpoint: req.session.passport.user.checkpoint,
					_id: req.session.passport.user._id,
					username: req.session.passport.user.username,
					id: req.session.passport.user.id,
					database: req.session.passport.user.database,
					uploads: config.localUploads.enabled,
					level: req.session.passport.user.level,
					// roles: (req.session.passport.user ? req.session.passport.user.roles : ['anonymous'])
				}) : 'null',
				modules: JSON.stringify(modules),
				version: version,
				start: start,
				end: end,
				report: 'null'
			});

			if(req.session.passport.user) {
				console.log("Email: " + req.session.passport.user.email);
				console.log("Username: " + req.session.passport.user.username);
				console.log("Client: " + req.session.passport.user.client);
			}
		}
	};
};
