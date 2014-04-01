'use strict';

var config = require('../../config/config');
exports.render = function(req, res, next) {
	// if (req.user) {
		var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
		var end = Math.round(new Date().getTime() / 1000);
		res.render('report', {
			user: req.user ? JSON.stringify(req.user) : 'null',
			start: start,
			end: end
		});
		//next();
	// } else {
	// 	res.redirect('/signin');
	// }
};
