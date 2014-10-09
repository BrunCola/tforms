'use strict';

// Auth Check
var authorization = require('./middlewares/authorization');

module.exports = function(app, passport, version, io, pool) {
    // LIVE CONNECTIONS
        var live_connections = require('../controllers/live_connections/live_connections')(pool);
        app.route('/live_connections/live_connections')
        .get(authorization.requiresLogin, live_connections.render);
    // IOC NOTIFICATIONS
        // IOC EVENTS
            var ioc_events = require('../controllers/ioc_notifications/ioc_events')(pool);
            app.route('/ioc_notifications/ioc_events')
            .get(authorization.requiresLogin, ioc_events.render);
            // IOC EVENTS DRILLDOWN
                var ioc_events_drilldown = require('../controllers/ioc_notifications/ioc_events_drilldown')(pool);
                app.route('/ioc_notifications/ioc_events_drilldown')
                .get(authorization.requiresLogin, ioc_events_drilldown.render);
        // IOC REMOTE
            var ioc_remote = require('../controllers/ioc_notifications/ioc_remote')(pool);
             app.route('/ioc_notifications/ioc_remote')
            .get(authorization.requiresLogin, ioc_remote.render);
            // IOC REMOTE2LOCAL
                var ioc_remote2local = require('../controllers/ioc_notifications/ioc_remote2local')(pool);
                app.route('/ioc_notifications/ioc_remote2local')
                .get(authorization.requiresLogin, ioc_remote2local.render);
        // IOC LOCAL
            var ioc_local = require('../controllers/ioc_notifications/ioc_local')(pool);
            app.route('/ioc_notifications/ioc_local')
            .get(authorization.requiresLogin, ioc_local.render);
            // IOC LOCAL DRILL
                var ioc_local_drill = require('../controllers/ioc_notifications/ioc_local_drill')(pool);
                app.route('/ioc_notifications/ioc_local_drill')
                .get(authorization.requiresLogin, ioc_local_drill.render);
    // GENERAL NETWORK
        // LOCAL
            var local = require('../controllers/general_network/local')(pool);
            app.route('/general_network/local')
            .get(authorization.requiresLogin, local.render);
            // LOCAL2REMOTE
                var local2remote = require('../controllers/general_network/local2remote')(pool);
                app.route('/general_network/local2remote')
                .get(authorization.requiresLogin, local2remote.render);
        // REMOTE
            var remote = require('../controllers/general_network/remote')(pool);
            app.route('/general_network/remote')
            .get(authorization.requiresLogin, remote.render);
            // REMOTE2LOCAL
                var remote2local = require('../controllers/general_network/remote2local')(pool);
                app.route('/general_network/remote2local')
                .get(authorization.requiresLogin, remote2local.render);
                // SHARED
                    var shared = require('../controllers/general_network/shared')(pool);
                    app.route('/general_network/shared')
                    .get(authorization.requiresLogin, shared.render);
        // SSH
            var ssh_local = require('../controllers/general_network/ssh_local')(pool);
            app.route('/general_network/ssh_local')
            .get(authorization.requiresLogin, ssh_local.render);
            // SSH REMOTE
                var ssh_local2remote = require('../controllers/general_network/ssh_local2remote')(pool);
                app.route('/general_network/ssh_local2remote')
                .get(authorization.requiresLogin, ssh_local2remote.render);
                // SSH REMOTE SHARED
                    var ssh_shared = require('../controllers/general_network/ssh_shared')(pool);
                    app.route('/general_network/ssh_shared')
                    .get(authorization.requiresLogin, ssh_shared.render);
        // REMOTE2LOCAL SSH
            var ssh_remote = require('../controllers/general_network/ssh_remote')(pool);
            app.route('/general_network/ssh_remote')
            .get(authorization.requiresLogin, ssh_remote.render);
            // SSH REMOTE
                var ssh_remote2local = require('../controllers/general_network/ssh_remote2local')(pool);
                app.route('/general_network/ssh_remote2local')
                .get(authorization.requiresLogin, ssh_remote2local.render);
        // SSH STATUS
            var ssh_status = require('../controllers/general_network/ssh_status')(pool);
            app.route('/general_network/ssh_status')
            .get(authorization.requiresLogin, ssh_status.render);   
            // SSH STATUS LOCAL
                var ssh_status_local = require('../controllers/general_network/ssh_status_local')(pool);
                app.route('/general_network/ssh_status_local')
                .get(authorization.requiresLogin, ssh_status_local.render);
                // SSH STATUS LOCAL DRILL
                    var ssh_status_local_drill = require('../controllers/general_network/ssh_status_local_drill')(pool);
                    app.route('/general_network/ssh_status_local_drill')
                    .get(authorization.requiresLogin, ssh_status_local_drill.render);
        // LOCAL IRC
            var irc_local = require('../controllers/general_network/irc_local')(pool);
            app.route('/general_network/irc_local')
            .get(authorization.requiresLogin, irc_local.render);
            // LOCAL2REMOTE IRC
                var irc_local2remote = require('../controllers/general_network/irc_local2remote')(pool);
                app.route('/general_network/irc_local2remote')
                .get(authorization.requiresLogin, irc_local2remote.render);
                // IRC SHARED
                    var irc_shared = require('../controllers/general_network/irc_shared')(pool);
                    app.route('/general_network/irc_shared')
                    .get(authorization.requiresLogin, irc_shared.render);
        // REMOTE IRC
            var irc_remote = require('../controllers/general_network/irc_remote')(pool);
            app.route('/general_network/irc_remote')
            .get(authorization.requiresLogin, irc_remote.render);
            // REMOTE2LOCAL IRC
                var irc_remote2local = require('../controllers/general_network/irc_remote2local')(pool);
                app.route('/general_network/irc_remote2local')
                .get(authorization.requiresLogin, irc_remote2local.render);
        // LOCAL FTP
            var ftp_local = require('../controllers/general_network/ftp_local')(pool);
            app.route('/general_network/ftp_local')
            .get(authorization.requiresLogin, ftp_local.render);
            // LOCAL2REMOTE FTP
                var ftp_local2remote = require('../controllers/general_network/ftp_local2remote')(pool);
                app.route('/general_network/ftp_local2remote')
                .get(authorization.requiresLogin, ftp_local2remote.render);
                // FTP SHARED
                var ftp_shared = require('../controllers/general_network/ftp_shared')(pool);
                app.route('/general_network/ftp_shared')
                .get(authorization.requiresLogin, ftp_shared.render);
        // REMOTE FTP
            var ftp_remote = require('../controllers/general_network/ftp_remote')(pool);
            app.route('/general_network/ftp_remote')
            .get(authorization.requiresLogin, ftp_remote.render);   
            // REMOTE2LOCAL FTP
                var ftp_remote2local = require('../controllers/general_network/ftp_remote2local')(pool);
                app.route('/general_network/ftp_remote2local')
                .get(authorization.requiresLogin, ftp_remote2local.render);
    // STEALTH
        // STEALTH COI MAP
            var stealth_COI_map = require('../controllers/local_events/stealth_COI_map')(pool); 
            app.route('/local_events/stealth_COI_map')
            .get(authorization.requiresLogin, stealth_COI_map.render)
            .post(authorization.requiresLogin, stealth_COI_map.set_coordinates);
        // STEALTH USER CONN
            var local_COI_remote = require('../controllers/local_events/local_COI_remote')(pool); 
            app.route('/local_events/local_COI_remote')
            .get(authorization.requiresLogin, local_COI_remote.render)
            .post(authorization.requiresLogin, local_COI_remote.set_coordinates);
        // LOCAL USERS CONN
            var local_user_conn = require('../controllers/local_events/local_user_conn')(pool);
            app.route('/local_events/local_user_conn')
            .get(authorization.requiresLogin, local_user_conn.render);
            // LOCAL COI REMOTE DRILL
                var local_COI_remote_drill = require('../controllers/local_events/local_COI_remote_drill')(pool);
                app.route('/local_events/local_COI_remote_drill')
                .get(authorization.requiresLogin, local_COI_remote_drill.render);
        // STEALTH QUARANTINE
            var stealth_quarantine = require('../controllers/local_events/stealth_quarantine')(pool); 
            app.route('/local_events/stealth_quarantine')
            .get(authorization.requiresLogin, stealth_quarantine.render);
    // LOCAL EVENTS        
        // FIREWALL
            var firewall = require('../controllers/local_events/firewall')(pool); 
            app.route('/local_events/firewall')
            .get(authorization.requiresLogin, firewall.render);
        // LOCAL NETWORK MAP
            var local_network_map = require('../controllers/local_events/local_network_map')(pool);
            app.route('/local_events/local_network_map')
            .get(authorization.requiresLogin, local_network_map.render);
        // ENDPOINT BY TYPE
            var endpoint_by_type = require('../controllers/local_events/endpoint_by_type')(pool);
            app.route('/local_events/endpoint_by_type')
            .get(authorization.requiresLogin, endpoint_by_type.render);
            // ENDPOINT EVENTS USER
                var endpoint_by_type_and_user = require('../controllers/local_events/endpoint_by_type_and_user')(pool);
                app.route('/local_events/endpoint_by_type_and_user')
                .get(authorization.requiresLogin, endpoint_by_type_and_user.render);
                // ENDPOINT EVENTS USER DRILL
                    var endpoint_full = require('../controllers/local_events/endpoint_full')(pool);
                    app.route('/local_events/endpoint_full')
                    .get(authorization.requiresLogin, endpoint_full.render);
        // ENDPOINT BY USER
            var endpoint_by_user = require('../controllers/local_events/endpoint_by_user')(pool);
            app.route('/local_events/endpoint_by_user')
            .get(authorization.requiresLogin, endpoint_by_user.render);
            // ENDPOINT EVENTS LOCAL BY ALERT INFO
                var endpoint_by_user_and_type = require('../controllers/local_events/endpoint_by_user_and_type')(pool);
                app.route('/local_events/endpoint_by_user_and_type')
                .get(authorization.requiresLogin, endpoint_by_user_and_type.render);
        // ENDPOINT EVENTS SHAREPOINT
            var endpoint_events_sharepoint = require('../controllers/local_events/endpoint_events_sharepoint')(pool);
            app.route('/local_events/endpoint_events_sharepoint')
            .get(authorization.requiresLogin, endpoint_events_sharepoint.render);
            // ENDPOINT EVENTS SHAREPOINT DRILL
                var endpoint_events_sharepoint_drill = require('../controllers/local_events/endpoint_events_sharepoint_drill')(pool);
                app.route('/local_events/endpoint_events_sharepoint_drill')
                .get(authorization.requiresLogin, endpoint_events_sharepoint_drill.render); 
            // LOCAL FLOOR PLANS
                var local_floor_plan = require('../controllers/local_events/local_floor_plan')(pool);
                app.route('/local_events/local_floor_plan')
                .get(authorization.requiresLogin, local_floor_plan.render); 
            // ENDPOINT BY LOCAL BY IP
                var endpoint_by_user_and_ip = require('../controllers/local_events/endpoint_by_user_and_ip')(pool);
                app.route('/local_events/endpoint_by_user_and_ip')
                .get(authorization.requiresLogin, endpoint_by_user_and_ip.render); 
    // APPLICATIONS
        // BY APPLICATION
            var app_by_application = require('../controllers/applications/app_by_application')(pool);
            app.route('/applications/app_by_application')
            .get(authorization.requiresLogin, app_by_application.render);
            // APPLICATION DRILL
                var application_drill = require('../controllers/applications/application_drill')(pool);
                app.route('/applications/application_drill')
                .get(authorization.requiresLogin, application_drill.render);
                // APPLICATION LOCAL
                    var application_local = require('../controllers/applications/application_local')(pool);
                    app.route('/applications/application_local')
                    .get(authorization.requiresLogin, application_local.render);
        // BY LOCAL IP
            var app_by_local_ip = require('../controllers/applications/app_by_local_ip')(pool);
            app.route('/applications/app_by_local_ip')
            .get(authorization.requiresLogin, app_by_local_ip.render);  
            // L7 LOCAL APP
                var l7_local_app = require('../controllers/applications/l7_local_app')(pool);
                app.route('/applications/l7_local_app')
                .get(authorization.requiresLogin, l7_local_app.render);
                // l7 LOCAL DRILL
                    var l7_local_drill = require('../controllers/applications/l7_local_drill')(pool);
                    app.route('/applications/l7_local_drill')
                    .get(authorization.requiresLogin, l7_local_drill.render);
                    // l7 SHARED
                        var l7_shared = require('../controllers/applications/l7_shared')(pool);
                        app.route('/applications/l7_shared')
                        .get(authorization.requiresLogin, l7_shared.render);
        // BY REMOTE IP
            var app_by_remote_ip = require('../controllers/applications/app_by_remote_ip')(pool);
            app.route('/applications/app_by_remote_ip')
            .get(authorization.requiresLogin, app_by_remote_ip.render); 
            // L7 REMOTE APP
                var l7_remote_app = require('../controllers/applications/l7_remote_app')(pool);
                app.route('/applications/l7_remote_app')
                .get(authorization.requiresLogin, l7_remote_app.render); 
                // l7 REMOTE DRILL
                    var l7_remote_drill = require('../controllers/applications/l7_remote_drill')(pool);
                    app.route('/applications/l7_remote_drill')
                    .get(authorization.requiresLogin, l7_remote_drill.render);
    // DNS
        // LOCAL DNS
            var dns_local = require('../controllers/dns/dns_local')(pool);
            app.route('/dns/dns_local')
            .get(authorization.requiresLogin, dns_local.render);
        // REMOTE DNS
            var dns_remote = require('../controllers/dns/dns_remote')(pool);
            app.route('/dns/dns_remote')
            .get(authorization.requiresLogin, dns_remote.render);
    // HTTP
        // HTTP BY DOMAIN
            var http_by_domain = require('../controllers/http/http_by_domain')(pool);
            app.route('/http/http_by_domain')
            .get(authorization.requiresLogin, http_by_domain.render);
            // HTTP BY DOMAIN LOCAL
                var http_by_domain_local = require('../controllers/http/http_by_domain_local')(pool);
                app.route('/http/http_by_domain_local')
                .get(authorization.requiresLogin, http_by_domain_local.render);
                // HTTP BY DOMAIN LOCAL DRILL
                    var http_by_domain_local_drill = require('../controllers/http/http_by_domain_local_drill')(pool);
                    app.route('/http/http_by_domain_local_drill')
                    .get(authorization.requiresLogin, http_by_domain_local_drill.render);
        // HTTP LOCAL
            var http_local = require('../controllers/http/http_local')(pool);
            app.route('/http/http_local')
            .get(authorization.requiresLogin, http_local.render);    
            // HTTP LOCAL BY DOMAIN
                var http_local_by_domain = require('../controllers/http/http_local_by_domain')(pool);
                app.route('/http/http_local_by_domain')
                .get(authorization.requiresLogin, http_local_by_domain.render);
        // HTTP REMOTE
            var http_remote = require('../controllers/http/http_remote')(pool);
            app.route('/http/http_remote')
            .get(authorization.requiresLogin, http_remote.render);
            // HTTP REMOTE2LOCAL
                var http_remote2local = require('../controllers/http/http_remote2local')(pool);
                app.route('/http/http_remote2local')
                .get(authorization.requiresLogin, http_remote2local.render);
                // HTTP REMOTE2LOCAL DRILL
                    var http_remote2local_drill = require('../controllers/http/http_remote2local_drill')(pool);
                    app.route('/http/http_remote2local_drill')
                    .get(authorization.requiresLogin, http_remote2local_drill.render);
        // HTTP LOCAL BLOCKED
            var http_local_blocked = require('../controllers/http/http_local_blocked')(pool);
            app.route('/http/http_local_blocked')
            .get(authorization.requiresLogin, http_local_blocked.render);    
            // HTTP LOCAL BY DOMAIN BLOCKED
                var http_local_by_domain_blocked = require('../controllers/http/http_local_by_domain_blocked')(pool);
                app.route('/http/http_local_by_domain_blocked')
                .get(authorization.requiresLogin, http_local_by_domain_blocked.render);
                // HTTP BY DOMAIN LOCAL DRILL BLOCKED
                    var http_by_domain_local_drill_blocked = require('../controllers/http/http_by_domain_local_drill_blocked')(pool);
                    app.route('/http/http_by_domain_local_drill_blocked')
                    .get(authorization.requiresLogin, http_by_domain_local_drill_blocked.render);
    // SSL
        // SSL SERVER
            var ssl_server = require('../controllers/ssl/ssl_server')(pool);
            app.route('/ssl/ssl_server')
            .get(authorization.requiresLogin, ssl_server.render);       
        // LOCAL SSL
            var ssl_local = require('../controllers/ssl/ssl_local')(pool);
            app.route('/ssl/ssl_local')
            .get(authorization.requiresLogin, ssl_local.render);
        // REMOTE SSL
            var ssl_remote = require('../controllers/ssl/ssl_remote')(pool);
            app.route('/ssl/ssl_remote')
            .get(authorization.requiresLogin, ssl_remote.render);
    // EMAIL
        // LOCAL SMTP
            var smtp_senders = require('../controllers/email/smtp_senders')(pool);
            app.route('/email/smtp_senders')
            .get(authorization.requiresLogin, smtp_senders.render);
            // SMTP SENDER2RECEIVER
                var smtp_sender2receiver = require('../controllers/email/smtp_sender2receiver')(pool);
                app.route('/email/smtp_sender2receiver')
                .get(authorization.requiresLogin, smtp_sender2receiver.render);
                // SMTP FROM SENDER
                    var smtp_from_sender = require('../controllers/email/smtp_from_sender')(pool);
                    app.route('/email/smtp_from_sender')
                    .get(authorization.requiresLogin, smtp_from_sender.render);
        // SMTP RECEIVERS
            var smtp_receivers = require('../controllers/email/smtp_receivers')(pool);
            app.route('/email/smtp_receivers')
            .get(authorization.requiresLogin, smtp_receivers.render);
            // SMTP RECEIVER2SENDER
                var smtp_receiver2sender = require('../controllers/email/smtp_receiver2sender')(pool)
                app.route('/email/smtp_receiver2sender')
                .get(authorization.requiresLogin, smtp_receiver2sender.render);
        // SMTP SUBJECTS
            var smtp_subjects = require('../controllers/email/smtp_subjects')(pool);
            app.route('/email/smtp_subjects')
            .get(authorization.requiresLogin, smtp_subjects.render);
            // SMTP SUBJECT SENDER RECEIVER PAIRS
                var smtp_subject_sender_receiver_pairs = require('../controllers/email/smtp_subject_sender_receiver_pairs')(pool)
                app.route('/email/smtp_subject_sender_receiver_pairs')
                .get(authorization.requiresLogin, smtp_subject_sender_receiver_pairs.render);
                // SMTP FROM SENDER BY SUBJECT
                    var smtp_from_sender_by_subject = require('../controllers/email/smtp_from_sender_by_subject')(pool)
                    app.route('/email/smtp_from_sender_by_subject')
                    .get(authorization.requiresLogin, smtp_from_sender_by_subject.render);
    // EXTRACTED FILES
        // BY LOCAL IP
            var by_local_ip = require('../controllers/extracted_files/by_local_ip')(pool);
            app.route('/extracted_files/by_local_ip')
            .get(authorization.requiresLogin, by_local_ip.render);
            // BY FILE NAME
                var by_file_name = require('../controllers/extracted_files/by_file_name')(pool);
                app.route('/extracted_files/by_file_name')
                .get(authorization.requiresLogin, by_file_name.render);
                // FILE LOCAL
                    var file_local = require('../controllers/extracted_files/file_local')(pool);
                    app.route('/extracted_files/file_local')
                    .get(authorization.requiresLogin, file_local.render);
        // BY REMOTE IP
            var by_remote_ip = require('../controllers/extracted_files/by_remote_ip')(pool);
            app.route('/extracted_files/by_remote_ip')
            .get(authorization.requiresLogin, by_remote_ip.render); 
            // BY FILE NAME REMOTE
                var by_file_name_remote = require('../controllers/extracted_files/by_file_name_remote')(pool);
                app.route('/extracted_files/by_file_name_remote')
                .get(authorization.requiresLogin, by_file_name_remote.render); 
               // FILE REMOTE
                    var file_remote = require('../controllers/extracted_files/file_remote')(pool);
                    app.route('/extracted_files/file_remote')
                    .get(authorization.requiresLogin, file_remote.render);
        // BY MIME TYPE
            var by_mime_type = require('../controllers/extracted_files/by_mime_type')(pool);
            app.route('/extracted_files/by_mime_type')
            .get(authorization.requiresLogin, by_mime_type.render);
            // FILE MIME LOCAL
                var file_mime_local = require('../controllers/extracted_files/file_mime_local')(pool);
                app.route('/extracted_files/file_mime_local')
                .get(authorization.requiresLogin, file_mime_local.render);
        // BY DOMAIN
            var by_domain = require('../controllers/extracted_files/by_domain')(pool);
            app.route('/extracted_files/by_domain')
            .get(authorization.requiresLogin, by_domain.render);
            // BY DOMAIN LOCAL
                var by_domain_local = require('../controllers/extracted_files/by_domain_local')(pool);
                app.route('/extracted_files/by_domain_local')
                .get(authorization.requiresLogin, by_domain_local.render);
                // BY DOMAIN LOCAL MIME
                    var by_domain_local_mime = require('../controllers/extracted_files/by_domain_local_mime')(pool);
                    app.route('/extracted_files/by_domain_local_mime')
                    .get(authorization.requiresLogin, by_domain_local_mime.render);
                    // BY DOMAIN LOCAL MIME DRILL
                        var by_domain_local_mime_drill = require('../controllers/extracted_files/by_domain_local_mime_drill')(pool);
                        app.route('/extracted_files/by_domain_local_mime_drill')
                        .get(authorization.requiresLogin, by_domain_local_mime_drill.render);
    // FIRST SEEN
        // NEW REMOTE
            var new_remote = require('../controllers/first_seen/new_remote')(pool);
            app.route('/first_seen/new_remote')
            .get(authorization.requiresLogin, new_remote.render);
        // NEW DNS QUERIES
            var new_dns_queries = require('../controllers/first_seen/new_dns_queries')(pool);
            app.route('/first_seen/new_dns_queries')
            .get(authorization.requiresLogin, new_dns_queries.render);
        // NEW HTTP DOMAINS
            var new_http_domains = require('../controllers/first_seen/new_http_domains')(pool);
            app.route('/first_seen/new_http_domains')
            .get(authorization.requiresLogin, new_http_domains.render);
        // NEW SSL HOSTS
            var new_ssl_hosts = require('../controllers/first_seen/new_ssl_hosts')(pool);
            app.route('/first_seen/new_ssl_hosts')
            .get(authorization.requiresLogin, new_ssl_hosts.render);
        // NEW SSH REMOTE
            var new_ssh_remote = require('../controllers/first_seen/new_ssh_remote')(pool);
            app.route('/first_seen/new_ssh_remote')
            .get(authorization.requiresLogin, new_ssh_remote.render);
        // NEW FTP REMOTE
            var new_ftp_remote = require('../controllers/first_seen/new_ftp_remote')(pool);
            app.route('/first_seen/new_ftp_remote')
            .get(authorization.requiresLogin, new_ftp_remote.render);
    // HEALTH
        //OVERVIEW
            var overview = require('../controllers/health/overview')(pool); 
             app.route('/health/overview')
            .get(authorization.requiresLogin, overview.render);
            //HEALTH DRILL
                var health_drill = require('../controllers/health/health_drill')(pool);
                app.route('/health/health_drill')
                .get(authorization.requiresLogin, health_drill.render);
    // REPORTS
        // IOC EVENTS REPORT
            var ioc_events_report = require('../controllers/reports/ioc_events')(pool);
            app.route('/reports/ioc_events')
            .get(authorization.requiresLogin, ioc_events_report.render);
    // ARCHIVE
        var archive = require('../controllers/archive')(pool);
        app.route('/archive')
        .get(authorization.requiresLogin, archive.render);
    // UPLOAD
        var upload = require('../controllers/upload')(pool);
        app.route('/uploads')
        .post(authorization.requiresLogin, upload.render);   
};