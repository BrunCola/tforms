'use strict';

module.exports = function(app, version, pool) {
    var auth = require('./middlewares/authorization')();

      var live_connections = require('../controllers/live_connections/live_connections')(pool);
        app.route('/api/live_connections/live_connections').get(auth.permission, live_connections.render);
    // HEALTH
    //OVERVIEW
        // var overview = require('../controllers/health/overview')(pool); 
        //  app.route('/api/health/overview')
        //     .get(auth.permission, overview.render);
        // //HEALTH DRILL
        //     var health_drill = require('../controllers/health/health_drill')(pool);
        //     app.route('/api/health/health_drill')
        //     .get(auth.permission, health_drill.render);
    // REPORTS
        // IOC EVENTS REPORT
            var ioc_events_report = require('../controllers/reports/ioc_events')(pool);
            app.route('/api/reports/ioc_events')
            .get(auth.permission, ioc_events_report.render);
    // ARCHIVE
        var archive = require('../controllers/archive')(pool);
        app.route('/api/archive')
        .get(auth.permission, archive.render);
    // UPLOAD
        var upload = require('../controllers/upload')(pool);
        app.route('/api/uploads')
        .post(auth.permission, upload.render);   

    var actions = require('../controllers/actions')(pool);
    var upload = require('../controllers/upload')(pool);

        // ioc Actions
    app.route('/api/actions/archive')
        .post(auth.permission, actions.archive);

    app.route('/api/actions/restore')
        .post(auth.permission, actions.restore);

    app.route('/api/actions/clear')
        .post(auth.permission, actions.clear);

    app.route('/api/actions/local_cc')
        .post(auth.permission, actions.local_cc);

    //other actions

    app.route('/api/actions/add_user_to_map')
        .post(auth.permission, actions.add_user_to_map);
        
    app.route('/api/actions/change_custom_user')
        .post(auth.permission, actions.change_custom_user);

    //upload file
    app.route('/api/upload/render')
        .post(auth.permission, upload.render);
};
