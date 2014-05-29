'use strict';

module.exports = function(app, passport, version) {

    // Home route
    var index = require('../controllers/index')(version);

    app.route('/')
        .get(index.render);

    app.route('/public/uploads')
        .post(index.upload);

};
