'use strict';
module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();

    // Home routes 
    var client = require('../../controllers/client/client')(pool, version);
    
    app.route('/api/client/client/getClientInfo').get(auth.permission, client.getclientinfo);
    app.route('/api/client/client/editClientInfo').post(auth.permission, client.editClientInfo);

};
