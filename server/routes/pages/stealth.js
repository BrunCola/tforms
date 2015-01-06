'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // STEALTH
        // STEALTH DEPLOY CONFIG
            var stealth_deploy_config = require('../../controllers/stealth/stealth_deploy_config')(pool); 
            app.route('/api/stealth/stealth_deploy_config')
            .get(auth.permission, stealth_deploy_config.render)
            .post(auth.permission, stealth_deploy_config.set_info);
        // STEALTH OP VIEW
            var stealth_op_view = require('../../controllers/stealth/stealth_op_view')(pool); 
            app.route('/api/stealth/stealth_op_view')
            .get(auth.permission, stealth_op_view.render)
            .post(auth.permission, stealth_op_view.set_info);
        // STEALTH CONN
            var stealth_conn = require('../../controllers/stealth/stealth_conn')(pool);
            app.route('/api/stealth/stealth_conn')
            .get(auth.permission, stealth_conn.render);
            // STEALTH CONN BY USER
                var stealth_conn_by_user = require('../../controllers/stealth/stealth_conn_by_user')(pool);
                app.route('/api/stealth/stealth_conn_by_user')
                .get(auth.permission, stealth_conn_by_user.render);
                // STEALTH CONN BY USER AND REMOTE
                    var stealth_conn_by_userANDremote = require('../../controllers/stealth/stealth_conn_by_userANDremote')(pool);
                    app.route('/api/stealth/stealth_conn_by_userANDremote')
                    .get(auth.permission, stealth_conn_by_userANDremote.render);
        // STEALTH EVENTS
            var stealth_events = require('../../controllers/stealth/stealth_events')(pool); 
            app.route('/api/stealth/stealth_events')
            .get(auth.permission, stealth_events.render);
            // STEALTH EVENTS USER
                var stealth_events_by_type_and_user = require('../../controllers/stealth/stealth_events_by_type_and_user')(pool);
                app.route('/api/stealth/stealth_events_by_type_and_user')
                .get(auth.permission, stealth_events_by_type_and_user.render);
                // STEALTH EVENTS USER DRILL
                    var stealth_events_full = require('../../controllers/stealth/stealth_events_full')(pool);
                    app.route('/api/stealth/stealth_events_full')
                    .get(auth.permission, stealth_events_full.render);
        // STEALTH QUARANTINE
            var stealth_quarantine = require('../../controllers/stealth/stealth_quarantine')(pool); 
            app.route('/api/stealth/stealth_quarantine')
            .get(auth.permission, stealth_quarantine.render);
    
};
