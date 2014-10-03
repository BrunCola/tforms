'use strict';

var fs = require('fs'),
	config = require('../config/config'),
	query = require('./constructors/query');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			// if (config.localUploads.enabled === true) {
				console.log(req.body.files);
				console.log(req.files);
				for (var i in req.files) {
					console.log(req.files[i]);
					var nameSplit = req.files[i].name.split('.');
					var newName = "floor_plan." + nameSplit[1];
					req.files[i].name = newName;
					fs.readFile(req.files[i].path, function (err, data) {
						var newPath = config.localUploads.directory+req.files[i].name;
						fs.writeFile(newPath, data, function (err) {
							//Upload floor plan name and path to DB
							var database = req.session.passport.user.database;
							var insert_map_image = {
								query: "INSERT INTO `assets` (`type`, `asset_name`, `path`) VALUES ('map',?,?)",
								insert: [newName, newPath]
							}
							new query(insert_map_image, {database: database, pool: pool}, function(err,data){
								if (err) {
									res.send(500);
								} else {
									res.send(200);
								}
							});

							// res.send('done');
						});
					});
				}
			// } else {
				// res.redirect('/');
			// }
		}

	}
};