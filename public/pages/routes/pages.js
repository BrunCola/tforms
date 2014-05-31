'use strict';

//Setting up route
angular.module('mean.pages').config(['$stateProvider',
	function($stateProvider) {
		// Check if the user is connected
		var checkLoggedin = function($q, $timeout, $http, $location) {
			// Initialize a new promise
			var deferred = $q.defer();

			// Make an AJAX call to check if the user is logged in
			$http.get('/loggedin').success(function(user) {
				// Authenticated
				if (user !== '0') $timeout(deferred.resolve);
				// Not Authenticated
				else {
					$timeout(deferred.reject);
					$location.url('/login');
				}
			});
			return deferred.promise;
		};

		$stateProvider

			// LIVE CONNECTIONS
			.state('live_connections', {
				url: '/live_connections',
				templateUrl: 'public/pages/views/live_connections/live_connections.html',
				resolve: {
					loggedin: checkLoggedin
				},
				data: {
					title: 'Live Connections',
					daterange: false
				}
			})

			// IOC NOTIFICATIONS
				// IOC EVENTS
				.state('ioc_events', {
					url: '/ioc_events?start&end',
					templateUrl: 'public/pages/views/ioc_notifications/ioc_events.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'IOC Events',
						daterange: true
					}
				})
	    			// IOC EVENTS DRILLDOWN
    				.state('ioc_events_drilldown', {
						url: '/ioc_events_drilldown?start&end&lan_ip&remote_ip&ioc',
						templateUrl: 'public/pages/views/ioc_notifications/ioc_events_drilldown.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'IOC Events',
							daterange: true
						}
					})

				// IOC TOP REMOTE IPS
				.state('ioc_top_remote_ips', {
					url: '/ioc_top_remote_ips?start&end',
					templateUrl: 'public/pages/views/ioc_notifications/ioc_top_remote_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'IOC Remote IPs',
						daterange: true
					}
				})
					// IOC TOP REMOTE2LOCAL
					.state('ioc_top_remote2local', {
						url: '/ioc_top_remote2local?start&end&remote_ip&ioc',
						templateUrl: 'public/pages/views/ioc_notifications/ioc_top_remote2local.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'IOC Remote IPs',
							daterange: true
						}
					})
				// IOC TOP LOCAL IPS
				.state('ioc_top_local_ips', {
					url: '/ioc_top_local_ips?start&end',
					templateUrl: 'public/pages/views/ioc_notifications/ioc_top_local_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'IOC Local IPs',
						daterange: true
					}
				})
					// IOC TOP LOCAL IPS DRILL
					.state('ioc_top_local_ips_drill', {
						url: '/ioc_top_local_ips_drill?start&end&lan_zone&lan_ip',
						templateUrl: 'public/pages/views/ioc_notifications/ioc_top_local_ips_drill.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'IOC Local IPs',
							daterange: true
						}
					})

			// EXTRACTED FILES
				// BY LOCAL IP
				.state('by_local_ip', {
					url: '/by_local_ip?start&end',
					templateUrl: 'public/pages/views/extracted_files/by_local_ip.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Extracted Files by Local IP',
						daterange: true
					}
				})
					// BY FILE NAME
					.state('by_file_name', {
						url: '/by_file_name?start&end&lan_ip',
						templateUrl: 'public/pages/views/extracted_files/by_file_name.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'File Mime Types',
							subtitleElm: {
								'ZONE': 'lan_zone',
								'LAN IP': 'lan_ip'
							},
							daterange: true
						}
					})
						// FILE LOCAL
						.state('file_local', {
							url: '/file_local?start&end&lan_ip&mime',
							templateUrl: 'public/pages/views/extracted_files/file_local.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Extracted Files for Local IP',
								subtitleElm: {
									'Zone': 'lan_zone',
									'LAN IP': 'lan_ip',
									'MIME Type': 'mime'
								},
								daterange: true
							}
						})

				// BY REMOTE IP
				.state('by_remote_ip', {
					url: '/by_remote_ip?start&end',
					templateUrl: 'public/pages/views/extracted_files/by_remote_ip.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Extracted Files by Remote IP',
						daterange: true
					}
				})
					// BY FILE NAME
					.state('by_file_name_remote', {
						url: '/by_file_name_remote?start&end&remote_ip',
						templateUrl: 'public/pages/views/extracted_files/by_file_name_remote.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'File Mime Types',
							subtitleElm: {
								'Remote IP': 'remote_ip'
							},
							daterange: true
						}
					})
						// FILE REMOTE
						.state('file_remote', {
							url: '/file_remote?start&end&remote_ip&mime',
							templateUrl: 'public/pages/views/extracted_files/file_remote.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Extracted Files for Remote IP',
								subtitleElm: {
									'Remote IP': 'remote_ip',
									'MIME Type': 'mime'
								},
								daterange: true
							}
						})

				// BY MIME TYPE
				.state('by_mime_type', {
					url: '/by_mime_type?start&end',
					templateUrl: 'public/pages/views/extracted_files/by_mime_type.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Extracted Files by MIME Type',
						daterange: true
					}
				})
					// BY MIME TYPE
					.state('file_mime_local', {
						url: '/file_mime_local?start&end&mime',
						templateUrl: 'public/pages/views/extracted_files/file_mime_local.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Extracted Files by MIME Type',
							subtitleElm: {
								'MIME Type': 'mime'
							},
							daterange: true
						}
					})

			// FIRST SEEN
				// NEW REMOTE IPS
				.state('new_remote_ips', {
					url: '/new_remote_ips?start&end',
					templateUrl: 'public/pages/views/first_seen/new_remote_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'New Remote IPs Detected',
						daterange: true
					}
				})
				// NEW DNS QUERIES
				.state('new_dns_queries', {
					url: '/new_dns_queries?start&end',
					templateUrl: 'public/pages/views/first_seen/new_dns_queries.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'New DNS Queries Detected',
						daterange: true
					}
				})
				// NEW HTTP HOSTS
				.state('new_http_domains', {
					url: '/new_http_domains?start&end',
					templateUrl: 'public/pages/views/first_seen/new_http_domains.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'New HTTP Domains Detected',
						daterange: true
					}
				})
				// NEW SSL HOSTS
				.state('new_ssl_hosts', {
					url: '/new_ssl_hosts?start&end',
					templateUrl: 'public/pages/views/first_seen/new_ssl_hosts.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'New Remote IP Detected Serving SSL Traffic',
						daterange: true
					}
				})
				// NEW SSL REMOTE IPS
				.state('new_ssh_remote_ips', {
					url: '/new_ssh_remote_ips?start&end',
					templateUrl: 'public/pages/views/first_seen/new_ssh_remote_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'New Remote IP Detected Serving SSH Traffic',
						daterange: true
					}
				})
				// NEW FTP REMOTE IPS
				.state('new_ftp_remote_ips', {
					url: '/new_ftp_remote_ips?start&end',
					templateUrl: 'public/pages/views/first_seen/new_ftp_remote_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'New Remote IP Detected Serving FTP Traffic',
						daterange: true
					}
				})

			// APPLICATIONS
				// BY APPLICATION
				.state('app_by_application', {
					url: '/app_by_application?start&end',
					templateUrl: 'public/pages/views/applications/app_by_application.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Applications',
						daterange: true
					}
				})
					// APPLICATION DRILL
					.state('application_drill', {
						url: '/application_drill?start&end&l7_proto',
						templateUrl: 'public/pages/views/applications/application_drill.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Applications',
							subtitleElm: {
								'L7 Protocol': 'l7_proto'
							},
							daterange: true
						}
					})
						// APPLICATION LOCAL
						.state('application_local', {
							url: '/application_local?start&end&lan_ip&l7_proto',
							templateUrl: 'public/pages/views/applications/application_local.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Applications',
								subtitleElm: {
									'L7 Protocol': 'l7_proto',
									'Zone': 'lan_zone',
									'LAN IP': 'lan_ip'
								},
								daterange: true
							}
						})
				// BY LOCAL IP
				.state('app_by_local_ip', {
					url: '/app_by_local_ip?start&end',
					templateUrl: 'public/pages/views/applications/app_by_local_ip.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Applications',
						daterange: true
					}
				})
					// L7 TOPLOCAL APP
					.state('l7_toplocal_app', {
						url: '/l7_toplocal_app?start&end&l7_proto&lan_ip',
						templateUrl: 'public/pages/views/applications/l7_toplocal_app.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Applications',
							subtitleElm: {
								'Zone': 'lan_zone',
								'LAN IP': 'lan_ip'
							},
							daterange: true
						}
					})
						// L7 TOPLOCAL DRILL
						.state('l7_toplocal_drill', {
							url: '/l7_toplocal_drill?start&end&lan_ip&l7_proto',
							templateUrl: 'public/pages/views/applications/l7_toplocal_drill.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Applications',
								subtitleElm: {
									'Zone': 'lan_zone',
									'LAN IP': 'lan_ip',
									'L7 Protocol': 'l7_proto',
								},
								daterange: true
							}
						})
							// L7 TOP SHARED
							.state('l7_top_shared', {
								url: '/l7_top_shared?start&end&lan_ip&l7_proto&remote_ip&lan_zone',
								templateUrl: 'public/pages/views/applications/l7_top_shared.html',
								resolve: {
									loggedin: checkLoggedin
								},
								data: {
									title: 'Applications Shared',
									subtitleElm: {
										'Zone': 'lan_zone',
										'LAN IP': 'lan_ip',
										'L7 Protocol': 'l7_proto'
									},
									daterange: true
								}
							})
				// BY REMOTE IP
				.state('app_by_remote_ip', {
					url: '/app_by_remote_ip?start&end',
					templateUrl: 'public/pages/views/applications/app_by_remote_ip.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Applications',
						daterange: true
					}
				})
					// L7 TOPREMOTE APP
					.state('l7_topremote_app', {
						url: '/l7_topremote_app?start&end&l7_proto&remote_ip',
						templateUrl: 'public/pages/views/applications/l7_topremote_app.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Applications',
							subtitleElm: {
								'Remote IP': 'remote_ip'
							},
							daterange: true
						}
					})
						// L7 TOPREMOTE DRILL
						.state('l7_topremote_drill', {
							url: '/l7_topremote_drill?start&end&remote_ip&l7_proto',
							templateUrl: 'public/pages/views/applications/l7_topremote_drill.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Applications',
								subtitleElm: {
									'Remote IP': 'remote_ip',
									'L7 Protocol': 'l7_proto'
								},
								daterange: true
							}
						})

		    // GENERAL NETWORK
				// TOP LOCAL IPS
				.state('top_local_ips', {
					url: '/top_local_ips?start&end',
					templateUrl: 'public/pages/views/general_network/top_local_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Local IP Bandwidth Use',
						daterange: true
					}
				})
					// TOP REMOTE2LOCAL
					.state('top_local2remote', {
						url: '/top_local2remote?start&end&lan_zone&lan_ip',
						templateUrl: 'public/pages/views/general_network/top_local2remote.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Local / Remote Bandwidth Use',
							subtitleElm: {
								'LAN IP': 'lan_ip',
								'LAN Zone': 'lan_zone'
							},
							daterange: true
						}
					})
						// TOP IPS SHARED
						.state('top_ips_shared', {
							url: '/top_ips_shared?start&end&lan_ip&lan_zone&remote_ip',
							templateUrl: 'public/pages/views/general_network/top_ips_shared.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Conn Local/Remote Shared',
								subtitleElm: {
									'LAN IP': 'lan_ip',
									'LAN Zone': 'lan_zone',
									'Remote IP': 'remote_ip'
								},
								daterange: true
							}
						})

				// TOP REMOTE IPS
				.state('top_remote_ips', {
					url: '/top_remote_ips?start&end',
					templateUrl: 'public/pages/views/general_network/top_remote_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Remote IP Bandwidth Use',
						daterange: true
					}
				})
					// TOP REMOTE2LOCAL
					.state('top_remote2Local', {
						url: '/top_remote2local?start&end&remote_ip',
						templateUrl: 'public/pages/views/general_network/top_remote2local.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'New Remote IPs Detected',
							subtitleElm: {
								'Remote IP': 'remote_ip'
							},
							daterange: true
						}
					})
				// TOP ENPOINT EVENTS
				.state('top_endpoint_events', {
					url: '/top_endpoint_events?start&end',
					templateUrl: 'public/pages/views/general_network/top_endpoint_events.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Endpoint Events',
						daterange: true
					}
				})
					// TOP ENPOINT EVENTS USER
					.state('top_endpoint_events_user', {
						url: '/top_endpoint_events_user?start&end&alert_info',
						templateUrl: 'public/pages/views/general_network/top_endpoint_events_user.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Endpoints Triggering Event',
							subtitleElm: {
								'Alert Info': 'alert_info'
							},
							daterange: true
						}
					})
						// TOP ENPOINT EVENTS USER DRILL
						.state('top_endpoint_events_user_drill', {
							url: '/top_endpoint_events_user_drill?start&end&alert_info&src_user',
							templateUrl: 'public/pages/views/general_network/top_endpoint_events_user_drill.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'Endpoint Event Full Logs',
								subtitleElm: {
									'Alert Info': 'alert_info',
									'Source User': 'src_user'
								},
								daterange: true
							}
						})
				// TOP SSH
				.state('top_ssh', {
					url: '/top_ssh?start&end',
					templateUrl: 'public/pages/views/general_network/top_ssh.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Local SSH',
						daterange: true
					}
				})
					// TOP SSH REMOTE
					.state('top_ssh_remote', {
						url: '/top_ssh_remote?start&end&lan_ip',
						templateUrl: 'public/pages/views/general_network/top_ssh_remote.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'SSH Local to Remote',
							subtitleElm: {
								'LAN IP': 'lan_ip'
							},
							daterange: true
						}
					})
						// TOP SSH REMOTE SHARED
						.state('top_ssh_remote_shared', {
							url: '/top_ssh_remote_shared?start&end&lan_ip&remote_ip',
							templateUrl: 'public/pages/views/general_network/top_ssh_remote_shared.html',
							resolve: {
								loggedin: checkLoggedin
							},
							data: {
								title: 'SSH Local/Remote Shared',
								subtitleElm: {
									'LAN IP': 'lan_ip',
									'Remote IP': 'remote_ip'
								},
								daterange: true
							}
						})
				// TOP REMOTE2LOCAL SSH
				.state('top_remote2local_ssh', {
					url: '/top_remote2local_ssh?start&end',
					templateUrl: 'public/pages/views/general_network/top_remote2local_ssh.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Remote SSH',
						daterange: true
					}
				})
					// TOP REMOTE2LOCAL SSH LOCAL
					.state('top_remote2local_ssh_local', {
						url: '/top_remote2local_ssh_local?start&end&remote_ip',
						templateUrl: 'public/pages/views/general_network/top_remote2local_ssh_local.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'SSH Remote to Local',
							subtitleElm: {
								'Remote IP': 'remote_ip'
							},
							daterange: true
						}
					})

				// TOP LOCAL IRC
				.state('top_local_irc', {
					url: '/top_local_irc?start&end',
					templateUrl: 'public/pages/views/general_network/top_local_irc.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Local IRC',
						daterange: true
					}
				})
				// TOP REMOTE IRC
				.state('top_remote_irc', {
					url: '/top_remote_irc?start&end',
					templateUrl: 'public/pages/views/general_network/top_remote_irc.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Remote IRC',
						daterange: true
					}
				})
				// TOP LOCAL SMTP 
				.state('top_local_smtp', {
					url: '/top_local_smtp?start&end',
					templateUrl: 'public/pages/views/general_network/top_local_smtp.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Email Senders',
						daterange: true
					}
				})
					// TOP SMTP FROM SENDER 
					.state('top_smtp_from_sender', {
						url: '/top_smtp_from_sender?start&end&from',
						templateUrl: 'public/pages/views/general_network/top_smtp_from_sender.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Emails From Sender',
							subtitleElm: {
								'Sender': 'from'
							},
							daterange: true
						}
					})
				// TOP SMTP RECEIVERS 
				.state('top_smtp_receivers', {
					url: '/top_smtp_receivers?start&end',
					templateUrl: 'public/pages/views/general_network/top_smtp_receivers.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Email Receivers',
						daterange: true
					}
				})
					// TOP SMTP TO RECEIVER
					.state('top_smtp_to_receiver', {
						url: '/top_smtp_to_receiver?start&end&to',
						templateUrl: 'public/pages/views/general_network/top_smtp_to_receiver.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'Emails To Receiver',
							subtitleElm: {
								'Recevier': 'to'
							},
							daterange: true
						}
					})
			// REPORTS
				// IOC EVENTS
				.state('ioc_events_report', {
					url: '/ioc_events_report?start&end',
					templateUrl: 'public/pages/views/reports/ioc_events.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'IOC Events Report',
						daterange: false
					}
				})

			// ARCHIVE
				.state('archive', {
					url: '/archive?start&end',
					templateUrl: 'public/pages/views/archive.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'Archive',
						daterange: false
					}
				})
	}
]);