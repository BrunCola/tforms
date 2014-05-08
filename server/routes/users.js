'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.route('/logout')
        .get(users.signout);
    app.route('/users/me')
        .get(users.me);

    // Setting up the users api
    app.route('/register')
        .post(users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // AngularJS route to check for authentication
    app.route('/loggedin')
        .get(function(req, res) {
            res.send(req.isAuthenticated() ? {
                email: req.user.email,
                checkpoint: req.user.checkpoint,
                _id: req.user._id,
                username: req.user.username,
                database: req.user.database,
                roles: (req.user ? req.user.roles : ['anonymous'])
            } : '0');
        });

    // Setting the local strategy route
    app.route('/login')
        .post(passport.authenticate('local', {
            failureFlash: true
        }), function (req,res) {
            res.send({
                email: req.user.email,
                checkpoint: req.user.checkpoint,
                _id: req.user._id,
                username: req.user.username,
                database: req.user.database,
                roles: (req.user ? req.user.roles : ['anonymous'])
            });
        });

};
