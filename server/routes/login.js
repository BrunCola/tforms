'use strict';

module.exports = function (app, readPool, writePool) {
    // User routes use users controller
    var login = require('../controllers/login')(readPool, writePool);
    app.route('/login').post(login.login);
};
