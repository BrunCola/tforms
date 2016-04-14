'use strict';

// Auth Check

module.exports = function(app, version, pool) {
    var auth = require('./middlewares/authorization')();

    // HOME PAGE
        // var home = require('../controllers/home')(pool);
        // app.route('/api/home/createClient')
        // .post(auth.permission, home.createClient);

        // var create = require('../controllers/forms/create')(pool);
        // app.route('/api/forms/create')
        //     .get(create.render)
        //     .post(create.provide);

        // var edit = require('../controllers/forms/edit')(pool);
        // app.route('/api/forms/edit')
        //     .post(edit.provide);

        // app.route('/api/forms/addLogin')
        //     .post(edit.newLogin);

        // app.route('/api/forms/changePassword')
        //     .post(edit.updatePassword);

};
 