'use strict';

module.exports = function (app, readPool, writePool) {
    // User routes use users controller
    var client_list = require('../../controllers/pages/client_list')(readPool, writePool);
    app.route('/api/client_list').get(client_list.client_list);
};