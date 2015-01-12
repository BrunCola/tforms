'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // SSL
        // SSL SERVER
            var ssl_server = require('../../controllers/ssl/ssl_server')(pool);
            app.route('/api/ssl/ssl_server')
            .get(auth.permission, ssl_server.render);       
        // LOCAL SSL
            var ssl_local = require('../../controllers/ssl/ssl_local')(pool);
            app.route('/api/ssl/ssl_local')
            .get(auth.permission, ssl_local.render);
        // REMOTE SSL
            var ssl_remote = require('../../controllers/ssl/ssl_remote')(pool);
            app.route('/api/ssl/ssl_remote')
            .get(auth.permission, ssl_remote.render);
    
};
