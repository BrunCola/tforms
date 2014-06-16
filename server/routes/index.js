'use strict';

module.exports = function(app, passport, version) {

	// Home route
	var index = require('../controllers/index')(version);
	// var actions = require('../controllers/actions')(version);

	app.route('/')
		.get(index.render);

	
	// app.param('slug', '/^[-w]+$/');

	app.param('slug', function(req, res, next, slug){
	  return 'pppppoooooo' // get thing from database by slug
	});

	app.route('/test/:slug')
		.get(function(req, res){
			var test = req.params.slug;
			console.log(test)
		  //render view
		});

};
