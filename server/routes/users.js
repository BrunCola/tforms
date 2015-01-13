'use strict';

// User routes use users controller
var users = require('../controllers/users'),
    auth = require('./middlewares/authorization')();

module.exports = function (app, version, pool) {

    // User routes use users controller
    var users = require('../controllers/users')(pool);
    
    app.route('/api/loggedin')
        .get(users.loggedin)
        
    // Setting the local strategy route
    app.route('/auth')
        .post(users.login);

    // 2auth verify route
    app.route('/2factor/verify')
        .post(users.twoStep);

    app.route('/api/users/updatepass')
        .post(auth.permission, users.updatePassword);

    app.route('/api/users/updateemail')
        .post(auth.permission, users.updateEmail);

    // enable 2 factor
    app.route('/api/users/enable2factor')
        .post(auth.permission, users.enableTwoFactor);

    // disable 2 factor
    app.route('/api/users/disable2factor')
        .post(auth.permission, users.disableTwoFactor);


};
