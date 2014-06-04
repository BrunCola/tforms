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
	// IOC REMOTE
	var ioc_remote = require('../controllers/ioc_notifications/ioc_remote');
		// IOC REMOTE2LOCAL
		var ioc_remote2local = require('../controllers/ioc_notifications/ioc_remote2local');
	// IOC LOCAL
	var ioc_local = require('../controllers/ioc_notifications/ioc_local');
		// IOC LOCAL DRILL
		var ioc_local_drill = require('../controllers/ioc_notifications/ioc_local_drill');

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
	// NEW REMOTE
	var new_remote = require('../controllers/first_seen/new_remote');
	// NEW DNS QUERIES
	var new_dns_queries = require('../controllers/first_seen/new_dns_queries');
	// NEW HTTP DOMAINS
	var new_http_domains = require('../controllers/first_seen/new_http_domains');
	// NEW SSL HOSTS
	var new_ssl_hosts = require('../controllers/first_seen/new_ssl_hosts');
	// NEW SSH REMOTE
	var new_ssh_remote = require('../controllers/first_seen/new_ssh_remote');
	// NEW FTP REMOTE
	var new_ftp_remote = require('../controllers/first_seen/new_ftp_remote');

// APPLICATIONS
	// BY APPLICATION
	var app_by_application = require('../controllers/applications/app_by_application');
		// APPLICATION DRILL
		var application_drill = require('../controllers/applications/application_drill');
			// APPLICATION LOCAL
			var application_local = require('../controllers/applications/application_local');
	// BY LOCAL IP
	var app_by_local_ip = require('../controllers/applications/app_by_local_ip');
		// L7 LOCAL APP
		var l7_local_app = require('../controllers/applications/l7_local_app');
			// l7 LOCAL DRILL
			var l7_local_drill = require('../controllers/applications/l7_local_drill');
				// l7 SHARED
				var l7_shared = require('../controllers/applications/l7_shared');
	// BY REMOTE IP
	var app_by_remote_ip = require('../controllers/applications/app_by_remote_ip');
		// L7 REMOTE APP
		var l7_remote_app = require('../controllers/applications/l7_remote_app');
			// l7 REMOTE DRILL
			var l7_remote_drill = require('../controllers/applications/l7_remote_drill');

//EMAIL
	// LOCAL SMTP 
	var smtp_senders = require('../controllers/email/smtp_senders');
		// SMTP SENDER2RECEIVER
		var smtp_sender2receiver = require('../controllers/email/smtp_sender2receiver');	
			// SMTP FROM SENDER
			var smtp_from_sender = require('../controllers/email/smtp_from_sender');	
	// SMTP RECEIVERS
	var smtp_receivers = require('../controllers/email/smtp_receivers');
		// SMTP RECEIVER2SENDER 
		var smtp_receiver2sender = require('../controllers/email/smtp_receiver2sender')
	// SMTP SUBJECTS
	var smtp_subjects = require('../controllers/email/smtp_subjects');
		// SMTP SUBJECT SENDER RECEIVER PAIRS
		var smtp_subject_sender_receiver_pairs = require('../controllers/email/smtp_subject_sender_receiver_pairs')

// GENERAL NETWORK
	// LOCAL
	var local = require('../controllers/general_network/local');
		// LOCAL2REMOTE
		var local2remote = require('../controllers/general_network/local2remote');
	// REMOTE
	var remote = require('../controllers/general_network/remote');
		// REMOTE2LOCAL
		var remote2local = require('../controllers/general_network/remote2local');
			// SHARED
			var shared = require('../controllers/general_network/shared');
	// ENDPOINT EVENTS
	var endpoint_events = require('../controllers/general_network/endpoint_events');
		// ENDPOINT EVENTS USER
		var endpoint_events_user = require('../controllers/general_network/endpoint_events_user');
			// ENDPOINT EVENTS USER DRILL
			var endpoint_events_user_drill = require('../controllers/general_network/endpoint_events_user_drill');
	// SSH
	var ssh_local = require('../controllers/general_network/ssh_local');
		// SSH REMOTE
		var ssh_local2remote = require('../controllers/general_network/ssh_local2remote');
			// SSH REMOTE SHARED
			var ssh_shared = require('../controllers/general_network/ssh_shared');
	// REMOTE2LOCAL SSH
	var ssh_remote = require('../controllers/general_network/ssh_remote');
		// SSH REMOTE
		var ssh_remote2local = require('../controllers/general_network/ssh_remote2local');
	// LOCAL IRC
	var local_irc = require('../controllers/general_network/local_irc');	
		// LOCAL2REMOTE IRC
		var local2remote_irc = require('../controllers/general_network/local2remote_irc');	
			// IRC SHARED
			var irc_shared = require('../controllers/general_network/irc_shared');
	// REMOTE IRC
	var remote_irc = require('../controllers/general_network/remote_irc');	
		// REMOTE2LOCAL IRC
		var remote2local_irc = require('../controllers/general_network/remote2local_irc');	
	// LOCAL FTP
	var local_ftp = require('../controllers/general_network/local_ftp');
		// LOCAL2REMOTE FTP
		var local2remote_ftp = require('../controllers/general_network/local2remote_ftp');
			// FTP SHARED
			var ftp_shared = require('../controllers/general_network/ftp_shared');
	// REMOTE FTP
	var remote_ftp = require('../controllers/general_network/remote_ftp'); 
		// REMOTE2LOCAL FTP
		var remote2local_ftp = require('../controllers/general_network/remote2local_ftp');
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
		// IOC REMOTE
		app.route('/ioc_notifications/ioc_remote')
		.get(authorization.requiresLogin, ioc_remote.render);
			// IOC REMOTE2LOCAL
			app.route('/ioc_notifications/ioc_remote2local')
			.get(authorization.requiresLogin, ioc_remote2local.render);
		// IOC LOCAL
		app.route('/ioc_notifications/ioc_local')
		.get(authorization.requiresLogin, ioc_local.render);
			// IOC LOCAL DRILL
			app.route('/ioc_notifications/ioc_local_drill')
			.get(authorization.requiresLogin, ioc_local_drill.render);

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
		// NEW REMOTE
		app.route('/first_seen/new_remote')
		.get(authorization.requiresLogin, new_remote.render);
		// NEW DNS QUERIES
		app.route('/first_seen/new_dns_queries')
		.get(authorization.requiresLogin, new_dns_queries.render);
		// NEW HTTP DOMAINS
		app.route('/first_seen/new_http_domains')
		.get(authorization.requiresLogin, new_http_domains.render);
		// NEW SSL HOSTS
		app.route('/first_seen/new_ssl_hosts')
		.get(authorization.requiresLogin, new_ssl_hosts.render);
		// NEW SSH REMOTE REMOTE
		app.route('/first_seen/new_ssh_remote')
		.get(authorization.requiresLogin, new_ssh_remote.render);
		// NEW FTP REMOTE
		app.route('/first_seen/new_ftp_remote')
		.get(authorization.requiresLogin, new_ftp_remote.render);

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
			// L7 LOCAL APP
			app.route('/applications/l7_local_app')
			.get(authorization.requiresLogin, l7_local_app.render);
				// L7 LOCAL DRILL
				app.route('/applications/l7_local_drill')
				.get(authorization.requiresLogin, l7_local_drill.render);
					// L7 SHARED
					app.route('/applications/l7_shared')
					.get(authorization.requiresLogin, l7_shared.render);
		// BY REMOTE IP
		app.route('/applications/app_by_remote_ip')
		.get(authorization.requiresLogin, app_by_remote_ip.render);
			// L7 REMOTE APP
			app.route('/applications/l7_remote_app')
			.get(authorization.requiresLogin, l7_remote_app.render);
				// L7 REMOTE DRILL
				app.route('/applications/l7_remote_drill')
				.get(authorization.requiresLogin, l7_remote_drill.render);

	//EMAIL
		// LOCAL SMTP
		app.route('/email/smtp_senders')
		.get(authorization.requiresLogin, smtp_senders.render);
			// SMTP SENDER2RECEIVER
			app.route('/email/smtp_sender2receiver')
			.get(authorization.requiresLogin, smtp_sender2receiver.render);
				// SMTP FROM SENDER
				app.route('/email/smtp_from_sender')
				.get(authorization.requiresLogin, smtp_from_sender.render);
		// SMTP RECEIVERS
		app.route('/email/smtp_receivers')
		.get(authorization.requiresLogin, smtp_receivers.render);
			// SMTP RECEIVER2SENDER
			app.route('/email/smtp_receiver2sender')
			.get(authorization.requiresLogin, smtp_receiver2sender.render);
		// SMTP SUBJECTS
		app.route('/email/smtp_subjects')
		.get(authorization.requiresLogin, smtp_subjects.render);
			// SMTP SUBJECT SENDER RECEIVER PAIRS
			app.route('/email/smtp_subject_sender_receiver_pairs')
			.get(authorization.requiresLogin, smtp_subject_sender_receiver_pairs.render);

	// GENERAL NETWORK
		// LOCAL
		app.route('/general_network/local')
		.get(authorization.requiresLogin, local.render);
			// LOCAL2REMOTE
			app.route('/general_network/local2remote')
			.get(authorization.requiresLogin, local2remote.render);
				// SHARED
				app.route('/general_network/shared')
				.get(authorization.requiresLogin, shared.render);
		// REMOTE
		app.route('/general_network/remote')
		.get(authorization.requiresLogin, remote.render);
			// REMOTE2LOCAL
			app.route('/general_network/remote2local')
			.get(authorization.requiresLogin, remote2local.render);
		// ENDPOINT EVENTS
		app.route('/general_network/endpoint_events')
		.get(authorization.requiresLogin, endpoint_events.render);
			// ENDPOINT EVENTS USER
			app.route('/general_network/endpoint_events_user')
			.get(authorization.requiresLogin, endpoint_events_user.render);
				// ENDPOINT EVENTS USER DRILL
				app.route('/general_network/endpoint_events_user_drill')
				.get(authorization.requiresLogin, endpoint_events_user_drill.render);
		// SSH LOCAL
		app.route('/general_network/ssh_local')
		.get(authorization.requiresLogin, ssh_local.render);
			// SSH LOCAL2REMOTE
			app.route('/general_network/ssh_local2remote')
			.get(authorization.requiresLogin, ssh_local2remote.render);
				// SSH REMOTE SHARED
				app.route('/general_network/ssh_shared')
				.get(authorization.requiresLogin, ssh_shared.render);
		// REMOTE2LOCAL SSH
		app.route('/general_network/ssh_remote')
		.get(authorization.requiresLogin, ssh_remote.render);
			// REMOTE2LOCAL SSH LOCAL
			app.route('/general_network/ssh_remote2local')
			.get(authorization.requiresLogin, ssh_remote2local.render);
		// LOCAL IRC
		app.route('/general_network/local_irc')
		.get(authorization.requiresLogin, local_irc.render);
			// LOCAL2REMOTE IRC
			app.route('/general_network/local2remote_irc')
			.get(authorization.requiresLogin, local2remote_irc.render);
				// IRC SHARED
				app.route('/general_network/irc_shared')
				.get(authorization.requiresLogin, irc_shared.render);
		// REMOTE IRC
		app.route('/general_network/remote_irc')
		.get(authorization.requiresLogin, remote_irc.render);
			// REMOTE2LOCAL IRC 
			app.route('/general_network/remote2local_irc')
			.get(authorization.requiresLogin, remote2local_irc.render);
		// LOCAL FTP
		app.route('/general_network/local_ftp')
		.get(authorization.requiresLogin, local_ftp.render);
			// LOCAL2REMOTE FTP 
			app.route('/general_network/local2remote_ftp')
			.get(authorization.requiresLogin, local2remote_ftp.render);
				// FTP SHARED
				app.route('/general_network/ftp_shared')
				.get(authorization.requiresLogin, ftp_shared.render);
		// REMOTE FTP
		app.route('/general_network/remote_ftp')
		.get(authorization.requiresLogin, remote_ftp.render);
			// REMOTE2LOCAL FTP 
			app.route('/general_network/remote2local_ftp')
			.get(authorization.requiresLogin, remote2local_ftp.render);

	// REPORTS
		// IOC EVENTS
		app.route('/reports/ioc_events')
		.get(authorization.requiresLogin, ioc_events_report.render);		

	// ARCHIVE
		app.route('/archive')
		.get(authorization.requiresLogin, archive.render);


};