'use strict';

var fs = require('fs'),
	config = require('../config/config');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			// if (config.localUploads.enabled === true) {
				console.log(req.body);
				console.log(req.body.files);
				console.log(req.files);
				for (var i in req.files) {
					console.log(req.files[i]);
					// req.files[i].name = "testName.JPG"; //TODO: get original extension, make name dynamic
					fs.readFile(req.files[i].path, function (err, data) {
						var newPath = config.localUploads.directory+req.files[i].name;
						fs.writeFile(newPath, data, function (err) {
							res.send('done');
						});
					});
				}
			// } else {
				// res.redirect('/');
			// }
		}

	}
};