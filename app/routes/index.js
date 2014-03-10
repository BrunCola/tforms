'use strict';
	// var index = require('../controllers/index'),
	// 	report = require('../controllers/report');

var config = require('../../config/config');
module.exports = function(app, passport) {
	app.get('/', function(req, res, next) {
		console.log(req.session.passport.user);
		if (req.session.passport.user) {
			var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
			var end = Math.round(new Date().getTime() / 1000);
			res.render('index', {
				user: req.session.passport.user ? JSON.stringify(req.session.passport.user) : 'null',
				start: start,
				end: end
			});
		} else {
			res.redirect('/signin');
		}
	});
};
