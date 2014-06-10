'use strict';

var fs = require('fs');

exports.render = function(req, res) {
	for (var i in req.files) {
		console.log(req.files[i]);
		fs.readFile(req.files[i].path, function (err, data) {
			var newPath = "./public/uploads/"+req.files[i].name;
			fs.writeFile(newPath, data, function (err) {
				res.redirect("/");
			});
		});
	}
};