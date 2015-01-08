'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // LOCAL EVENTS
        // ENDPOINT MAP
            var endpoint_map = require('../../controllers/local_events/endpoint_map')(pool);
            app.route('/api/local_events/endpoint_map')
            .get(auth.permission, endpoint_map.render) 
            .post(auth.permission, endpoint_map.updatefp); 
        // ENDPOINT BY TYPE
            var endpoint_by_type = require('../../controllers/local_events/endpoint_by_type')(pool);
            // CROSSFILTER
            app.route('/api/local_events/endpoint_by_type/crossfilter').get(auth.permission, endpoint_by_type.crossfilter);
            // TABLE
            app.route('/api/local_events/endpoint_by_type/table').get(auth.permission, endpoint_by_type.table);
            // ENDPOINT EVENTS USER
                var endpoint_by_type_and_user = require('../../controllers/local_events/endpoint_by_type_and_user')(pool);
                app.route('/api/local_events/endpoint_by_type_and_user')
                .get(auth.permission, endpoint_by_type_and_user.render);
                // ENDPOINT EVENTS USER DRILL
                    var endpoint_full = require('../../controllers/local_events/endpoint_full')(pool);
                    app.route('/api/local_events/endpoint_full')
                    .get(auth.permission, endpoint_full.render);
        // ENDPOINT BY USER
            var endpoint_by_user = require('../../controllers/local_events/endpoint_by_user')(pool);
            // CROSSFILTER
            app.route('/api/local_events/endpoint_by_user/crossfilter').get(auth.permission, endpoint_by_user.crossfilter);
            // TABLE
            app.route('/api/local_events/endpoint_by_user/table').get(auth.permission, endpoint_by_user.table);
            // ENDPOINT EVENTS LOCAL BY ALERT INFO
                var endpoint_by_user_and_type = require('../../controllers/local_events/endpoint_by_user_and_type')(pool);
                app.route('/api/local_events/endpoint_by_user_and_type')
                .get(auth.permission, endpoint_by_user_and_type.render);
        // ENDPOINT EVENTS SHAREPOINT
            var endpoint_events_sharepoint = require('../../controllers/local_events/endpoint_events_sharepoint')(pool);
            // CROSSFILTER
            app.route('/api/local_events/endpoint_events_sharepoint/crossfilter').get(auth.permission, endpoint_events_sharepoint.crossfilter);
            // TABLE
            app.route('/api/local_events/endpoint_events_sharepoint/table').get(auth.permission, endpoint_events_sharepoint.table);
            // ENDPOINT EVENTS SHAREPOINT DRILL
                var endpoint_events_sharepoint_drill = require('../../controllers/local_events/endpoint_events_sharepoint_drill')(pool);
                app.route('/api/local_events/endpoint_events_sharepoint_drill')
                .get(auth.permission, endpoint_events_sharepoint_drill.render); 
                    // ENDPOINT EVENTS SHAREPOINT FULL
                    var endpoint_events_sharepoint_full = require('../../controllers/local_events/endpoint_events_sharepoint_full')(pool);
                    app.route('/api/local_events/endpoint_events_sharepoint_full')
                    .get(auth.permission, endpoint_events_sharepoint_full.render); 
            // ENDPOINT BY LOCAL BY IP
                var endpoint_by_user_and_ip = require('../../controllers/local_events/endpoint_by_user_and_ip')(pool);
                app.route('/api/local_events/endpoint_by_user_and_ip')
                .get(auth.permission, endpoint_by_user_and_ip.render); 
};
