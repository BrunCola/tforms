'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.route('/logout')
        .get(users.signout);
    app.route('/users/me')
        .get(users.me);

    // Setting up the users api
    // app.route('/register')
    //     .post(users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // AngularJS route to check for authentication
    app.route('/loggedin')
        .get(function(req, res) {
            res.send(req.isAuthenticated() ? {
                email: req.session.passport.user.email,
                checkpoint: req.session.passport.user.checkpoint,
                _id: req.session.passport.user._id,
                username: req.session.passport.user.username,
                database: req.session.passport.user.database,
                roles: (req.session.passport.user ? req.session.passport.user.roles : ['anonymous'])
            } : '0');
        });

    // Setting the local strategy route
    app.route('/login')
        .post(passport.authenticate('local', {
            failureFlash: true
        }), function (req,res) {
            res.send({
                email: req.session.passport.user.email,
                checkpoint: req.session.passport.user.checkpoint,
                _id: req.session.passport.user._id,
                username: req.session.passport.user.username,
                database: req.session.passport.user.database,
                roles: (req.session.passport.user ? req.session.passport.user.roles : ['anonymous'])
            });
        });

    // app.route('/public')
    //     .post(function (req,res) {
    //         var boundaryKey = Math.random().toString(16); // random string
    //         request.setHeader('Content-Type', 'multipart/form-data; boundary="'+boundaryKey+'"');
    //         // the header for the one and only part (need to use CRLF here)
    //         request.write( 
    //         '--' + boundaryKey + '\r\n'
    //         // use your file's mime type here, if known
    //         + 'Content-Type: application/octet-stream\r\n'
    //         // "name" is the name of the form field
    //         // "filename" is the name of the original file
    //         + 'Content-Disposition: form-data; name="my_file"; filename="my_file.bin"\r\n'
    //         + 'Content-Transfer-Encoding: binary\r\n\r\n'
    //         );
    //         fs.createReadStream('./my_file.bin', { bufferSize: 4 * 1024 })
    //             // set "end" to false in the options so .end() isnt called on the request
    //             .pipe(request, { end: false }) // maybe write directly to the socket here?
    //             .on('end', function() {
    //             // mark the end of the one and only part
    //             request.end('--' + boundaryKey + '--'); 
    //         });
    //         console.log(req.files)
    //         console.log(req.body)
    //         console.log(req.query)
    //     });

};
