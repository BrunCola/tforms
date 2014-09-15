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
                        title: 'Indicator of Compromise Events',
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
                            title: 'Indicator of Compromise Events',
                            daterange: true
                        }
                    })
                // IOC REMOTE IPS
                .state('ioc_remote', {
                    url: '/ioc_remote?start&end',
                    templateUrl: 'public/pages/views/ioc_notifications/ioc_remote.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Indicator of Compromise Events Sorted by Remote IP',
                        daterange: true
                    }
                })
                    // IOC REMOTE2LOCAL
                    .state('ioc_remote2local', {
                        url: '/ioc_remote2local?start&end&remote_ip&ioc',
                        templateUrl: 'public/pages/views/ioc_notifications/ioc_remote2local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Indicator of Compromise Events Sorted by Remote IP',
                            daterange: true
                        }
                    })
                // IOC LOCAL IPS
                .state('ioc_local', {
                    url: '/ioc_local?start&end',
                    templateUrl: 'public/pages/views/ioc_notifications/ioc_local.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Indicator of Compromise Events Sorted by Local IP',
                        daterange: true
                    }
                })
                    // IOC LOCAL IPS DRILL
                    .state('ioc_local_drill', {
                        url: '/ioc_local_drill?start&end&lan_zone&lan_ip',
                        templateUrl: 'public/pages/views/ioc_notifications/ioc_local_drill.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Indicator of Compromise Events Sorted by Local IP',
                            daterange: true
                        }
                    })
            // GENERAL NETWORK
                // LOCAL IPS
                    .state('local', {
                        url: '/local?start&end',
                        templateUrl: 'public/pages/views/general_network/local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local IP Bandwidth Use',
                            daterange: true
                        }
                    })
                    // REMOTE2LOCAL
                        .state('local2remote', {
                            url: '/local2remote?start&end&lan_zone&lan_ip',
                            templateUrl: 'public/pages/views/general_network/local2remote.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local / Remote Bandwidth Use',
                                subtitleElm: {
                                    'Local IP': 'lan_ip',
                                    'Zone': 'lan_zone'
                                },
                                daterange: true
                            }
                        })
                        // IPS SHARED
                            .state('shared', {
                                url: '/shared?start&end&lan_ip&lan_zone&remote_ip',
                                templateUrl: 'public/pages/views/general_network/shared.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'Conn Local/Remote Shared',
                                    subtitleElm: {
                                        'Local IP': 'lan_ip',
                                        'Zone': 'lan_zone',
                                        'Remote IP': 'remote_ip'
                                    },
                                    daterange: true
                                }
                            })
                // REMOTE IPS
                    .state('remote', {
                        url: '/remote?start&end',
                        templateUrl: 'public/pages/views/general_network/remote.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Remote IP Bandwidth Use',
                            daterange: true
                        }
                    })
                    // REMOTE2LOCAL
                        .state('remote2Local', {
                            url: '/remote2local?start&end&remote_ip',
                            templateUrl: 'public/pages/views/general_network/remote2local.html',
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
                // LOCAL FTP 
                    .state('ftp_local`', {
                        url: '/ftp_local?start&end',
                        templateUrl: 'public/pages/views/general_network/ftp_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local FTP',
                            daterange: true
                        }
                    })
                    // LOCAL2REMOTE FTP
                        .state('ftp_local2remote', {
                            url: '/ftp_local2remote?start&end&lan_ip&lan_zone',
                            templateUrl: 'public/pages/views/general_network/ftp_local2remote.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local to Remote FTP',
                                subtitleElm: {
                                    'Local IP': 'lan_ip',
                                    'Zone': 'lan_zone'
                                },
                                daterange: true
                            }
                        })
                        // FTP SHARED
                            .state('ftp_shared', {
                                url: '/ftp_shared?start&end&lan_ip&lan_zone&remote_ip',
                                templateUrl: 'public/pages/views/general_network/ftp_shared.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'FTP Local/Remote Shared',
                                    subtitleElm: {
                                        'Local IP': 'lan_ip',
                                        'Zone': 'lan_zone',
                                        'Remote IP': 'remote_ip'
                                    },
                                    daterange: true
                                }
                            })
                // REMOTE FTP 
                    .state('ftp_remote', {
                        url: '/ftp_remote?start&end',
                        templateUrl: 'public/pages/views/general_network/ftp_remote.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Remote FTP',
                            daterange: true
                        }
                    })
                    // REMOTE2LOCAL FTP
                        .state('ftp_remote2local', {
                            url: '/ftp_remote2local?start&end&remote_ip',
                            templateUrl: 'public/pages/views/general_network/ftp_remote2local.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Remote to Local FTP',
                                subtitleElm: {
                                    'Remote IP': 'remote_ip'
                                },
                                daterange: true
                            }
                        })
                // SSH STATUS
                    .state('ssh_status', {
                        url: '/ssh_status?start&end',
                        templateUrl: 'public/pages/views/general_network/ssh_status.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'SSH Status',
                            daterange: true
                        }
                    })
                    // SSH STATUS LOCAL
                        .state('ssh_status_local', {
                            url: '/ssh_status_local?start&end&status_code',
                            templateUrl: 'public/pages/views/general_network/ssh_status_local.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local SSH Status',
                                subtitleElm: {
                                    'Status Code': 'status_code'
                                },
                                daterange: true
                            }
                        })
                        // SSH STATUS LOCAL DRILL
                            .state('ssh_status_local_drill', {
                                url: '/ssh_status_local_drill?start&end&lan_ip&lan_zone&status_code',
                                templateUrl: 'public/pages/views/general_network/ssh_status_local_drill.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'SSH Local/Remote Shared',
                                    subtitleElm: {
                                        'Local IP': 'lan_ip',
                                        'Zone': 'lan_zone',
                                        'Status Code': 'status_code'
                                    },
                                    daterange: true
                                }
                            })
                // SSH LOCAL
                    .state('ssh_local', {
                        url: '/ssh_local?start&end',
                        templateUrl: 'public/pages/views/general_network/ssh_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local SSH',
                            daterange: true
                        }
                    })
                    // SSH LOCAL2REMOTE
                        .state('ssh_local2remote', {
                            url: '/ssh_local2remote?start&end&lan_ip',
                            templateUrl: 'public/pages/views/general_network/ssh_local2remote.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'SSH Local to Remote',
                                subtitleElm: {
                                    'Local IP': 'lan_ip'
                                },
                                daterange: true
                            }
                        })
                        // SSH SHARED
                        .state('ssh_shared', {
                            url: '/ssh_shared?start&end&lan_ip&lan_zone&remote_ip',
                            templateUrl: 'public/pages/views/general_network/ssh_shared.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'SSH Local/Remote Shared',
                                subtitleElm: {
                                    'Local IP': 'lan_ip',
                                    'Zone': 'lan_zone',
                                    'Remote IP': 'remote_ip'
                                },
                                daterange: true
                            }
                        })
                // SSH REMOTE
                    .state('ssh_remote', {
                        url: '/ssh_remote?start&end',
                        templateUrl: 'public/pages/views/general_network/ssh_remote.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Remote SSH',
                            daterange: true
                        }
                    })
                    // SSH REMOTE2LOCAL
                        .state('ssh_remote2local', {
                            url: '/ssh_remote2local?start&end&remote_ip',
                            templateUrl: 'public/pages/views/general_network/ssh_remote2local.html',
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
                // LOCAL IRC
                    .state('irc_local', {
                        url: '/irc_local?start&end',
                        templateUrl: 'public/pages/views/general_network/irc_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local IRC',
                            daterange: true
                        }
                    })
                    // LOCAL2REMOTE IRC
                        .state('irc_local2remote', {
                            url: '/irc_local2remote?start&end&lan_ip&lan_zone',
                            templateUrl: 'public/pages/views/general_network/irc_local2remote.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local to Remote IRC',
                                subtitleElm: {
                                    'Local IP': 'lan_ip',
                                    'Zone': 'lan_zone'
                                },
                                daterange: true
                            }
                        })
                        // IRC SHARED
                            .state('irc_shared', {
                                url: '/irc_shared?start&end&lan_ip&lan_zone&remote_ip',
                                templateUrl: 'public/pages/views/general_network/irc_shared.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'IRC Local/Remote Shared',
                                    subtitleElm: {
                                        'Local IP': 'lan_ip',
                                        'Zone': 'lan_zone',
                                        'Remote IP': 'remote_ip'
                                    },
                                    daterange: true
                                }
                            })
                // REMOTE IRC
                    .state('irc_remote', {
                        url: '/irc_remote?start&end',
                        templateUrl: 'public/pages/views/general_network/irc_remote.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Remote IRC',
                            daterange: true
                        }
                    })
                    // REMOTE2LOCAL IRC
                        .state('irc_remote2local', {
                            url: '/irc_remote2local?start&end&remote_ip',
                            templateUrl: 'public/pages/views/general_network/irc_remote2local.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Remote to Local IRC',
                                subtitleElm: {
                                    'Remote IP': 'remote_ip'
                                },
                                daterange: true
                            }
                        })
            // LOCAL EVENTS
                // USERS COI GROUPS
                    .state('users_COI_groups', {
                        url: '/users_COI_groups',
                        templateUrl: 'public/pages/views/stealth/users_COI_groups.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Stealth COI Map',
                            daterange: true
                        }
                    })  
                // LOCAL COI REMOTE
                    .state('local_COI_remote', {
                        url: '/local_COI_remote?start&end',
                        templateUrl: 'public/pages/views/stealth/local_COI_remote.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Stealth Secured Connections By User',
                            daterange: true
                        }
                    })      
                // LOCAL USER CONN
                    .state('local_user_conn', {
                        url: '/local_user_conn?start&end&user',
                        templateUrl: 'public/pages/views/users/local_user_conn.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local User Connections',
                            subtitleElm: {
                                'User': 'user'
                            },
                            daterange: true
                        }
                    })    
                    // LOCAL COI REMOTE DRILL
                        .state('local_COI_remote_drill', {
                            url: '/local_COI_remote_drill?start&end&ip',
                            templateUrl: 'public/pages/views/stealth/local_COI_remote_drill.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local User Event Timeline',
                                subtitleElm: {
                                    'Local IP': 'ip'
                                },
                                daterange: true
                            }
                        })          
                // USERS LOCAL
                    .state('users_local', {
                        url: '/users_local?start&end',
                        templateUrl: 'public/pages/views/users/users_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Users',
                            daterange: true
                        }
                    })
                // USER LOCAL
                    .state('user_local', {
                        url: '/user_local?start&end&user',
                        templateUrl: 'public/pages/views/stealth/user_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'User IPs',
                            subtitleElm: {
                                'User': 'user'
                            },
                            daterange: true
                        }
                    })
                // ENPOINT EVENTS
                    .state('endpoint_events', {
                        url: '/endpoint_events?start&end',
                        templateUrl: 'public/pages/views/general_network/endpoint_events.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Endpoint Events',
                            daterange: true
                        }
                    })
                    // ENPOINT EVENTS USER
                        .state('endpoint_events_user', {
                            url: '/endpoint_events_user?start&end&event_type',
                            templateUrl: 'public/pages/views/general_network/endpoint_events_user.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Endpoints Triggering Event',
                                subtitleElm: {
                                    'Event Type': 'event_type'
                                },
                                daterange: true
                            }
                        })
                        // ENPOINT EVENTS USER DRILL
                            .state('endpoint_events_user_drill', {
                                url: '/endpoint_events_user_drill?start&end&lan_user&lan_',
                                templateUrl: 'public/pages/views/general_network/endpoint_events_user_drill.html',
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
                // ENPOINT EVENTS LOCAL
                    .state('endpoint_events_local', {
                        url: '/endpoint_events_local?start&end',
                        templateUrl: 'public/pages/views/general_network/endpoint_events_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local Endpoint Events',
                            daterange: true
                        }
                    })
                    // ENPOINT EVENTS LOCAL BY ALERT INFO 
                        .state('endpoint_events_local_by_alert_info', {
                            url: '/endpoint_events_local_by_alert_info?start&end&src_ip',
                            templateUrl: 'public/pages/views/general_network/endpoint_events_local_by_alert_info.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Endpoints Triggering Event',
                                subtitleElm: {
                                    'Source IP': 'src_ip'
                                },
                                daterange: true
                            }
                        })
                        // ENPOINT EVENTS LOCAL ALERT INFO DRILL
                            .state('endpoint_events_local_alert_info_drill', {
                                url: '/endpoint_events_local_alert_info_drill?start&end&alert_info&src_ip',
                                templateUrl: 'public/pages/views/general_network/endpoint_events_local_alert_info_drill.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'Endpoint Event Full Logs',
                                    subtitleElm: {
                                        'Alert Info': 'alert_info',
                                        'Source IP': 'src_ip'
                                    },
                                    daterange: true
                                }
                            })
                // ENPOINT EVENTS SHAREPOINT
                    .state('endpoint_events_sharepoint', {
                        url: '/endpoint_events_sharepoint?start&end',
                        templateUrl: 'public/pages/views/general_network/endpoint_events_sharepoint.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Endpoint Events',
                            daterange: true
                        }
                    })
                    // ENPOINT EVENTS SHAREPOINT DRILL
                        .state('endpoint_events_sharepoint_drill', {
                            url: '/endpoint_events_sharepoint_drill?start&end&event_id&lan_ip',
                            templateUrl: 'public/pages/views/general_network/endpoint_events_sharepoint_drill.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Endpoint Event Full Logs',
                                subtitleElm: {
                                    'Event ID': 'event_id',
                                    'Local IP': 'lan_ip'
                                    //'Zone': 'lan_zone'
                                },
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
                                    'Local IP': 'lan_ip'
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
                    // L7 LOCAL APP
                    .state('l7_local_app', {
                        url: '/l7_local_app?start&end&l7_proto&lan_ip',
                        templateUrl: 'public/pages/views/applications/l7_local_app.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Applications',
                            subtitleElm: {
                                'L7 Protocol': 'l7_proto',
                                'Zone': 'lan_zone',
                                'Local IP': 'lan_ip'
                            },
                            daterange: true
                        }
                    })
                        // L7 LOCAL DRILL
                        .state('l7_local_drill', {
                            url: '/l7_local_drill?start&end&lan_ip&l7_proto',
                            templateUrl: 'public/pages/views/applications/l7_local_drill.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Applications',
                                subtitleElm: {
                                    'L7 Protocol': 'l7_proto',
                                    'Zone': 'lan_zone',
                                    'Local IP': 'lan_ip'
                                },
                                daterange: true
                            }
                        })
                            // L7 SHARED
                            .state('l7_shared', {
                                url: '/l7_shared?start&end&lan_ip&l7_proto&remote_ip&lan_zone',
                                templateUrl: 'public/pages/views/applications/l7_shared.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'Applications Shared',
                                    subtitleElm: {
                                        'L7 Protocol': 'l7_proto',
                                        'Zone': 'lan_zone',
                                        'Local IP': 'lan_ip'
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
                    // L7 REMOTE APP
                    .state('l7_remote_app', {
                        url: '/l7_remote_app?start&end&l7_proto&remote_ip',
                        templateUrl: 'public/pages/views/applications/l7_remote_app.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Applications',
                            subtitleElm: {
                                'L7 Protocol': 'l7_proto',
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })
                        // L7 REMOTE DRILL
                        .state('l7_remote_drill', {
                            url: '/l7_remote_drill?start&end&remote_ip&l7_proto',
                            templateUrl: 'public/pages/views/applications/l7_remote_drill.html',
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
            // HTTP
                // HTTP BY DOMAIN
                .state('http_by_domain', {
                    url: '/http_by_domain?start&end',
                    templateUrl: 'public/pages/views/http/http_by_domain.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'HTTP By Domain',
                        daterange: true
                    }
                })
                    // HTTP BY DOMAIN LOCAL
                    .state('http_by_domain_local', {
                        url: '/http_by_domain_local?start&end&host',
                        templateUrl: 'public/pages/views/http/http_by_domain_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local HTTP By Domain',
                            subtitleElm: {
                                'Domain': 'host'
                            },
                            daterange: true
                        }
                    })
                        // HTTP BY DOMAIN LOCAL DRILL
                        .state('http_by_domain_local_drill', {
                            url: '/http_by_domain_local_drill?start&end&host&lan_zone&lan_ip',
                            templateUrl: 'public/pages/views/http/http_by_domain_local_drill.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local HTTP By Domain',
                                subtitleElm: {
                                    'Domain': 'host',
                                    'LAN IP': 'lan_ip',
                                    'Zone': 'lan_zone'
                                },
                                daterange: true
                            }
                        })
                // HTTP LOCAL
                .state('http_local', {
                    url: '/http_local?start&end',
                    templateUrl: 'public/pages/views/http/http_local.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Local HTTP',
                        daterange: true
                    }
                })
                    // HTTP LOCAL BY DOMAIN
                    .state('http_local_by_domain', {
                        url: '/http_local_by_domain?start&end&lan_ip&lan_zone',
                        templateUrl: 'public/pages/views/http/http_local_by_domain.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local HTTP by Domain',
                            subtitleElm: {
                                'Local IP': 'lan_ip',
                                'Zone': 'lan_zone'
                            },
                            daterange: true
                        }
                    })
                // HTTP REMOTE
                .state('http_remote', {
                    url: '/http_remote?start&end',
                    templateUrl: 'public/pages/views/http/http_remote.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Remote HTTP',
                        daterange: true
                    }
                })
                    // HTTP REMOTE2LOCAL
                    .state('http_remote2local', {
                        url: '/http_remote2local?start&end&remote_ip',
                        templateUrl: 'public/pages/views/http/http_remote2local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Remote to Local HTTP',
                            subtitleElm: {
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })
                        // HTTP REMOTE2LOCAL DRILL
                        .state('http_remote2local_drill', {
                            url: '/http_remote2local_drill?start&end&lan_ip&lan_zone&remote_ip',
                            templateUrl: 'public/pages/views/http/http_remote2local_drill.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Local/Remote HTTP',
                                subtitleElm: {
                                    'LAN IP': 'lan_ip',
                                    'Zone': 'lan_zone',
                                    'Remote IP': 'remote_ip'
                                },
                                daterange: true
                            }
                        })
            // DNS
                // LOCAL DNS
                .state('dns_local', {
                    url: '/dns_local?start&end',
                    templateUrl: 'public/pages/views/dns/dns_local.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Local DNS',
                        daterange: true
                    }
                })
                // REMOTE DNS
                .state('dns_remote', {
                    url: '/dns_remote?start&end',
                    templateUrl: 'public/pages/views/dns/dns_remote.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Remote DNS',
                        daterange: true
                    }
                })
            // SSL
                // SSL SERVER
                .state('ssl_server', {
                    url: '/ssl_server?start&end',
                    templateUrl: 'public/pages/views/ssl/ssl_server.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'SSL Server',
                        daterange: true
                    }
                })
                // LOCAL SSL
                .state('ssl_local', {
                    url: '/ssl_local?start&end',
                    templateUrl: 'public/pages/views/ssl/ssl_local.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Local SSL',
                        daterange: true
                    }
                })
                // REMOTE SSL
                .state('ssl_remote', {
                    url: '/ssl_remote?start&end',
                    templateUrl: 'public/pages/views/ssl/ssl_remote.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Remote SSL',
                        daterange: true
                    }
                })
            // EMAIL
                // LOCAL SMTP 
                .state('smtp_senders', {
                    url: '/smtp_senders?start&end',
                    templateUrl: 'public/pages/views/email/smtp_senders.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Email Senders',
                        daterange: true
                    }
                })
                    // SMTP SENDER2RECEIVER
                    .state('smtp_sender2receiver', {
                        url: '/smtp_sender2receiver?start&end&mailfrom',
                        templateUrl: 'public/pages/views/email/smtp_sender2receiver.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Senders/Reveivers',
                            subtitleElm: {
                                'Sender': 'mailfrom'
                            },
                            daterange: true
                        }
                    })
                        // SMTP FROM SENDER 
                        .state('smtp_from_sender', {
                            url: '/smtp_from_sender?start&end&mailfrom&receiptto',
                            templateUrl: 'public/pages/views/email/smtp_from_sender.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Emails From Sender to Receiver',
                                subtitleElm: {
                                    'Sender': 'mailfrom',
                                    'Receiver': 'receiptto'
                                },
                                daterange: true
                            }
                        })
                // SMTP RECEIVERS 
                .state('smtp_receivers', {
                    url: '/smtp_receivers?start&end',
                    templateUrl: 'public/pages/views/email/smtp_receivers.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Email Receivers',
                        daterange: true
                    }
                })
                    // SMTP RECEIVER2SENDER
                    .state('smtp_receiver2sender', {
                        url: '/smtp_receiver2sender?start&end&receiptto',
                        templateUrl: 'public/pages/views/email/smtp_receiver2sender.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Receivers/Senders',
                            subtitleElm: {
                                'Receiver': 'receiptto'
                            },
                            daterange: true
                        }
                    })
                // SMTP SUBJECTS 
                .state('smtp_subjects', {
                    url: '/smtp_subjects?start&end',
                    templateUrl: 'public/pages/views/email/smtp_subjects.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Email Subjects',
                        daterange: true
                    }
                })
                    // SMTP SUBJECTS SENDER RECEIVER PAIRS
                    .state('smtp_subject_sender_receiver_pairs', {
                        url: '/smtp_subject_sender_receiver_pairs?start&end&subject',
                        templateUrl: 'public/pages/views/email/smtp_subject_sender_receiver_pairs.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Receiver/Sender pairs for Subject',
                            subtitleElm: {
                                'Subject': 'subject'
                            },
                            daterange: true
                        }
                    })
                        // SMTP FROM SENDER BY SUBJECT
                        .state('smtp_from_sender_by_subject', {
                            url: '/smtp_from_sender_by_subject?start&end&receiptto&mailfrom&subject',
                            templateUrl: 'public/pages/views/email/smtp_from_sender_by_subject.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Email from Sender to Receiver for Subject',
                                subtitleElm: {
                                    'Sender': 'mailfrom',
                                    'Receiver': 'receiptto',
                                    'Subject': 'subject'
                                },
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
                            title: 'File Types',
                            subtitleElm: {
                                'ZONE': 'lan_zone',
                                'Local IP': 'lan_ip'
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
                                    'Local IP': 'lan_ip',
                                    'File Type': 'mime'
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
                            title: 'File Types',
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
                                    'File Type': 'mime'
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
                        title: 'Extracted Files by Type',
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
                            title: 'Extracted Files by Type',
                            subtitleElm: {
                                'File Type': 'mime'
                            },
                            daterange: true
                        }
                    })
                // BY DOMAIN
                .state('by_domain', {
                    url: '/by_domain?start&end',
                    templateUrl: 'public/pages/views/extracted_files/by_domain.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'Extracted Files by Domain',
                        daterange: true
                    }
                })
                    // BY DOMAIN LOCAL
                    .state('by_domain_local', {
                        url: '/by_domain_local?start&end&http_host',
                        templateUrl: 'public/pages/views/extracted_files/by_domain_local.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Local Extracted Files by Domain',
                            subtitleElm: {
                                'Domain': 'http_host'
                            },
                            daterange: true
                        }
                    })
                        // BY DOMAIN LOCAL MIME by_domain_local_mime_drill
                        .state('by_domain_local_mime', {
                            url: '/by_domain_local_mime?start&end&http_host&lan_zone&lan_ip',
                            templateUrl: 'public/pages/views/extracted_files/by_domain_local_mime.html',
                            resolve: {
                                loggedin: checkLoggedin
                            },
                            data: {
                                title: 'Types of Extracted Files by Domain and Local IP',
                                subtitleElm: {
                                    'Zone': 'lan_zone',
                                    'Local IP': 'lan_ip',
                                    'Domain': 'http_host'
                                },
                                daterange: true
                            }
                        })
                            // BY DOMAIN LOCAL MIME DRILL
                            .state('by_domain_local_mime_drill', {
                                url: '/by_domain_local_mime_drill?start&end&http_host&lan_zone&lan_ip&mime',
                                templateUrl: 'public/pages/views/extracted_files/by_domain_local_mime_drill.html',
                                resolve: {
                                    loggedin: checkLoggedin
                                },
                                data: {
                                    title: 'Local Extracted Files by Domain and MIME',
                                    subtitleElm: {
                                        'Zone': 'lan_zone',
                                        'Local IP': 'lan_ip',
                                        'Domain': 'http_host',
                                        'File Type': 'mime'
                                    },
                                    daterange: true
                                }
                            })
            // FIRST SEEN
                // NEW REMOTE IPS
                .state('new_remote', {
                    url: '/new_remote?start&end',
                    templateUrl: 'public/pages/views/first_seen/new_remote.html',
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
                .state('new_ssh_remote', {
                    url: '/new_ssh_remote?start&end',
                    templateUrl: 'public/pages/views/first_seen/new_ssh_remote.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'New Remote IP Detected Serving SSH Traffic',
                        daterange: true
                    }
                })
                // NEW FTP REMOTE IPS
                .state('new_ftp_remote', {
                    url: '/new_ftp_remote?start&end',
                    templateUrl: 'public/pages/views/first_seen/new_ftp_remote.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'New Remote IP Detected Serving FTP Traffic',
                        daterange: true
                    }
                })
            // SYSTEM HEALTH
                // OVERVIEW
                .state('overview', {
                    url: '/overview?start&end',
                    templateUrl: 'public/pages/views/health/overview.html',
                    resolve: {
                        loggedin: checkLoggedin
                    },
                    data: {
                        title: 'RapidPHIRE Health',
                        daterange: true
                    }
                })
                    // HEALTH DRILL
                    .state('health_drill', {
                        url: '/health_drill?start&end&client&zone',
                        templateUrl: 'public/pages/views/health/health_drill.html',
                        resolve: {
                            loggedin: checkLoggedin
                        },
                        data: {
                            title: 'Overall Zone Health',
                            subtitleElm: {
                                'Client': 'client',
                                'Zone': 'zone'
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