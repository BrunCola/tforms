'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // FIRST SEEN
        // NEW REMOTE
            var new_remote = require('../../controllers/first_seen/new_remote')(pool);
            // CROSSFILTER
            app.route('/api/first_seen/new_remote/crossfilter').get(auth.permission, new_remote.crossfilter);
            // TABLE
            app.route('/api/first_seen/new_remote/table').get(auth.permission, new_remote.table);
        // NEW DNS QUERIES
            var new_dns_queries = require('../../controllers/first_seen/new_dns_queries')(pool);
            // CROSSFILTER
            app.route('/api/first_seen/new_dns_queries/crossfilter').get(auth.permission, new_dns_queries.crossfilter);
            // TABLE
            app.route('/api/first_seen/new_dns_queries/table').get(auth.permission, new_dns_queries.table);
        // NEW HTTP DOMAINS
            var new_http_domains = require('../../controllers/first_seen/new_http_domains')(pool);
            // CROSSFILTER
            app.route('/api/first_seen/new_http_domains/crossfilter').get(auth.permission, new_http_domains.crossfilter);
            // TABLE
            app.route('/api/first_seen/new_http_domains/table').get(auth.permission, new_http_domains.table);
        // NEW SSL HOSTS
            var new_ssl_hosts = require('../../controllers/first_seen/new_ssl_hosts')(pool);
            // CROSSFILTER
            app.route('/api/first_seen/new_ssl_hosts/crossfilter').get(auth.permission, new_ssl_hosts.crossfilter);
            // TABLE
            app.route('/api/first_seen/new_ssl_hosts/table').get(auth.permission, new_ssl_hosts.table);
        // NEW SSH REMOTE
            var new_ssh_remote = require('../../controllers/first_seen/new_ssh_remote')(pool);
            // CROSSFILTER
            app.route('/api/first_seen/new_ssh_remote/crossfilter').get(auth.permission, new_ssh_remote.crossfilter);
            // TABLE
            app.route('/api/first_seen/new_ssh_remote/table').get(auth.permission, new_ssh_remote.table);
        // NEW FTP REMOTE
            var new_ftp_remote = require('../../controllers/first_seen/new_ftp_remote')(pool);
            // CROSSFILTER
            app.route('/api/first_seen/new_ftp_remote/crossfilter').get(auth.permission, new_ftp_remote.crossfilter);
            // TABLE
            app.route('/api/first_seen/new_ftp_remote/table').get(auth.permission, new_ftp_remote.table);
    
};
