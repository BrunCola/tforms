'use strict';

// Auth Check
var authorization = require('./middlewares/authorization');

// LIVE CONNECTION
var live_connections = require('../controllers/live_connections/live_connections');

// IOC NOTIFICATIONS
	// IOC EVENTS
	var ioc_events = require('../controllers/ioc_notifications/ioc_events');
		// IOC EVENTS DRILLDOWN
		var ioc_events_drilldown = require('../controllers/ioc_notifications/ioc_events_drilldown');
	// IOC TOP REMOTE IPs
	var ioc_top_remote_ips = require('../controllers/ioc_notifications/ioc_top_remote_ips');
		// IOC TOP REMOTE2LOCAL
		var ioc_top_remote2local = require('../controllers/ioc_notifications/ioc_top_remote2local');
	// IOC TOP LOCAL IPs
	var ioc_top_local_ips = require('../controllers/ioc_notifications/ioc_top_local_ips');
		// IOC TOP LOCAL IPs DRILL
		var ioc_top_local_ips_drill = require('../controllers/ioc_notifications/ioc_top_local_ips_drill');

// EXTRACTED FILES
	// BY LOCAL IP
	var by_local_ip = require('../controllers/extracted_files/by_local_ip');
		// BY FILE NAME
		var by_file_name = require('../controllers/extracted_files/by_file_name');
			// FILE LOCAL
			var file_local = require('../controllers/extracted_files/file_local');
	// BY REMOTE IP
	var by_remote_ip = require('../controllers/extracted_files/by_remote_ip');
		// BY FILE NAME REMOTE
		var by_file_name_remote = require('../controllers/extracted_files/by_file_name_remote');
			// FILE REMOTE
			var file_remote = require('../controllers/extracted_files/file_remote');
	// BY MIME TYPE
	var by_mime_type = require('../controllers/extracted_files/by_mime_type');
		// FILE MIME LOCAL
		var file_mime_local = require('../controllers/extracted_files/file_mime_local');

// EXTRACTED FILES
	// NEW REMOTE IPS
	var new_remote_ips = require('../controllers/first_seen/new_remote_ips');
	// NEW DNS QUERIES
	var new_dns_queries = require('../controllers/first_seen/new_dns_queries');
	// NEW HTTP DOMAINS
	var new_http_domains = require('../controllers/first_seen/new_http_domains');
	// NEW SSL HOSTS
	var new_ssl_hosts = require('../controllers/first_seen/new_ssl_hosts');
	// NEW SSH REMOTE IPS
	var new_ssh_remote_ips = require('../controllers/first_seen/new_ssh_remote_ips');
	// NEW FTP REMOTE IPS
	var new_ftp_remote_ips = require('../controllers/first_seen/new_ftp_remote_ips');

// APPLICATIONS
	// BY APPLICATION
	var app_by_application = require('../controllers/applications/app_by_application');
		// APPLICATION DRILL
		var application_drill = require('../controllers/applications/application_drill');
			// APPLICATION LOCAL
			var application_local = require('../controllers/applications/application_local');
	// BY LOCAL IP
	var app_by_local_ip = require('../controllers/applications/app_by_local_ip');
		// L7 TOPLOCAL APP
		var l7_toplocal_app = require('../controllers/applications/l7_toplocal_app');
			// l7 TOPLOCAL DRILL
			var l7_toplocal_drill = require('../controllers/applications/l7_toplocal_drill');
				// l7 TOP SHARED
				var l7_top_shared = require('../controllers/applications/l7_top_shared');
	// BY REMOTE IP
	var app_by_remote_ip = require('../controllers/applications/app_by_remote_ip');
		// L7 TOPREMOTE APP
		var l7_topremote_app = require('../controllers/applications/l7_topremote_app');
			// l7 TOPREMOTE DRILL
			var l7_topremote_drill = require('../controllers/applications/l7_topremote_drill');

//EMAIL
	// TOP LOCAL SMTP 
	var top_local_smtp = require('../controllers/email/top_local_smtp');
		// TOP SMTP SENDER2RECEIVER
		var top_smtp_sender2receiver = require('../controllers/email/top_smtp_sender2receiver');	
			// TOP SMTP FROM SENDER
			var top_smtp_from_sender = require('../controllers/email/top_smtp_from_sender');	
	// TOP SMTP RECEIVERS
	var top_smtp_receivers = require('../controllers/email/top_smtp_receivers');
		// TOP SMTP RECEIVER2SENDER
		var top_smtp_receiver2sender = require('../controllers/email/top_smtp_receiver2sender')
	// TOP SMTP SUBJECTS
	var top_smtp_subjects = require('../controllers/email/top_smtp_subjects');

// GENERAL NETWORK
	// TOP LOCAL IPS
	var top_local_ips = require('../controllers/general_network/top_local_ips');
		// TOP LOCAL2REMOTE
		var top_local2remote = require('../controllers/general_network/top_local2remote');
	// TOP REMOTE IPS
	var top_remote_ips = require('../controllers/general_network/top_remote_ips');
		// TOP REMOTE2LOCAL
		var top_remote2local = require('../controllers/general_network/top_remote2local');
			// TOP IPS SHARED
			var top_ips_shared = require('../controllers/general_network/top_ips_shared');
	// TOP ENDPOINT EVENTS
	var top_endpoint_events = require('../controllers/general_network/top_endpoint_events');
		// TOP ENDPOINT EVENTS USER
		var top_endpoint_events_user = require('../controllers/general_network/top_endpoint_events_user');
			// TOP ENDPOINT EVENTS USER DRILL
			var top_endpoint_events_user_drill = require('../controllers/general_network/top_endpoint_events_user_drill');
	// TOP SSH
	var top_ssh = require('../controllers/general_network/top_ssh');
		// TOP SSH REMOTE
		var top_ssh_remote = require('../controllers/general_network/top_ssh_remote');
			// TOP SSH REMOTE SHARED
			var top_ssh_remote_shared = require('../controllers/general_network/top_ssh_remote_shared');
	// TOP REMOTE2LOCAL SSH
	var top_remote2local_ssh = require('../controllers/general_network/top_remote2local_ssh');
		// TOP SSH REMOTE
		var top_remote2local_ssh_local = require('../controllers/general_network/top_remote2local_ssh_local');
	// TOP LOCAL IRC
	var top_local_irc = require('../controllers/general_network/top_local_irc');	
		// TOP LOCAL2REMOTE IRC
		var top_local2remote_irc = require('../controllers/general_network/top_local2remote_irc');	
			// TOP IRC SHARED
			var top_irc_shared = require('../controllers/general_network/top_irc_shared');
	// TOP REMOTE IRC
	var top_remote_irc = require('../controllers/general_network/top_remote_irc');	
		// TOP REMOTE2LOCAL IRC
		var top_remote2local_irc = require('../controllers/general_network/top_remote2local_irc');	
	// TOP LOCAL FTP
	var top_local_ftp = require('../controllers/general_network/top_local_ftp');
		// TOP LOCAL2REMOTE FTP
		var top_local2remote_ftp = require('../controllers/general_network/top_local2remote_ftp');
			// TOP FTP SHARED
			var top_ftp_shared = require('../controllers/general_network/top_ftp_shared');
	// TOP REMOTE FTP
	var top_remote_ftp = require('../controllers/general_network/top_remote_ftp'); 
		// TOP REMOTE2LOCAL FTP
		var top_remote2local_ftp = require('../controllers/general_network/top_remote2local_ftp');
// REPORTS
	// IOC EVENTS REPORT
	var ioc_events_report = require('../controllers/reports/ioc_events');	

// ARCHIVE
	var archive = require('../controllers/archive');

module.exports = function(app) {
	// LIVE CONNECTIONS
	app.route('/live_connections/live_connections')
	.get(authorization.requiresLogin, live_connections.render);

	// IOC NOTIFICATIONS
		// IOC EVENTS
		app.route('/ioc_notifications/ioc_events')
		.get(authorization.requiresLogin, ioc_events.render);
			// IOC EVENTS DRILLDOWN
			app.route('/ioc_notifications/ioc_events_drilldown')
			.get(authorization.requiresLogin, ioc_events_drilldown.render);
		// IOC TOP REMOTE IPs
		app.route('/ioc_notifications/ioc_top_remote_ips')
		.get(authorization.requiresLogin, ioc_top_remote_ips.render);
			// IOC TOP REMOTE2LOCAL
			app.route('/ioc_notifications/ioc_top_remote2local')
			.get(authorization.requiresLogin, ioc_top_remote2local.render);
		// IOC TOP LOCAL IPs
		app.route('/ioc_notifications/ioc_top_local_ips')
		.get(authorization.requiresLogin, ioc_top_local_ips.render);
			// IOC TOP LOCAL IPs DRILL
			app.route('/ioc_notifications/ioc_top_local_ips_drill')
			.get(authorization.requiresLogin, ioc_top_local_ips_drill.render);

	// EXTRACTED FILES
		// BY LOCAL IP
		app.route('/extracted_files/by_local_ip')
		.get(authorization.requiresLogin, by_local_ip.render);
			// BY FILE NAME
			app.route('/extracted_files/by_file_name')
			.get(authorization.requiresLogin, by_file_name.render);
				// FILE LOCAL
				app.route('/extracted_files/file_local')
				.get(authorization.requiresLogin, file_local.render);
		// BY REMOTE IP
		app.route('/extracted_files/by_remote_ip')
		.get(authorization.requiresLogin, by_remote_ip.render);
			// BY FILE NAME REMOTE
			app.route('/extracted_files/by_file_name_remote')
			.get(authorization.requiresLogin, by_file_name_remote.render);
				// FILE REMOTE
				app.route('/extracted_files/file_remote')
				.get(authorization.requiresLogin, file_remote.render);
		// BY MIME TYPE
		app.route('/extracted_files/by_mime_type')
		.get(authorization.requiresLogin, by_mime_type.render);
			// BY MIME TYPE
			app.route('/extracted_files/file_mime_local')
			.get(authorization.requiresLogin, file_mime_local.render);

	// FIRST SEEN
		// NEW REMOTE IPS
		app.route('/first_seen/new_remote_ips')
		.get(authorization.requiresLogin, new_remote_ips.render);
		// NEW DNS QUERIES
		app.route('/first_seen/new_dns_queries')
		.get(authorization.requiresLogin, new_dns_queries.render);
		// NEW HTTP DOMAINS
		app.route('/first_seen/new_http_domains')
		.get(authorization.requiresLogin, new_http_domains.render);
		// NEW SSL HOSTS
		app.route('/first_seen/new_ssl_hosts')
		.get(authorization.requiresLogin, new_ssl_hosts.render);
		// NEW SSH REMOTE REMOTE IPS
		app.route('/first_seen/new_ssh_remote_ips')
		.get(authorization.requiresLogin, new_ssh_remote_ips.render);
		// NEW FTP REMOTE IPS
		app.route('/first_seen/new_ftp_remote_ips')
		.get(authorization.requiresLogin, new_ftp_remote_ips.render);

	// APPLICATIONS
		// BY APPLICATION
		app.route('/applications/app_by_application')
		.get(authorization.requiresLogin, app_by_application.render);
			// APPLICATION DRILL
			app.route('/applications/application_drill')
			.get(authorization.requiresLogin, application_drill.render);
				// APPLICATION LOCAL
				app.route('/applications/application_local')
				.get(authorization.requiresLogin, application_local.render);
		// BY LOCAL IP
		app.route('/applications/app_by_local_ip')
		.get(authorization.requiresLogin, app_by_local_ip.render);
			// L7 TOPLOCAL APP
			app.route('/applications/l7_toplocal_app')
			.get(authorization.requiresLogin, l7_toplocal_app.render);
				// L7 TOPLOCAL DRILL
				app.route('/applications/l7_toplocal_drill')
				.get(authorization.requiresLogin, l7_toplocal_drill.render);
					// L7 TOP SHARED
					app.route('/applications/l7_top_shared')
					.get(authorization.requiresLogin, l7_top_shared.render);
		// BY REMOTE IP
		app.route('/applications/app_by_remote_ip')
		.get(authorization.requiresLogin, app_by_remote_ip.render);
			// L7 TOPREMOTE APP
			app.route('/applications/l7_topremote_app')
			.get(authorization.requiresLogin, l7_topremote_app.render);
				// L7 TOPREMOTE DRILL
				app.route('/applications/l7_topremote_drill')
				.get(authorization.requiresLogin, l7_topremote_drill.render);

	//EMAIL
		// TOP LOCAL SMTP
		app.route('/email/top_local_smtp')
		.get(authorization.requiresLogin, top_local_smtp.render);
			// TOP SMTP SENDER2RECEIVER
			app.route('/email/top_smtp_sender2receiver')
			.get(authorization.requiresLogin, top_smtp_sender2receiver.render);
				// TOP SMTP FROM SENDER
				app.route('/email/top_smtp_from_sender')
				.get(authorization.requiresLogin, top_smtp_from_sender.render);
		// TOP SMTP RECEIVERS
		app.route('/email/top_smtp_receivers')
		.get(authorization.requiresLogin, top_smtp_receivers.render);
			// TOP SMTP RECEIVER2SENDER
			app.route('/email/top_smtp_receiver2sender')
			.get(authorization.requiresLogin, top_smtp_receiver2sender.render);
		// TOP SMTP SUBJECTS
		app.route('/email/top_smtp_subjects')
		.get(authorization.requiresLogin, top_smtp_subjects.render);
		
	// GENERAL NETWORK
		// TOP LOCAL IPS
		app.route('/general_network/top_local_ips')
		.get(authorization.requiresLogin, top_local_ips.render);
			// TOP LOCAL2REMOTE
			app.route('/general_network/top_local2remote')
			.get(authorization.requiresLogin, top_local2remote.render);
				// TOP IPS SHARED
				app.route('/general_network/top_ips_shared')
				.get(authorization.requiresLogin, top_ips_shared.render);
		// TOP REMOTE IPS
		app.route('/general_network/top_remote_ips')
		.get(authorization.requiresLogin, top_remote_ips.render);
			// TOP REMOTE2LOCAL
			app.route('/general_network/top_remote2local')
			.get(authorization.requiresLogin, top_remote2local.render);
		// TOP ENDPOINT EVENTS
		app.route('/general_network/top_endpoint_events')
		.get(authorization.requiresLogin, top_endpoint_events.render);
			// TOP ENDPOINT EVENTS USER
			app.route('/general_network/top_endpoint_events_user')
			.get(authorization.requiresLogin, top_endpoint_events_user.render);
				// TOP ENDPOINT EVENTS USER DRILL
				app.route('/general_network/top_endpoint_events_user_drill')
				.get(authorization.requiresLogin, top_endpoint_events_user_drill.render);
		// TOP SSH
		app.route('/general_network/top_ssh')
		.get(authorization.requiresLogin, top_ssh.render);
			// TOP SSH REMOTE
			app.route('/general_network/top_ssh_remote')
			.get(authorization.requiresLogin, top_ssh_remote.render);
				// TOP SSH REMOTE SHARED
				app.route('/general_network/top_ssh_remote_shared')
				.get(authorization.requiresLogin, top_ssh_remote_shared.render);
		// TOP REMOTE2LOCAL SSH
		app.route('/general_network/top_remote2local_ssh')
		.get(authorization.requiresLogin, top_remote2local_ssh.render);
			// TOP REMOTE2LOCAL SSH LOCAL
			app.route('/general_network/top_remote2local_ssh_local')
			.get(authorization.requiresLogin, top_remote2local_ssh_local.render);
		// TOP LOCAL IRC
		app.route('/general_network/top_local_irc')
		.get(authorization.requiresLogin, top_local_irc.render);
			// TOP LOCAL2REMOTE IRC
			app.route('/general_network/top_local2remote_irc')
			.get(authorization.requiresLogin, top_local2remote_irc.render);
				// TOP IRC SHARED
				app.route('/general_network/top_irc_shared')
				.get(authorization.requiresLogin, top_irc_shared.render);
		// TOP REMOTE IRC
		app.route('/general_network/top_remote_irc')
		.get(authorization.requiresLogin, top_remote_irc.render);
			// TOP REMOTE2LOCAL IRC 
			app.route('/general_network/top_remote2local_irc')
			.get(authorization.requiresLogin, top_remote2local_irc.render);
		// TOP LOCAL FTP
		app.route('/general_network/top_local_ftp')
		.get(authorization.requiresLogin, top_local_ftp.render);
			// TOP LOCAL2REMOTE FTP  
			app.route('/general_network/top_local2remote_ftp')
			.get(authorization.requiresLogin, top_local2remote_ftp.render);
				// TOP FTP SHARED
				app.route('/general_network/top_ftp_shared')
				.get(authorization.requiresLogin, top_ftp_shared.render);
		// TOP REMOTE FTP
		app.route('/general_network/top_remote_ftp')
		.get(authorization.requiresLogin, top_remote_ftp.render);
			// TOP REMOTE2LOCAL FTP 
			app.route('/general_network/top_remote2local_ftp')
			.get(authorization.requiresLogin, top_remote2local_ftp.render);

	// REPORTS
		// IOC EVENTS
		app.route('/reports/ioc_events')
		.get(authorization.requiresLogin, ioc_events_report.render);		

	// ARCHIVE
		app.route('/archive')
		.get(authorization.requiresLogin, archive.render);


};