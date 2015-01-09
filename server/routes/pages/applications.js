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
                // CROSSFILTER
                app.route('/api/applications/application_drill/crossfilter').get(auth.permission, application_drill.crossfilter);
                // TABLE
                app.route('/api/applications/application_drill/table').get(auth.permission, application_drill.table);
                    // APPLICATION LOCAL
                    var application_local = require('../../controllers/applications/application_local')(pool);
                    // CROSSFILTER
                    app.route('/api/applications/application_local/crossfilter').get(auth.permission, application_local.crossfilter);
                    // TABLE
                    app.route('/api/applications/application_local/table').get(auth.permission, application_local.table);
    // BY LOCAL IP
        var app_by_local_ip = require('../../controllers/applications/app_by_local_ip')(pool);
            // CROSSFILTER
            app.route('/api/applications/app_by_local_ip/crossfilter').get(auth.permission, app_by_local_ip.crossfilter);
            // TABLE
            app.route('/api/applications/app_by_local_ip/table').get(auth.permission, app_by_local_ip.table);
        // L7 LOCAL APP
            var l7_local_app = require('../../controllers/applications/l7_local_app')(pool);
            // CROSSFILTER
            app.route('/api/applications/l7_local_app/crossfilter').get(auth.permission, l7_local_app.crossfilter);
            // TABLE
            app.route('/api/applications/l7_local_app/table').get(auth.permission, l7_local_app.table);
            // l7 LOCAL DRILL
                var l7_local_drill = require('../../controllers/applications/l7_local_drill')(pool);
                // CROSSFILTER
                app.route('/api/applications/l7_local_drill/crossfilter').get(auth.permission, l7_local_drill.crossfilter);
                // TABLE
                app.route('/api/applications/l7_local_drill/table').get(auth.permission, l7_local_drill.table);
                // l7 SHARED
                    var l7_shared = require('../../controllers/applications/l7_shared')(pool);
                    // TABLE
                    app.route('/api/applications/l7_shared/table').get(auth.permission, l7_shared.table);
    // BY REMOTE IP
        var app_by_remote_ip = require('../../controllers/applications/app_by_remote_ip')(pool);
            // CROSSFILTER
            app.route('/api/applications/app_by_remote_ip/crossfilter').get(auth.permission, app_by_remote_ip.crossfilter);
            // TABLE
            app.route('/api/applications/app_by_remote_ip/table').get(auth.permission, app_by_remote_ip.table);
        // L7 REMOTE APP
            var l7_remote_app = require('../../controllers/applications/l7_remote_app')(pool);
            // CROSSFILTER
            app.route('/api/applications/l7_remote_app/crossfilter').get(auth.permission, l7_remote_app.crossfilter);
            // TABLE
            app.route('/api/applications/l7_remote_app/table').get(auth.permission, l7_remote_app.table); 
            // l7 REMOTE DRILL
                var l7_remote_drill = require('../../controllers/applications/l7_remote_drill')(pool);
                // CROSSFILTER
                app.route('/api/applications/l7_remote_drill/crossfilter').get(auth.permission, l7_remote_drill.crossfilter);
                // TABLE
                app.route('/api/applications/l7_remote_drill/table').get(auth.permission, l7_remote_drill.table); 
    
};
