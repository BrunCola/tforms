'use strict';


var config = require('../../config/config');

exports.render = function(req, res) {
	// if (req.user) {
		res.render('index', {
			user: req.user ? JSON.stringify(req.user) : 'null',
			start: config.start,
			end: config.end
		});
	// } else {
	// 	res.redirect('/signin');
	// }
};
