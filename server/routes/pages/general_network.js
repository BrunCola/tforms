'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // GENERAL NETWORK
        // LOCAL
            var local = require('../../controllers/general_network/local')(pool);
            // CROSSFILTER
            app.route('/api/general_network/local/crossfilter').get(auth.permission, local.crossfilter);
            // TABLE
            app.route('/api/general_network/local/table').get(auth.permission, local.table);
                // LOCAL2REMOTE
                    var local2remote = require('../../controllers/general_network/local2remote')(pool);
                    // CROSSFILTER
                    app.route('/api/general_network/local2remote/crossfilter').get(auth.permission, local2remote.crossfilter);
                    // TABLE
                    app.route('/api/general_network/local2remote/table').get(auth.permission, local2remote.table);
        // REMOTE
        var remote = require('../../controllers/general_network/remote')(pool);
            // CROSSFILTER
            app.route('/api/general_network/remote/crossfilter').get(auth.permission, remote.crossfilter);
            // TABLE
            app.route('/api/general_network/remote/table').get(auth.permission, remote.table);
                // REMOTE2LOCAL
                var remote2local = require('../../controllers/general_network/remote2local')(pool);
                    // CROSSFILTER
                    app.route('/api/general_network/remote2local/crossfilter').get(auth.permission, remote2local.crossfilter);
                    // TABLE
                    app.route('/api/general_network/remote2local/table').get(auth.permission, remote2local.table);
                        // SHARED
                        var shared = require('../../controllers/general_network/shared')(pool);
                        // TABLE
                        app.route('/api/general_network/shared/table').get(auth.permission, shared.table);
        // DNS BY QUERY TYPE
            var dns_by_query_type = require('../../controllers/general_network/dns_by_query_type')(pool);
            // CROSSFILTER
            app.route('/api/general_network/dns_by_query_type/crossfilter').get(auth.permission, dns_by_query_type.crossfilter);
            // CROSSFILTER PIE
            app.route('/api/general_network/dns_by_query_type/crossfilterpie').get(auth.permission, dns_by_query_type.crossfilterpie);
            // TABLE
            app.route('/api/general_network/dns_by_query_type/table').get(auth.permission, dns_by_query_type.table);
                // DNS BY QUERY TYPE LOCAL
                var dns_by_query_type_local = require('../../controllers/general_network/dns_by_query_type_local')(pool);
                // TABLE
                app.route('/api/general_network/dns_by_query_type_local/table').get(auth.permission, dns_by_query_type_local.table);
                    // DNS BY QUERY TYPE DRILL
                    var dns_by_query_type_local_drill = require('../../controllers/general_network/dns_by_query_type_local_drill')(pool);
                    // TABLE
                    app.route('/api/general_network/dns_by_query_type_local_drill/table').get(auth.permission, dns_by_query_type_local_drill.table);
        // SSH
        var ssh_local = require('../../controllers/general_network/ssh_local')(pool);
            // TABLE
            app.route('/api/general_network/ssh_local/table').get(auth.permission, ssh_local.table);
            // SSH REMOTE2LOCAL SSH
                var ssh_local2remote = require('../../controllers/general_network/ssh_local2remote')(pool);
                // TABLE
                app.route('/api/general_network/ssh_local2remote/table').get(auth.permission, ssh_local2remote.table);
                // SSH REMOTE SHARED
                    var ssh_shared = require('../../controllers/general_network/ssh_shared')(pool);
                    // TABLE
                    app.route('/api/general_network/ssh_shared/table').get(auth.permission, ssh_shared.table);
        // SSH REMOTE
            var ssh_remote = require('../../controllers/general_network/ssh_remote')(pool);
            // TABLE
            app.route('/api/general_network/ssh_remote/table').get(auth.permission, ssh_remote.table);
            // SSH REMOTE
                var ssh_remote2local = require('../../controllers/general_network/ssh_remote2local')(pool);
                // TABLE
                app.route('/api/general_network/ssh_remote2local/table').get(auth.permission, ssh_remote2local.table);
        // SSH STATUS
        var ssh_status = require('../../controllers/general_network/ssh_status')(pool);
            // CROSSFILTER
            app.route('/api/general_network/ssh_status/crossfilter').get(auth.permission, ssh_status.crossfilter);
            // CROSSFILTER PIE
            app.route('/api/general_network/ssh_status/crossfilterpie').get(auth.permission, ssh_status.crossfilterpie);
            // TABLE
            app.route('/api/general_network/ssh_status/table').get(auth.permission, ssh_status.table);
            // SSH STATUS LOCAL
                var ssh_status_local = require('../../controllers/general_network/ssh_status_local')(pool);
                // TABLE
                app.route('/api/general_network/ssh_status_local/table').get(auth.permission, ssh_status_local.table);
                // SSH STATUS LOCAL DRILL
                    var ssh_status_local_drill = require('../../controllers/general_network/ssh_status_local_drill')(pool);
                    // TABLE
                    app.route('/api/general_network/ssh_status_local_drill/table').get(auth.permission, ssh_status_local_drill.table);
        // LOCAL IRC
            var irc_local = require('../../controllers/general_network/irc_local')(pool);
            // TABLE
            app.route('/api/general_network/irc_local/table').get(auth.permission, irc_local.table);
            // LOCAL2REMOTE IRC
                var irc_local2remote = require('../../controllers/general_network/irc_local2remote')(pool);
            // TABLE
            app.route('/api/general_network/irc_local2remote/table').get(auth.permission, irc_local2remote.table);
                // IRC SHARED
                    var irc_shared = require('../../controllers/general_network/irc_shared')(pool);
            // TABLE
            app.route('/api/general_network/irc_shared/table').get(auth.permission, irc_shared.table);
        // REMOTE IRC
            var irc_remote = require('../../controllers/general_network/irc_remote')(pool);
            // TABLE
            app.route('/api/general_network/irc_remote/table').get(auth.permission, irc_remote.table);
            // REMOTE2LOCAL IRC
                var irc_remote2local = require('../../controllers/general_network/irc_remote2local')(pool);
            // TABLE
            app.route('/api/general_network/irc_remote2local/table').get(auth.permission, irc_remote2local.table);
        // LOCAL FTP
            var ftp_local = require('../../controllers/general_network/ftp_local')(pool);
            // TABLE
            app.route('/api/general_network/ftp_local/table').get(auth.permission, ftp_local.table);
            // LOCAL2REMOTE FTP
                var ftp_local2remote = require('../../controllers/general_network/ftp_local2remote')(pool);
                // TABLE
                app.route('/api/general_network/ftp_local2remote/table').get(auth.permission, ftp_local2remote.table);
                    // FTP SHARED
                        var ftp_shared = require('../../controllers/general_network/ftp_shared')(pool);
                        // TABLE
                        app.route('/api/general_network/ftp_shared/table').get(auth.permission, ftp_shared.table);
        // REMOTE FTP
            var ftp_remote = require('../../controllers/general_network/ftp_remote')(pool);
            // TABLE
            app.route('/api/general_network/ftp_remote/table').get(auth.permission, ftp_remote.table);
            // REMOTE2LOCAL FTP
                var ftp_remote2local = require('../../controllers/general_network/ftp_remote2local')(pool);
                // TABLE
                app.route('/api/general_network/ftp_remote2local/table').get(auth.permission, ftp_remote2local.table);
        // FIREWALL
            var firewall = require('../../controllers/general_network/firewall')(pool); 
            // TABLE
            app.route('/api/general_network/firewall/table').get(auth.permission, firewall.table);
    
};
