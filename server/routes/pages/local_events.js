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
                // TABLE
                app.route('/api/local_events/endpoint_by_type_and_user/table').get(auth.permission, endpoint_by_type_and_user.table);
                // ENDPOINT EVENTS USER DRILL
                    var endpoint_full = require('../../controllers/local_events/endpoint_full')(pool);
                    // TABLE
                    app.route('/api/local_events/endpoint_full/table').get(auth.permission, endpoint_full.table);
        // ENDPOINT BY USER
            var endpoint_by_user = require('../../controllers/local_events/endpoint_by_user')(pool);
            // CROSSFILTER
            app.route('/api/local_events/endpoint_by_user/crossfilter').get(auth.permission, endpoint_by_user.crossfilter);
            // TABLE
            app.route('/api/local_events/endpoint_by_user/table').get(auth.permission, endpoint_by_user.table);
            // ENDPOINT EVENTS LOCAL BY ALERT INFO
                var endpoint_by_user_and_type = require('../../controllers/local_events/endpoint_by_user_and_type')(pool);
                // TABLE
                app.route('/api/local_events/endpoint_by_user_and_type/table').get(auth.permission, endpoint_by_user_and_type.table);
        // ENDPOINT EVENTS SHAREPOINT
            var endpoint_events_sharepoint = require('../../controllers/local_events/endpoint_events_sharepoint')(pool);
            // CROSSFILTER
            app.route('/api/local_events/endpoint_events_sharepoint/crossfilter').get(auth.permission, endpoint_events_sharepoint.crossfilter);
            // TABLE
            app.route('/api/local_events/endpoint_events_sharepoint/table').get(auth.permission, endpoint_events_sharepoint.table);
            // ENDPOINT EVENTS SHAREPOINT DRILL
                var endpoint_events_sharepoint_drill = require('../../controllers/local_events/endpoint_events_sharepoint_drill')(pool);
                // TABLE
                app.route('/api/local_events/endpoint_events_sharepoint_drill/table').get(auth.permission, endpoint_events_sharepoint_drill.table);
                    // ENDPOINT EVENTS SHAREPOINT FULL
                    var endpoint_events_sharepoint_full = require('../../controllers/local_events/endpoint_events_sharepoint_full')(pool);
                    // TABLE
                    app.route('/api/local_events/endpoint_events_sharepoint_full/table').get(auth.permission, endpoint_events_sharepoint_full.table);
            // ENDPOINT BY LOCAL BY IP
                var endpoint_by_user_and_ip = require('../../controllers/local_events/endpoint_by_user_and_ip')(pool);
                app.route('/api/local_events/endpoint_by_user_and_ip')
                .get(auth.permission, endpoint_by_user_and_ip.render); 
};
