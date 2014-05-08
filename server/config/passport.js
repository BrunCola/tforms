'use strict';

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, connection) {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            var crypto = require('crypto');
            var hash = crypto.createHash('md5').update(password).digest('hex');
            return check_auth_user(email,hash,done);
        }
    ));
    function check_auth_user(email,password,done,public_id){
        var sql="SELECT * FROM user WHERE email = '"+ email +"' and password = '"+ password +"' limit 1";
        console.log(sql);
        connection.query(sql,
            function (err,results) {
                console.log(results)

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
                    return done(null, res);
                }else{
                    return done(null, false);

                }

            });
    }
};