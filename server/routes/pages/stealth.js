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
            // // CROSSFILTER
            app.route('/api/stealth/stealth_conn/crossfilter').get(auth.permission, stealth_conn.crossfilter);
            // TABLE
            app.route('/api/stealth/stealth_conn/table').get(auth.permission, stealth_conn.table);
            // STEALTH CONN BY USER
                var stealth_conn_by_user = require('../../controllers/stealth/stealth_conn_by_user')(pool);
                // TABLE
                app.route('/api/stealth/stealth_conn_by_user/table').get(auth.permission, stealth_conn_by_user.table);
                // STEALTH CONN BY USER AND REMOTE
                    var stealth_conn_by_userANDremote = require('../../controllers/stealth/stealth_conn_by_userANDremote')(pool);
                    // TABLE
                    app.route('/api/stealth/stealth_conn_by_userANDremote/table').get(auth.permission, stealth_conn_by_userANDremote.table);
        // STEALTH EVENTS
            var stealth_events = require('../../controllers/stealth/stealth_events')(pool); 
            // CROSSFILTER
            app.route('/api/stealth/stealth_events/crossfilter').get(auth.permission, stealth_events.crossfilter);
            // CROSSFILTER PIE
            app.route('/api/stealth/stealth_events/crossfilterpie').get(auth.permission, stealth_events.crossfilterpie);
            // TABLE
            app.route('/api/stealth/stealth_events/table').get(auth.permission, stealth_events.table);
            // STEALTH EVENTS USER
                var stealth_events_by_type_and_user = require('../../controllers/stealth/stealth_events_by_type_and_user')(pool);
                // TABLE
                app.route('/api/stealth/stealth_events_by_type_and_user/table').get(auth.permission, stealth_events_by_type_and_user.table);
                // STEALTH EVENTS USER DRILL
                    var stealth_events_full = require('../../controllers/stealth/stealth_events_full')(pool);
                // TABLE
                app.route('/api/stealth/stealth_events_full/table').get(auth.permission, stealth_events_full.table);
        // STEALTH QUARANTINE
            var stealth_quarantine = require('../../controllers/stealth/stealth_quarantine')(pool); 
            // TABLE
            app.route('/api/stealth/stealth_quarantine/table').get(auth.permission, stealth_quarantine.table);    
};
