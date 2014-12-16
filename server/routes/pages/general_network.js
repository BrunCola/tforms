'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // GENERAL NETWORK
        // LOCAL
            var local = require('../../controllers/general_network/local')(pool);
            app.route('/api/general_network/local')
            .get(auth.permission, local.render);
            // LOCAL2REMOTE
                var local2remote = require('../../controllers/general_network/local2remote')(pool);
                app.route('/api/general_network/local2remote')
                .get(auth.permission, local2remote.render);
        // REMOTE
            var remote = require('../../controllers/general_network/remote')(pool);
            app.route('/api/general_network/remote')
            .get(auth.permission, remote.render);
            // REMOTE2LOCAL
                var remote2local = require('../../controllers/general_network/remote2local')(pool);
                app.route('/api/general_network/remote2local')
                .get(auth.permission, remote2local.render);
                // SHARED
                    var shared = require('../../controllers/general_network/shared')(pool);
                    app.route('/api/general_network/shared')
                    .get(auth.permission, shared.render);
        // DNS BY QUERY TYPE
            var dns_by_query_type = require('../../controllers/general_network/dns_by_query_type')(pool);
            app.route('/api/general_network/dns_by_query_type')
            .get(auth.permission, dns_by_query_type.render);
            // DNS BY QUERY TYPE LOCAL
                var dns_by_query_type_local = require('../../controllers/general_network/dns_by_query_type_local')(pool);
                app.route('/api/general_network/dns_by_query_type_local')
                .get(auth.permission, dns_by_query_type_local.render);
                // DNS BY QUERY TYPE DRILL
                    var dns_by_query_type_local_drill = require('../../controllers/general_network/dns_by_query_type_local_drill')(pool);
                    app.route('/api/general_network/dns_by_query_type_local_drill')
                    .get(auth.permission, dns_by_query_type_local_drill.render);
        // SSH
            var ssh_local = require('../../controllers/general_network/ssh_local')(pool);
            app.route('/api/general_network/ssh_local')
            .get(auth.permission, ssh_local.render);
            // SSH REMOTE
                var ssh_local2remote = require('../../controllers/general_network/ssh_local2remote')(pool);
                app.route('/api/general_network/ssh_local2remote')
                .get(auth.permission, ssh_local2remote.render);
                // SSH REMOTE SHARED
                    var ssh_shared = require('../../controllers/general_network/ssh_shared')(pool);
                    app.route('/api/general_network/ssh_shared')
                    .get(auth.permission, ssh_shared.render);
        // REMOTE2LOCAL SSH
            var ssh_remote = require('../../controllers/general_network/ssh_remote')(pool);
            app.route('/api/general_network/ssh_remote')
            .get(auth.permission, ssh_remote.render);
            // SSH REMOTE
                var ssh_remote2local = require('../../controllers/general_network/ssh_remote2local')(pool);
                app.route('/api/general_network/ssh_remote2local')
                .get(auth.permission, ssh_remote2local.render);
        // SSH STATUS
            var ssh_status = require('../../controllers/general_network/ssh_status')(pool);
            app.route('/api/general_network/ssh_status')
            .get(auth.permission, ssh_status.render);   
            // SSH STATUS LOCAL
                var ssh_status_local = require('../../controllers/general_network/ssh_status_local')(pool);
                app.route('/api/general_network/ssh_status_local')
                .get(auth.permission, ssh_status_local.render);
                // SSH STATUS LOCAL DRILL
                    var ssh_status_local_drill = require('../../controllers/general_network/ssh_status_local_drill')(pool);
                    app.route('/api/general_network/ssh_status_local_drill')
                    .get(auth.permission, ssh_status_local_drill.render);
        // LOCAL IRC
            var irc_local = require('../../controllers/general_network/irc_local')(pool);
            app.route('/api/general_network/irc_local')
            .get(auth.permission, irc_local.render);
            // LOCAL2REMOTE IRC
                var irc_local2remote = require('../../controllers/general_network/irc_local2remote')(pool);
                app.route('/api/general_network/irc_local2remote')
                .get(auth.permission, irc_local2remote.render);
                // IRC SHARED
                    var irc_shared = require('../../controllers/general_network/irc_shared')(pool);
                    app.route('/api/general_network/irc_shared')
                    .get(auth.permission, irc_shared.render);
        // REMOTE IRC
            var irc_remote = require('../../controllers/general_network/irc_remote')(pool);
            app.route('/api/general_network/irc_remote')
            .get(auth.permission, irc_remote.render);
            // REMOTE2LOCAL IRC
                var irc_remote2local = require('../../controllers/general_network/irc_remote2local')(pool);
                app.route('/api/general_network/irc_remote2local')
                .get(auth.permission, irc_remote2local.render);
        // LOCAL FTP
            var ftp_local = require('../../controllers/general_network/ftp_local')(pool);
            app.route('/api/general_network/ftp_local')
            .get(auth.permission, ftp_local.render);
            // LOCAL2REMOTE FTP
                var ftp_local2remote = require('../../controllers/general_network/ftp_local2remote')(pool);
                app.route('/api/general_network/ftp_local2remote')
                .get(auth.permission, ftp_local2remote.render);
                // FTP SHARED
                var ftp_shared = require('../../controllers/general_network/ftp_shared')(pool);
                app.route('/api/general_network/ftp_shared')
                .get(auth.permission, ftp_shared.render);
        // REMOTE FTP
            var ftp_remote = require('../../controllers/general_network/ftp_remote')(pool);
            app.route('/api/general_network/ftp_remote')
            .get(auth.permission, ftp_remote.render);   
            // REMOTE2LOCAL FTP
                var ftp_remote2local = require('../../controllers/general_network/ftp_remote2local')(pool);
                app.route('/api/general_network/ftp_remote2local')
                .get(auth.permission, ftp_remote2local.render);
        // FIREWALL
            var firewall = require('../../controllers/general_network/firewall')(pool); 
            app.route('/api/general_network/firewall')
            .get(auth.permission, firewall.render);
    
};
