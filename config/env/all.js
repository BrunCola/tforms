'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var defaultDateRange = 1;
var start = Math.round(new Date().getTime() / 1000)-((3600*24)*defaultDateRange);
var end = Math.round(new Date().getTime() / 1000);

module.exports = {
	defaultDateRange: 1,
	start: start,
	end: end,
	root: rootPath,
	port: process.env.PORT || 3000,
	db: {
		socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
		// I had to use a socket instead of a port because of the application I run my server in.
		//port: 9999,
		host: 'localhost',
		user: 'root',
		password: 'duffman',
		database: 'rapidPHIRE'
	},
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions'
};

// module.exports = {
// 	start: start,
// 	end: end,
// 	root: rootPath,
// 	port: process.env.PORT || 3000,
// 	db: {
// 		//socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
// 		// I had to use a socket instead of a port because of the application I run my server in.
// 		port: 3306,
// 		host: '192.168.0.133',
// 		user: 'rapidPHIRE',
// 		password: 'BlowItOutTheWater',
// 		database: 'rapidPHIRE'
// 	},
// 	templateEngine: 'swig',
// 	// The secret should be set to a non-guessable string that
// 	// is used to compute a session hash
// 	sessionSecret: 'MEAN',
// 	// The name of the MongoDB collection to store sessions in
// 	sessionCollection: 'sessions'
// };
