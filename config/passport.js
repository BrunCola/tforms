'use strict';
var LocalStrategy = require('passport-local').Strategy,
crypto = require('crypto');

module.exports = function(passport, connection) {

//    app.get('/home', function(reg, res){
//     //check user session value, is logged in 
//     if(req.user)
//         res.render('dash',{
//             username: req.user['member_id']//req.user array contains serializeUser data
//         });
//     else
//         res.render('index');

// });

// app.get('/logout', function(req, res){

//     req.logout();
//     res.redirect('/home');
// });

// //login form submit as post

// app.post('/login',
//     passport.authenticate('local', {
//         successRedirect: '/dashboard',
//         failureRedirect: '/home'
//     })
//     );
// //to project dashboard
// app.get('/dash',routes.dash);
// //to project dashboard
// app.get('/signup',routes.signup);
// //to project dashboard

// app.get('*', routes.index);

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
                        done(null, res.id);
                    });
                    passport.deserializeUser(function(id, done) {
                        done(null, res);
                    });
                    console.log(JSON.stringify(results));
                    console.log(res.id);
                    //console.log(results[0]['member_id']);
                    connection.destroy();
                    return done(null, res);
                }else{
                    connection.destroy();
                    return done(null, false);
                }
            });
    }

};