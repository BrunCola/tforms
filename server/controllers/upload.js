'use strict';

var fs = require('fs'),
	config = require('../config/config'),
	query = require('./constructors/query');

module.exports = function(pool) {
	return {
		render: function(req, res) {
			// if (config.localUploads.enabled === true) {
				var createDirNeeded = false;

				console.log(req.body);

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
					if(req.body.imageType === 'map') { //if this is a floor plan image
						var newName = "floor_plan." + nameSplit[1];
					} else if (req.body.imageType === 'user') { //if this is a user image
						//rename to <username>_<zone>.<extension>
						var newName = req.body.lan_user + "_" + req.body.lan_zone + "." + nameSplit[1];
					} else { //neither floor plan, nor user image, don't rename (keep randomly generated name)
						var newName = req.files[i].name;
					}
					
					req.files[i].name = newName;

					//read in the uploaded file
					fs.readFile(req.files[i].path, function (err, data) {

						var newPath = dirPath + req.files[i].name;

						//create the directory if it does not already exist
						if(createDirNeeded) {
							//using the synchronous call so that no race conditions happen between 
							//the directory being created and the file being written.
							fs.mkdirSync(dirPath); 
						}

						//write the file to the directory and the path to the DB, send back status code
						fs.writeFile(newPath, data, function (err) {
							//Upload floor plan name and path to DB
							var database = req.session.passport.user.database;
							if(req.body.imageType === 'map') {
								var insert_map_image = {
									query: "INSERT INTO `assets` (`type`, `file`, `asset_name`, `path`) VALUES ('map',?,?,?)",
									insert: [newName, req.session.passport.user.client + "/" + newName, newPath]
								}
								new query(insert_map_image, {database: database, pool: pool}, function(err,data){
									res.send(200);
								});
							} else if(req.body.imageType === 'user') {
								var update_user_image = {
									query: "INSERT INTO `assets` (`type`, `file`, `asset_name`, `lan_zone`, `lan_ip`, `lan_user`, `path`) VALUES ('user',?,?,?,?,?,?)",
									insert: [newName, req.session.passport.user.client + "/" + newName, req.body.lan_zone, req.body.lan_ip, req.body.lan_user, newPath]
								}
								new query(update_user_image, {database: database, pool: pool}, function(err,data){
									res.send(200);
								});
							} else {
								var insert_other_image = {
									query: "INSERT INTO `assets` (`type`, `file`, `asset_name`, `path`) VALUES ('other',?,?,?)",
									insert: [newName, req.session.passport.user.client + "/" + newName, newPath]
								}
								new query(insert_other_image, {database: database, pool: pool}, function(err,data){
									res.send(200);
								});
							}
						});
					});
				}
			// } else {
				// res.redirect('/');
			// }
		}

	}
};