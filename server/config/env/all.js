'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

// module.exports = {
// 	root: rootPath,
// 	port: process.env.PORT || 3000,
// 	hostname: process.env.HOST || process.env.HOSTNAME,
// 	db: process.env.MONGOHQ_URL,
// 	templateEngine: 'swig',

//     // The secret should be set to a non-guessable string that
//     // is used to compute a session hash
//     sessionSecret: 'MEAN',
//     // The name of the MongoDB collection to store sessions in
//     sessionCollection: 'sessions'
// };

// module.exports = {
// 	defaultDateRange: 1,
// 	root: rootPath,
// 	SSLport: process.env.sslPORT || 3000,
// 	HTTPport: process.env.httpPORT || 3001,
// 	db: {
// 		socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
// 		// I had to use a socket instead of a port because of the application I run my server in.
// 		// port: 3306,
// 		host: 'localhost',
// 		user: 'root',
// 		password: 'duffman',
// 		database: 'rp_users'
// 	},
// 	templateEngine: 'swig',
// 	// The secret should be set to a non-guessable string that
// 	// is used to compute a session hash
// 	sessionSecret: 'har4aC6Mix3Vot7',
// 	// The name of the MongoDB collection to store sessions in
// 	sessionCollection: 'sessions'
// };


module.exports = {
	defaultDateRange: 1,
	root: rootPath,
	port: process.env.sslPORT || 3000,
	SSLport: process.env.sslPORT || 3000,
	HTTPport: process.env.httpPORT || 3001,
	mailer: {
		user: "notice@rapidphire.com",
		pass: "r@p1dph1r3",
		host: "smtp.emailsrvr.com",
		port: 465,
		secure: true
	},
	reports: {
		active: false,
		schedule: '14 * * * *',
		url: 'https://localhost:3000'
	},
	db: {
		//socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
		// I had to use a socket instead of a port because of the application I run my server in.
		port: 3306,
		host: '192.168.0.28',
		user: 'andrew',
		password: 'BlowItOutTheWater',
		database: 'rp_users'
	},
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'har4aC6Mix3Vot7',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions'
};
