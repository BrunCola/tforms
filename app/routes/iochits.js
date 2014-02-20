'use strict';

module.exports = function(app) {
    // Home route
    var iochits = require('../controllers/iochits');
    app.get('/iochits', iochits.render);
};