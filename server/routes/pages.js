'use strict';

// Auth Check

module.exports = function(app, passport, version, io, pool) {
    var auth = require('./middlewares/authorization')();

    // LIVE CONNECTIONS
        var live_connections = require('../controllers/live_connections/live_connections')(pool);
        app.route('/live_connections/live_connections')
        .get(auth.permission, live_connections.render);
    // IOC NOTIFICATIONS
        // IOC EVENTS
            var ioc_events = require('../controllers/ioc_notifications/ioc_events')(pool);
            app.route('/ioc_notifications/ioc_events')
            .get(auth.permission, ioc_events.render);
            // IOC EVENTS DRILLDOWN
                var ioc_events_drilldown = require('../controllers/ioc_notifications/ioc_events_drilldown')(pool);
                app.route('/ioc_notifications/ioc_events_drilldown')
                    .get(auth.permission, ioc_events_drilldown.render)
                    .post(auth.permission, ioc_events_drilldown.set_info);
                app.route('/ioc_notifications/ioc_events_drilldown/patterns')
                    .post(auth.permission, ioc_events_drilldown.pattern);
        // IOC REMOTE
            var ioc_remote = require('../controllers/ioc_notifications/ioc_remote')(pool);
             app.route('/ioc_notifications/ioc_remote')
            .get(auth.permission, ioc_remote.render);
            // IOC REMOTE2LOCAL
                var ioc_remote2local = require('../controllers/ioc_notifications/ioc_remote2local')(pool);
                app.route('/ioc_notifications/ioc_remote2local')
                .get(auth.permission, ioc_remote2local.render);
        // IOC LOCAL
            var ioc_local = require('../controllers/ioc_notifications/ioc_local')(pool);
            app.route('/ioc_notifications/ioc_local')
            .get(auth.permission, ioc_local.render);
            // IOC LOCAL DRILL
                var ioc_local_drill = require('../controllers/ioc_notifications/ioc_local_drill')(pool);
                app.route('/ioc_notifications/ioc_local_drill')
                .get(auth.permission, ioc_local_drill.render);
    // GENERAL NETWORK
        // LOCAL
            var local = require('../controllers/general_network/local')(pool);
            app.route('/general_network/local')
            .get(auth.permission, local.render);
            // LOCAL2REMOTE
                var local2remote = require('../controllers/general_network/local2remote')(pool);
                app.route('/general_network/local2remote')
                .get(auth.permission, local2remote.render);
        // REMOTE
            var remote = require('../controllers/general_network/remote')(pool);
            app.route('/general_network/remote')
            .get(auth.permission, remote.render);
            // REMOTE2LOCAL
                var remote2local = require('../controllers/general_network/remote2local')(pool);
                app.route('/general_network/remote2local')
                .get(auth.permission, remote2local.render);
                // SHARED
                    var shared = require('../controllers/general_network/shared')(pool);
                    app.route('/general_network/shared')
                    .get(auth.permission, shared.render);
        // SSH
            var ssh_local = require('../controllers/general_network/ssh_local')(pool);
            app.route('/general_network/ssh_local')
            .get(auth.permission, ssh_local.render);
            // SSH REMOTE
                var ssh_local2remote = require('../controllers/general_network/ssh_local2remote')(pool);
                app.route('/general_network/ssh_local2remote')
                .get(auth.permission, ssh_local2remote.render);
                // SSH REMOTE SHARED
                    var ssh_shared = require('../controllers/general_network/ssh_shared')(pool);
                    app.route('/general_network/ssh_shared')
                    .get(auth.permission, ssh_shared.render);
        // REMOTE2LOCAL SSH
            var ssh_remote = require('../controllers/general_network/ssh_remote')(pool);
            app.route('/general_network/ssh_remote')
            .get(auth.permission, ssh_remote.render);
            // SSH REMOTE
                var ssh_remote2local = require('../controllers/general_network/ssh_remote2local')(pool);
                app.route('/general_network/ssh_remote2local')
                .get(auth.permission, ssh_remote2local.render);
        // SSH STATUS
            var ssh_status = require('../controllers/general_network/ssh_status')(pool);
            app.route('/general_network/ssh_status')
            .get(auth.permission, ssh_status.render);   
            // SSH STATUS LOCAL
                var ssh_status_local = require('../controllers/general_network/ssh_status_local')(pool);
                app.route('/general_network/ssh_status_local')
                .get(auth.permission, ssh_status_local.render);
                // SSH STATUS LOCAL DRILL
                    var ssh_status_local_drill = require('../controllers/general_network/ssh_status_local_drill')(pool);
                    app.route('/general_network/ssh_status_local_drill')
                    .get(auth.permission, ssh_status_local_drill.render);
        // LOCAL IRC
            var irc_local = require('../controllers/general_network/irc_local')(pool);
            app.route('/general_network/irc_local')
            .get(auth.permission, irc_local.render);
            // LOCAL2REMOTE IRC
                var irc_local2remote = require('../controllers/general_network/irc_local2remote')(pool);
                app.route('/general_network/irc_local2remote')
                .get(auth.permission, irc_local2remote.render);
                // IRC SHARED
                    var irc_shared = require('../controllers/general_network/irc_shared')(pool);
                    app.route('/general_network/irc_shared')
                    .get(auth.permission, irc_shared.render);
        // REMOTE IRC
            var irc_remote = require('../controllers/general_network/irc_remote')(pool);
            app.route('/general_network/irc_remote')
            .get(auth.permission, irc_remote.render);
            // REMOTE2LOCAL IRC
                var irc_remote2local = require('../controllers/general_network/irc_remote2local')(pool);
                app.route('/general_network/irc_remote2local')
                .get(auth.permission, irc_remote2local.render);
        // LOCAL FTP
            var ftp_local = require('../controllers/general_network/ftp_local')(pool);
            app.route('/general_network/ftp_local')
            .get(auth.permission, ftp_local.render);
            // LOCAL2REMOTE FTP
                var ftp_local2remote = require('../controllers/general_network/ftp_local2remote')(pool);
                app.route('/general_network/ftp_local2remote')
                .get(auth.permission, ftp_local2remote.render);
                // FTP SHARED
                var ftp_shared = require('../controllers/general_network/ftp_shared')(pool);
                app.route('/general_network/ftp_shared')
                .get(auth.permission, ftp_shared.render);
        // REMOTE FTP
            var ftp_remote = require('../controllers/general_network/ftp_remote')(pool);
            app.route('/general_network/ftp_remote')
            .get(auth.permission, ftp_remote.render);   
            // REMOTE2LOCAL FTP
                var ftp_remote2local = require('../controllers/general_network/ftp_remote2local')(pool);
                app.route('/general_network/ftp_remote2local')
                .get(auth.permission, ftp_remote2local.render);
        // FIREWALL
            var firewall = require('../controllers/general_network/firewall')(pool); 
            app.route('/general_network/firewall')
            .get(auth.permission, firewall.render);
    // STEALTH
        // STEALTH DEPLOY CONFIG
            var stealth_deploy_config = require('../controllers/stealth/stealth_deploy_config')(pool); 
            app.route('/stealth/stealth_deploy_config')
            .get(auth.permission, stealth_deploy_config.render)
            .post(auth.permission, stealth_deploy_config.set_info);
        // STEALTH OP VIEW
            var stealth_op_view = require('../controllers/stealth/stealth_op_view')(pool); 
            app.route('/stealth/stealth_op_view')
            .get(auth.permission, stealth_op_view.render)
            .post(auth.permission, stealth_op_view.set_info);
        // STEALTH CONN
            var stealth_conn = require('../controllers/stealth/stealth_conn')(pool);
            app.route('/stealth/stealth_conn')
            .get(auth.permission, stealth_conn.render);
            // STEALTH CONN BY USER
                var stealth_conn_by_user = require('../controllers/stealth/stealth_conn_by_user')(pool);
                app.route('/stealth/stealth_conn_by_user')
                .get(auth.permission, stealth_conn_by_user.render);
                // STEALTH CONN BY USER AND REMOTE
                    var stealth_conn_by_userANDremote = require('../controllers/stealth/stealth_conn_by_userANDremote')(pool);
                    app.route('/stealth/stealth_conn_by_userANDremote')
                    .get(auth.permission, stealth_conn_by_userANDremote.render);
        // STEALTH QUARANTINE
            var stealth_quarantine = require('../controllers/stealth/stealth_quarantine')(pool); 
            app.route('/stealth/stealth_quarantine')
            .get(auth.permission, stealth_quarantine.render);
    // LOCAL EVENTS        
        // ENDPOINT MAP
            var endpoint_map = require('../controllers/local_events/endpoint_map')(pool);
            app.route('/local_events/endpoint_map')
            .get(auth.permission, endpoint_map.render) 
            .post(auth.permission, endpoint_map.updatefp); 
        // ENDPOINT BY TYPE
            var endpoint_by_type = require('../controllers/local_events/endpoint_by_type')(pool);
            app.route('/local_events/endpoint_by_type')
            .get(auth.permission, endpoint_by_type.render);
            // ENDPOINT EVENTS USER
                var endpoint_by_type_and_user = require('../controllers/local_events/endpoint_by_type_and_user')(pool);
                app.route('/local_events/endpoint_by_type_and_user')
                .get(auth.permission, endpoint_by_type_and_user.render);
                // ENDPOINT EVENTS USER DRILL
                    var endpoint_full = require('../controllers/local_events/endpoint_full')(pool);
                    app.route('/local_events/endpoint_full')
                    .get(auth.permission, endpoint_full.render);
        // ENDPOINT BY USER
            var endpoint_by_user = require('../controllers/local_events/endpoint_by_user')(pool);
            app.route('/local_events/endpoint_by_user')
            .get(auth.permission, endpoint_by_user.render);
            // ENDPOINT EVENTS LOCAL BY ALERT INFO
                var endpoint_by_user_and_type = require('../controllers/local_events/endpoint_by_user_and_type')(pool);
                app.route('/local_events/endpoint_by_user_and_type')
                .get(auth.permission, endpoint_by_user_and_type.render);
        // ENDPOINT EVENTS SHAREPOINT
            var endpoint_events_sharepoint = require('../controllers/local_events/endpoint_events_sharepoint')(pool);
            app.route('/local_events/endpoint_events_sharepoint')
            .get(auth.permission, endpoint_events_sharepoint.render);
            // ENDPOINT EVENTS SHAREPOINT DRILL
                var endpoint_events_sharepoint_drill = require('../controllers/local_events/endpoint_events_sharepoint_drill')(pool);
                app.route('/local_events/endpoint_events_sharepoint_drill')
                .get(auth.permission, endpoint_events_sharepoint_drill.render); 
                    // ENDPOINT EVENTS SHAREPOINT FULL
                    var endpoint_events_sharepoint_full = require('../controllers/local_events/endpoint_events_sharepoint_full')(pool);
                    app.route('/local_events/endpoint_events_sharepoint_full')
                    .get(auth.permission, endpoint_events_sharepoint_full.render); 
            // ENDPOINT BY LOCAL BY IP
                var endpoint_by_user_and_ip = require('../controllers/local_events/endpoint_by_user_and_ip')(pool);
                app.route('/local_events/endpoint_by_user_and_ip')
                .get(auth.permission, endpoint_by_user_and_ip.render); 
    // APPLICATIONS
        // BY APPLICATION
            var app_by_application = require('../controllers/applications/app_by_application')(pool);
            app.route('/applications/app_by_application')
            .get(auth.permission, app_by_application.render);
            // APPLICATION DRILL
                var application_drill = require('../controllers/applications/application_drill')(pool);
                app.route('/applications/application_drill')
                .get(auth.permission, application_drill.render);
                // APPLICATION LOCAL
                    var application_local = require('../controllers/applications/application_local')(pool);
                    app.route('/applications/application_local')
                    .get(auth.permission, application_local.render);
        // BY LOCAL IP
            var app_by_local_ip = require('../controllers/applications/app_by_local_ip')(pool);
            app.route('/applications/app_by_local_ip')
            .get(auth.permission, app_by_local_ip.render);  
            // L7 LOCAL APP
                var l7_local_app = require('../controllers/applications/l7_local_app')(pool);
                app.route('/applications/l7_local_app')
                .get(auth.permission, l7_local_app.render);
                // l7 LOCAL DRILL
                    var l7_local_drill = require('../controllers/applications/l7_local_drill')(pool);
                    app.route('/applications/l7_local_drill')
                    .get(auth.permission, l7_local_drill.render);
                    // l7 SHARED
                        var l7_shared = require('../controllers/applications/l7_shared')(pool);
                        app.route('/applications/l7_shared')
                        .get(auth.permission, l7_shared.render);
        // BY REMOTE IP
            var app_by_remote_ip = require('../controllers/applications/app_by_remote_ip')(pool);
            app.route('/applications/app_by_remote_ip')
            .get(auth.permission, app_by_remote_ip.render); 
            // L7 REMOTE APP
                var l7_remote_app = require('../controllers/applications/l7_remote_app')(pool);
                app.route('/applications/l7_remote_app')
                .get(auth.permission, l7_remote_app.render); 
                // l7 REMOTE DRILL
                    var l7_remote_drill = require('../controllers/applications/l7_remote_drill')(pool);
                    app.route('/applications/l7_remote_drill')
                    .get(auth.permission, l7_remote_drill.render);
    // DNS
        // DNS BY QUERY TYPE
            var dns_by_query_type = require('../controllers/dns/dns_by_query_type')(pool);
            app.route('/dns/dns_by_query_type')
            .get(auth.permission, dns_by_query_type.render);
            // DNS BY QUERY TYPE LOCAL
                var dns_by_query_type_local = require('../controllers/dns/dns_by_query_type_local')(pool);
                app.route('/dns/dns_by_query_type_local')
                .get(auth.permission, dns_by_query_type_local.render);
                // DNS BY QUERY TYPE DRILL
                    var dns_by_query_type_local_drill = require('../controllers/dns/dns_by_query_type_local_drill')(pool);
                    app.route('/dns/dns_by_query_type_local_drill')
                    .get(auth.permission, dns_by_query_type_local_drill.render);
        // LOCAL DNS
            var dns_local = require('../controllers/dns/dns_local')(pool);
            app.route('/dns/dns_local')
            .get(auth.permission, dns_local.render);
        // REMOTE DNS
            var dns_remote = require('../controllers/dns/dns_remote')(pool);
            app.route('/dns/dns_remote')
            .get(auth.permission, dns_remote.render);
    // HTTP
        // HTTP BY DOMAIN
            var http_by_domain = require('../controllers/http/http_by_domain')(pool);
            app.route('/http/http_by_domain')
            .get(auth.permission, http_by_domain.render);
            // HTTP BY DOMAIN LOCAL
                var http_by_domain_local = require('../controllers/http/http_by_domain_local')(pool);
                app.route('/http/http_by_domain_local')
                .get(auth.permission, http_by_domain_local.render);
                // HTTP BY DOMAIN LOCAL DRILL
                    var http_by_domain_local_drill = require('../controllers/http/http_by_domain_local_drill')(pool);
                    app.route('/http/http_by_domain_local_drill')
                    .get(auth.permission, http_by_domain_local_drill.render);
        // HTTP LOCAL
            var http_local = require('../controllers/http/http_local')(pool);
            app.route('/http/http_local')
            .get(auth.permission, http_local.render);    
            // HTTP LOCAL BY DOMAIN
                var http_local_by_domain = require('../controllers/http/http_local_by_domain')(pool);
                app.route('/http/http_local_by_domain')
                .get(auth.permission, http_local_by_domain.render);
        // HTTP REMOTE
            var http_remote = require('../controllers/http/http_remote')(pool);
            app.route('/http/http_remote')
            .get(auth.permission, http_remote.render);
            // HTTP REMOTE2LOCAL
                var http_remote2local = require('../controllers/http/http_remote2local')(pool);
                app.route('/http/http_remote2local')
                .get(auth.permission, http_remote2local.render);
                // HTTP REMOTE2LOCAL DRILL
                    var http_remote2local_drill = require('../controllers/http/http_remote2local_drill')(pool);
                    app.route('/http/http_remote2local_drill')
                    .get(auth.permission, http_remote2local_drill.render);
        // HTTP LOCAL BLOCKED
            var http_local_blocked = require('../controllers/http/http_local_blocked')(pool);
            app.route('/http/http_local_blocked')
            .get(auth.permission, http_local_blocked.render);    
            // HTTP LOCAL BY DOMAIN BLOCKED
                var http_local_by_domain_blocked = require('../controllers/http/http_local_by_domain_blocked')(pool);
                app.route('/http/http_local_by_domain_blocked')
                .get(auth.permission, http_local_by_domain_blocked.render);
                // HTTP BY DOMAIN LOCAL DRILL BLOCKED
                    var http_by_domain_local_drill_blocked = require('../controllers/http/http_by_domain_local_drill_blocked')(pool);
                    app.route('/http/http_by_domain_local_drill_blocked')
                    .get(auth.permission, http_by_domain_local_drill_blocked.render);
    // SSL
        // SSL SERVER
            var ssl_server = require('../controllers/ssl/ssl_server')(pool);
            app.route('/ssl/ssl_server')
            .get(auth.permission, ssl_server.render);       
        // LOCAL SSL
            var ssl_local = require('../controllers/ssl/ssl_local')(pool);
            app.route('/ssl/ssl_local')
            .get(auth.permission, ssl_local.render);
        // REMOTE SSL
            var ssl_remote = require('../controllers/ssl/ssl_remote')(pool);
            app.route('/ssl/ssl_remote')
            .get(auth.permission, ssl_remote.render);
    // EMAIL
        // LOCAL SMTP
            var smtp_senders = require('../controllers/email/smtp_senders')(pool);
            app.route('/email/smtp_senders')
            .get(auth.permission, smtp_senders.render);
            // SMTP SENDER2RECEIVER
                var smtp_sender2receiver = require('../controllers/email/smtp_sender2receiver')(pool);
                app.route('/email/smtp_sender2receiver')
                .get(auth.permission, smtp_sender2receiver.render);
                // SMTP FROM SENDER
                    var smtp_from_sender = require('../controllers/email/smtp_from_sender')(pool);
                    app.route('/email/smtp_from_sender')
                    .get(auth.permission, smtp_from_sender.render);
        // SMTP RECEIVERS
            var smtp_receivers = require('../controllers/email/smtp_receivers')(pool);
            app.route('/email/smtp_receivers')
            .get(auth.permission, smtp_receivers.render);
            // SMTP RECEIVER2SENDER
                var smtp_receiver2sender = require('../controllers/email/smtp_receiver2sender')(pool)
                app.route('/email/smtp_receiver2sender')
                .get(auth.permission, smtp_receiver2sender.render);
        // SMTP SUBJECTS
            var smtp_subjects = require('../controllers/email/smtp_subjects')(pool);
            app.route('/email/smtp_subjects')
            .get(auth.permission, smtp_subjects.render);
            // SMTP SUBJECT SENDER RECEIVER PAIRS
                var smtp_subject_sender_receiver_pairs = require('../controllers/email/smtp_subject_sender_receiver_pairs')(pool)
                app.route('/email/smtp_subject_sender_receiver_pairs')
                .get(auth.permission, smtp_subject_sender_receiver_pairs.render);
                // SMTP FROM SENDER BY SUBJECT
                    var smtp_from_sender_by_subject = require('../controllers/email/smtp_from_sender_by_subject')(pool)
                    app.route('/email/smtp_from_sender_by_subject')
                    .get(auth.permission, smtp_from_sender_by_subject.render);
    // EXTRACTED FILES
        // BY LOCAL IP
            var by_local_ip = require('../controllers/extracted_files/by_local_ip')(pool);
            app.route('/extracted_files/by_local_ip')
            .get(auth.permission, by_local_ip.render);
            // BY FILE NAME
                var by_file_name = require('../controllers/extracted_files/by_file_name')(pool);
                app.route('/extracted_files/by_file_name')
                .get(auth.permission, by_file_name.render);
                // FILE LOCAL
                    var file_local = require('../controllers/extracted_files/file_local')(pool);
                    app.route('/extracted_files/file_local')
                    .get(auth.permission, file_local.render);
        // BY REMOTE IP
            var by_remote_ip = require('../controllers/extracted_files/by_remote_ip')(pool);
            app.route('/extracted_files/by_remote_ip')
            .get(auth.permission, by_remote_ip.render); 
            // BY FILE NAME REMOTE
                var by_file_name_remote = require('../controllers/extracted_files/by_file_name_remote')(pool);
                app.route('/extracted_files/by_file_name_remote')
                .get(auth.permission, by_file_name_remote.render); 
               // FILE REMOTE
                    var file_remote = require('../controllers/extracted_files/file_remote')(pool);
                    app.route('/extracted_files/file_remote')
                    .get(auth.permission, file_remote.render);
        // BY MIME TYPE
            var by_mime_type = require('../controllers/extracted_files/by_mime_type')(pool);
            app.route('/extracted_files/by_mime_type')
            .get(auth.permission, by_mime_type.render);
            // FILE MIME LOCAL
                var file_mime_local = require('../controllers/extracted_files/file_mime_local')(pool);
                app.route('/extracted_files/file_mime_local')
                .get(auth.permission, file_mime_local.render);
        // BY DOMAIN
            var by_domain = require('../controllers/extracted_files/by_domain')(pool);
            app.route('/extracted_files/by_domain')
            .get(auth.permission, by_domain.render);
            // BY DOMAIN LOCAL
                var by_domain_local = require('../controllers/extracted_files/by_domain_local')(pool);
                app.route('/extracted_files/by_domain_local')
                .get(auth.permission, by_domain_local.render);
                // BY DOMAIN LOCAL MIME
                    var by_domain_local_mime = require('../controllers/extracted_files/by_domain_local_mime')(pool);
                    app.route('/extracted_files/by_domain_local_mime')
                    .get(auth.permission, by_domain_local_mime.render);
                    // BY DOMAIN LOCAL MIME DRILL
                        var by_domain_local_mime_drill = require('../controllers/extracted_files/by_domain_local_mime_drill')(pool);
                        app.route('/extracted_files/by_domain_local_mime_drill')
                        .get(auth.permission, by_domain_local_mime_drill.render);
    // FIRST SEEN
        // NEW REMOTE
            var new_remote = require('../controllers/first_seen/new_remote')(pool);
            app.route('/first_seen/new_remote')
            .get(auth.permission, new_remote.render);
        // NEW DNS QUERIES
            var new_dns_queries = require('../controllers/first_seen/new_dns_queries')(pool);
            app.route('/first_seen/new_dns_queries')
            .get(auth.permission, new_dns_queries.render);
        // NEW HTTP DOMAINS
            var new_http_domains = require('../controllers/first_seen/new_http_domains')(pool);
            app.route('/first_seen/new_http_domains')
            .get(auth.permission, new_http_domains.render);
        // NEW SSL HOSTS
            var new_ssl_hosts = require('../controllers/first_seen/new_ssl_hosts')(pool);
            app.route('/first_seen/new_ssl_hosts')
            .get(auth.permission, new_ssl_hosts.render);
        // NEW SSH REMOTE
            var new_ssh_remote = require('../controllers/first_seen/new_ssh_remote')(pool);
            app.route('/first_seen/new_ssh_remote')
            .get(auth.permission, new_ssh_remote.render);
        // NEW FTP REMOTE
            var new_ftp_remote = require('../controllers/first_seen/new_ftp_remote')(pool);
            app.route('/first_seen/new_ftp_remote')
            .get(auth.permission, new_ftp_remote.render);
    // HEALTH
        //OVERVIEW
            var overview = require('../controllers/health/overview')(pool); 
             app.route('/health/overview')
            .get(auth.permission, overview.render);
            //HEALTH DRILL
                var health_drill = require('../controllers/health/health_drill')(pool);
                app.route('/health/health_drill')
                .get(auth.permission, health_drill.render);
    // REPORTS
        // IOC EVENTS REPORT
            var ioc_events_report = require('../controllers/reports/ioc_events')(pool);
            app.route('/reports/ioc_events')
            .get(auth.permission, ioc_events_report.render);
    // ARCHIVE
        var archive = require('../controllers/archive')(pool);
        app.route('/archive')
        .get(auth.permission, archive.render);
    // UPLOAD
        var upload = require('../controllers/upload')(pool);
        app.route('/uploads')
        .post(auth.permission, upload.render);   
};
