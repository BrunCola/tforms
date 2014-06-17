'use strict';

var LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt');

module.exports = function(passport, connection) {
	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function(email, password, done) {
			//to compare password that user supplies in the future
			var hash = "SELECT * FROM user WHERE email = '"+ email +"' limit 1";
			connection.query(hash, function (err, results) {
				if (err) throw err;
				if(results.length > 0){
					var res = results[0];
					bcrypt.compare(password, res.password, function(err, doesMatch){
						if (doesMatch){
							passport.serializeUser(function(res, done) {
								done(null, res);
							});
							passport.deserializeUser(function(id, done) {
								done(null, res);
							});
							return done(null, res);
						}else{
							return done(null, false);
						}
					});
				} else {
					return done(null, false);
				}
			});
		}
	));
};

// bcrypt.hash('t4JN2Pt17bP28E9q', 10, function( err, bcryptedPassword) {
// 	 	console.log(bcryptedPassword);
// 	 })
