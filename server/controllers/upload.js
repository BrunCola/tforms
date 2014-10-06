'use strict';

var fs = require('fs'),
	config = require('../config/config'),
	query = require('./constructors/query');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			// if (config.localUploads.enabled === true) {
				var createDirNeeded = false;

				//set the directory path for the final upload to public/uploads/<client>/
				var dirPath = config.localUploads.directory + req.session.passport.user.client + "/";
				for (var i in req.files) {
					//check if the directory /public/uploads_<client>/ exists yet. 
					fs.stat(dirPath, function(err, stats) {
						if(err) {
							createDirNeeded = true;
						} else {
							if(!stats.isDirectory()) {
								createDirNeeded = true;
							}
						}						
					});

					//get the extension of the uploaded file
					var nameSplit = req.files[i].name.split('.');
					//change the name of the uploaded file to floor_plan, keep the extension
					var newName = "floor_plan." + nameSplit[1];
					req.files[i].name = newName;

					//read in the uploaded file
					fs.readFile(req.files[i].path, function (err, data) {

						var newPath = dirPath + req.files[i].name;

						//create the directory if it does not already exist
						if(createDirNeeded) {
							//I'm using the synchronous call so that no race conditions happen between 
							//the directory being created and the file being written.
							fs.mkdirSync(dirPath); 
						}

						//write the file to the directory and the path to the DB, send back status code
						fs.writeFile(newPath, data, function (err) {
							//Upload floor plan name and path to DB
							var database = req.session.passport.user.database;
							var insert_map_image = {
								query: "INSERT INTO `assets` (`type`, `file`, `asset_name`, `path`) VALUES ('map',?,?,?)",
								insert: [newName, req.session.passport.user.client + "/" + newName, newPath]
							}
							new query(insert_map_image, {database: database, pool: pool}, function(err,data){
								res.send(200);
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