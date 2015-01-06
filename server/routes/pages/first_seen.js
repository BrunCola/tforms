'use strict';

module.exports = function(app, version, pool) {
    var auth = require('../middlewares/authorization')();
    // FIRST SEEN
        // NEW REMOTE
            var new_remote = require('../../controllers/first_seen/new_remote')(pool);
            app.route('/api/first_seen/new_remote')
            .get(auth.permission, new_remote.render);
        // NEW DNS QUERIES
            var new_dns_queries = require('../../controllers/first_seen/new_dns_queries')(pool);
            app.route('/api/first_seen/new_dns_queries')
            .get(auth.permission, new_dns_queries.render);
        // NEW HTTP DOMAINS
            var new_http_domains = require('../../controllers/first_seen/new_http_domains')(pool);
            app.route('/api/first_seen/new_http_domains')
            .get(auth.permission, new_http_domains.render);
        // NEW SSL HOSTS
            var new_ssl_hosts = require('../../controllers/first_seen/new_ssl_hosts')(pool);
            app.route('/api/first_seen/new_ssl_hosts')
            .get(auth.permission, new_ssl_hosts.render);
        // NEW SSH REMOTE
            var new_ssh_remote = require('../../controllers/first_seen/new_ssh_remote')(pool);
            app.route('/api/first_seen/new_ssh_remote')
            .get(auth.permission, new_ssh_remote.render);
        // NEW FTP REMOTE
            var new_ftp_remote = require('../../controllers/first_seen/new_ftp_remote')(pool);
            app.route('/api/first_seen/new_ftp_remote')
            .get(auth.permission, new_ftp_remote.render);
    
};
