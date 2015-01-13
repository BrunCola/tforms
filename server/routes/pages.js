'use strict';

// Auth Check

module.exports = function(app, version, pool) {
    var auth = require('./middlewares/authorization')();
    // USERS
        // USER MANAGEMENT
            var create_user = require('../controllers/users/create_user')(pool);
            app.route('/api/users/create_user')
            .get(auth.permission, create_user.render)
            .post(auth.permission, create_user.insert); 
        // FIRST LOGIN
            var first_login = require('../controllers/users/first_login')(pool);
            app.route('/api/users/first_login')
            .get(auth.permission, first_login.render)
            .post(auth.permission, first_login.insert);
};
