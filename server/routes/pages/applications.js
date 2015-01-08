'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // APPLICATIONS
    // BY APPLICATION
        var app_by_application = require('../../controllers/applications/app_by_application')(pool);
            // CROSSFILTER
            app.route('/api/applications/app_by_application/crossfilter').get(auth.permission, app_by_application.crossfilter);
            // TABLE
            app.route('/api/applications/app_by_application/table').get(auth.permission, app_by_application.table);
        // APPLICATION DRILL
            var application_drill = require('../../controllers/applications/application_drill')(pool);
            app.route('/api/applications/application_drill')
            .get(auth.permission, application_drill.render);
            // APPLICATION LOCAL
                var application_local = require('../../controllers/applications/application_local')(pool);
                app.route('/api/applications/application_local')
                .get(auth.permission, application_local.render);
    // BY LOCAL IP
        var app_by_local_ip = require('../../controllers/applications/app_by_local_ip')(pool);
            // CROSSFILTER
            app.route('/api/applications/app_by_local_ip/crossfilter').get(auth.permission, app_by_local_ip.crossfilter);
            // TABLE
            app.route('/api/applications/app_by_local_ip/table').get(auth.permission, app_by_local_ip.table);
        // L7 LOCAL APP
            var l7_local_app = require('../../controllers/applications/l7_local_app')(pool);
            app.route('/api/applications/l7_local_app')
            .get(auth.permission, l7_local_app.render);
            // l7 LOCAL DRILL
                var l7_local_drill = require('../../controllers/applications/l7_local_drill')(pool);
                app.route('/api/applications/l7_local_drill')
                .get(auth.permission, l7_local_drill.render);
                // l7 SHARED
                    var l7_shared = require('../../controllers/applications/l7_shared')(pool);
                    app.route('/api/applications/l7_shared')
                    .get(auth.permission, l7_shared.render);
    // BY REMOTE IP
        var app_by_remote_ip = require('../../controllers/applications/app_by_remote_ip')(pool);
            // CROSSFILTER
            app.route('/api/applications/app_by_remote_ip/crossfilter').get(auth.permission, app_by_remote_ip.crossfilter);
            // TABLE
            app.route('/api/applications/app_by_remote_ip/table').get(auth.permission, app_by_remote_ip.table);
        // L7 REMOTE APP
            var l7_remote_app = require('../../controllers/applications/l7_remote_app')(pool);
            app.route('/api/applications/l7_remote_app')
            .get(auth.permission, l7_remote_app.render); 
            // l7 REMOTE DRILL
                var l7_remote_drill = require('../../controllers/applications/l7_remote_drill')(pool);
                app.route('/api/applications/l7_remote_drill')
                .get(auth.permission, l7_remote_drill.render);
    
};
