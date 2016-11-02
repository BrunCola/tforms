'use strict';

module.exports = function (app, readPool, writePool) {
    // User routes use users controller
    var client_info = require('../../controllers/pages/client_info')(readPool, writePool);
    app.route('/api/client_info').get(client_info.client_info);
    app.route('/api/save_session').post(client_info.save_session);
};
