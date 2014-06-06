'use strict';

exports.render = function(req, res) {
	console.log('got post request')
	// if (req.url === '/upload' && req.method === 'POST') {
	// parse a file upload
		console.log(req.files)
	// 	return;
	// }
};