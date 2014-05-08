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
						title: 'IOC Top Remote IPs',
						daterange: true
					}
				})		
				// IOC TOP LCOAL IPS
				.state('ioc_top_local_ips', {
					url: '/ioc_top_local_ips?start&end',
					templateUrl: 'public/pages/views/ioc_notifications/ioc_top_local_ips.html',
					resolve: {
						loggedin: checkLoggedin
					},
					data: {
						title: 'IOC Top Local IPs',
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
							title: 'File Name',
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
								title: 'File Local',
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
						title: 'Top Local IPs',
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
							title: 'New Remote IPs Detected',
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
						title: 'Top Remote IPs',
						daterange: true
					}
				})
					// TOP REMOTE2LOCAL
					.state('top_remote2Local', {
						url: '/top_remote2local?start&end&remote_ip',
						templateUrl: 'public/pages/views/general_network/top_remote2Local.html',
						resolve: {
							loggedin: checkLoggedin
						},
						data: {
							title: 'New Remote IPs Detected',
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
						title: 'New Remote IPs Detected',
						daterange: true
					}
				})


	}
]);