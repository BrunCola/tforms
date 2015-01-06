'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
        // IOC EVENTS
        var ioc_events = require('../../controllers/ioc_notifications/ioc_events')(pool);
            // CROSSFILTER
            app.route('/api/ioc_notifications/ioc_events/crossfilter').get(auth.permission, ioc_events.crossfilter);
            // VARS
            app.route('/api/ioc_notifications/ioc_events/ioc_notifications').get(auth.permission, ioc_events.ioc_notifications);
            app.route('/api/ioc_notifications/ioc_events/ioc_groups').get(auth.permission, ioc_events.ioc_groups);
            app.route('/api/ioc_notifications/ioc_events/local_ips').get(auth.permission, ioc_events.local_ips);
            app.route('/api/ioc_notifications/ioc_events/remote_ip').get(auth.permission, ioc_events.remote_ip);
            app.route('/api/ioc_notifications/ioc_events/query').get(auth.permission, ioc_events.query);
            app.route('/api/ioc_notifications/ioc_events/host').get(auth.permission, ioc_events.host);
            app.route('/api/ioc_notifications/ioc_events/l7_proto').get(auth.permission, ioc_events.l7_proto);
            app.route('/api/ioc_notifications/ioc_events/remote_ip_ssl').get(auth.permission, ioc_events.remote_ip_ssl);
            app.route('/api/ioc_notifications/ioc_events/name').get(auth.permission, ioc_events.name);
            app.route('/api/ioc_notifications/ioc_events/remote_country').get(auth.permission, ioc_events.remote_country);
            app.route('/api/ioc_notifications/ioc_events/bandwidth_in').get(auth.permission, ioc_events.bandwidth_in);
            app.route('/api/ioc_notifications/ioc_events/bandwidth_out').get(auth.permission, ioc_events.bandwidth_out);
            app.route('/api/ioc_notifications/ioc_events/new_ip').get(auth.permission, ioc_events.new_ip);
            app.route('/api/ioc_notifications/ioc_events/new_dns').get(auth.permission, ioc_events.new_dns);
            app.route('/api/ioc_notifications/ioc_events/new_http').get(auth.permission, ioc_events.new_http);
            app.route('/api/ioc_notifications/ioc_events/new_ssl').get(auth.permission, ioc_events.new_ssl);
            app.route('/api/ioc_notifications/ioc_events/new_layer7').get(auth.permission, ioc_events.new_layer7);
            app.route('/api/ioc_notifications/ioc_events/conn_meta').get(auth.permission, ioc_events.conn_meta);
            app.route('/api/ioc_notifications/ioc_events/remote_ip_conn_meta').get(auth.permission, ioc_events.remote_ip_conn_meta);
            app.route('/api/ioc_notifications/ioc_events/remote_country_conn_meta').get(auth.permission, ioc_events.remote_country_conn_meta);
            // TABLE
            app.route('/api/ioc_notifications/ioc_events/table').get(auth.permission, ioc_events.table);


    // IOC EVENTS DRILLDOWN
    var ioc_events_drilldown = require('../../controllers/ioc_notifications/ioc_events_drilldown')(pool);
        app.route('/api/ioc_notifications/ioc_events_drilldown')
            .get(auth.permission, ioc_events_drilldown.render)
            .post(auth.permission, ioc_events_drilldown.set_info);
        app.route('/api/ioc_notifications/ioc_events_drilldown/patterns')
            .post(auth.permission, ioc_events_drilldown.pattern);
    // IOC REMOTE
    var ioc_remote = require('../../controllers/ioc_notifications/ioc_remote')(pool);
         app.route('/api/ioc_notifications/ioc_remote')
        .get(auth.permission, ioc_remote.render);
        // IOC REMOTE2LOCAL
            var ioc_remote2local = require('../../controllers/ioc_notifications/ioc_remote2local')(pool);
            app.route('/api/ioc_notifications/ioc_remote2local')
            .get(auth.permission, ioc_remote2local.render);
    // IOC LOCAL
        var ioc_local = require('../../controllers/ioc_notifications/ioc_local')(pool);
        app.route('/api/ioc_notifications/ioc_local')
        .get(auth.permission, ioc_local.render);
        // IOC LOCAL DRILL
            var ioc_local_drill = require('../../controllers/ioc_notifications/ioc_local_drill')(pool);
            app.route('/api/ioc_notifications/ioc_local_drill')
            .get(auth.permission, ioc_local_drill.render);
};
