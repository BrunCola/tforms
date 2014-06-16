'use strict';

var fs = require('fs'),
	config = require('../config/config');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			if (config.localUploads.enabled === true) {
				for (var i in req.files) {
					console.log(req.files[i]);
					fs.readFile(req.files[i].path, function (err, data) {
						var newPath = config.localUploads.directory+req.files[i].name;
						fs.writeFile(newPath, data, function (err) {
							res.send('done');
						});
					});
				}
			} else {
				res.redirect('/');
			}
		}

	}
};