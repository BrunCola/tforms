'use strict';

module.exports = function(app, passport, version) {

    // Home route
    var report = require('../controllers/report')(version);
    app.route('/report')
        .get(report.render);

};
