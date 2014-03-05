'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

// module.exports = {
// 	defaultDateRange: 1,
// 	root: rootPath,
// 	port: process.env.PORT || 3000,
// 	db: {
// 		socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
// 		// I had to use a socket instead of a port because of the application I run my server in.
// 		// port: 3306,
// 		host: 'localhost',
// 		user: 'root',
// 		password: 'duffman',
// 		database: 'rapidPHIRE'
// 	},
// 	templateEngine: 'swig',
// 	// The secret should be set to a non-guessable string that
// 	// is used to compute a session hash
// 	sessionSecret: 'MEAN',
// 	// The name of the MongoDB collection to store sessions in
// 	sessionCollection: 'sessions'
// };


module.exports = {
	defaultDateRange: 1,
	root: rootPath,
	port: process.env.PORT || 3000,
	db: {
		//socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
		// I had to use a socket instead of a port because of the application I run my server in.
		port: 3306,
		host: '192.168.0.133',
		user: 'rapidPHIRE',
		password: 'BlowItOutTheWater',
		database: 'rapidPHIRE'
	},
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions'
};
