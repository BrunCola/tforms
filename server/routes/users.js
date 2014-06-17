'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function (app, passport) {

    app.route('/logout')
        .get(users.signout);

    // AngularJS route to check for authentication
    app.route('/loggedin')
        .get(function (req, res) {
            res.send(req.isAuthenticated() ? {
                email: req.session.passport.user.email,
                checkpoint: req.session.passport.user.checkpoint,
                _id: req.session.passport.user._id,
                username: req.session.passport.user.username,
                level: req.session.passport.user.level
            } : '0');
        });

    // Setting the local strategy route
    app.route('/login')
        .post(passport.authenticate('local', {
            failureFlash: true
        }), function (req, res) {
            res.send({
                email: req.session.passport.user.email,
                checkpoint: req.session.passport.user.checkpoint,
                _id: req.session.passport.user._id,
                username: req.session.passport.user.username,
                level: req.session.passport.user.level
            });
        });
};
