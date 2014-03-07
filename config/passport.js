'use strict';
var LocalStrategy = require('passport-local').Strategy,
crypto = require('crypto');

module.exports = function(passport, connection) {

	passport.use(new LocalStrategy(
		function(username, password, done) {
			 var hash = crypto.createHash('md5').update(password).digest('hex');
			return check_auth_user(username,hash,done);
		}
	));
	function check_auth_user(username,password,done,public_id){
		var sql="SELECT * FROM user WHERE username = '"+ username +"' and password = '"+ password +"' limit 1";
		console.log(sql);
		connection.query(sql,
			function (err,results) {

				if (err) throw err;

				if(results.length > 0){

					var res=results[0];
					//serialize the query result save whole data as session in req.user[] array
					passport.serializeUser(function(res, done) {
						done(null,res);
					});

					passport.deserializeUser(function(id, done) {
						done(null,res);

					});
					//console.log(JSON.stringify(results));
					//console.log(results[0]['member_id']);
					return done(null, res);
				}else{
					return done(null, false);

				}

			});
	}
};