'use strict';

exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.send(401, 'User is not authorized');
	}
	next();
}

exports.requiresAdmin = function(req, res, next) {
	if (!req.isAuthenticated() || !req.user.hasRole('admin')) {
		return res.send(401, 'User is not authorized');
	}
	next();
}