'use strict';

//Setting up route
angular.module('mean.pages').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
        // LIVE CONNECTIONS
            .state('pages.live_connections', {
                url: '/live_connections',
                templateUrl: 'public/pages/views/live_connections/live_connections.html',
                data: {
                    // title: 'Live Connections',
                    daterange: false
                }
            })
        // IOC NOTIFICATIONS
            // IOC EVENTS
                .state('pages.ioc_events', {
                    url: '/ioc_events',
                    templateUrl: 'public/pages/views/ioc_notifications/ioc_events.html',
                    data: {
                        title: 'Indicator of Compromise Events',
                        daterange: true
                    }
                })
            // IOC EVENTS DRILLDOWN
                .state('pages.ioc_events_drilldown', {
                        url: '/ioc_events_drilldown',
                        templateUrl: 'public/pages/views/ioc_notifications/ioc_events_drilldown.html',
                        data: {
                            title: 'Indicator of Compromise Events',
                            daterange: true
                        }
                    })
            // IOC REMOTE IPS
                .state('pages.ioc_remote', {
                    url: '/ioc_remote',
                    templateUrl: 'public/pages/views/ioc_notifications/ioc_remote.html',
                    data: {
                        title: 'Indicator of Compromise Events Sorted by Remote IP',
                        daterange: true
                    }
                })
                // IOC REMOTE2LOCAL
                    .state('pages.ioc_remote2local', {
                        url: '/ioc_remote2local',
                        templateUrl: 'public/pages/views/ioc_notifications/ioc_remote2local.html',
                        data: {
                            title: 'Indicator of Compromise Events Sorted by Remote IP',
                            daterange: true
                        }
                    })
            // IOC LOCAL IPS
                .state('pages.ioc_local', {
                    url: '/ioc_local',
                    templateUrl: 'public/pages/views/ioc_notifications/ioc_local.html',
                    data: {
                        title: 'Indicator of Compromise Events Sorted by Local IP',
                        daterange: true
                    }
                })
                // IOC LOCAL IPS DRILL
                    .state('pages.ioc_local_drill', {
                        url: '/ioc_local_drill',
                        templateUrl: 'public/pages/views/ioc_notifications/ioc_local_drill.html',
                        data: {
                            title: 'Indicator of Compromise Events Sorted by Local IP',
                            daterange: true
                        }
                    })
        // GENERAL NETWORK
            // LOCAL IPS
                .state('pages.local', {
                    url: '/local',
                    templateUrl: 'public/pages/views/general_network/local.html',
                    data: {
                        title: 'Local IP Bandwidth Use',
                        daterange: true
                    }
                })
                // REMOTE2LOCAL
                    .state('pages.local2remote', {
                        url: '/local2remote',
                        templateUrl: 'public/pages/views/general_network/local2remote.html',
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
                        .state('pages.shared', {
                            url: '/shared',
                            templateUrl: 'public/pages/views/general_network/shared.html',
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
                .state('pages.remote', {
                    url: '/remote',
                    templateUrl: 'public/pages/views/general_network/remote.html',
                    data: {
                        title: 'Remote IP Bandwidth Use',
                        daterange: true
                    }
                })
                // REMOTE2LOCAL
                    .state('pages.remote2Local', {
                        url: '/remote2local',
                        templateUrl: 'public/pages/views/general_network/remote2local.html',
                        data: {
                            title: 'New Remote IPs Detected',
                            subtitleElm: {
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })
            // DNS BY QUERY TYPE
                .state('pages.dns_by_query_type', {
                    url: '/dns_by_query_type',
                    templateUrl: 'public/pages/views/general_network/dns_by_query_type.html',
                    data: {
                        title: 'DNS by Query Type',
                        daterange: true
                    }
                })
                // DNS BY QUERY TYPE LOCAL
                    .state('pages.dns_by_query_type_local', {
                        url: '/dns_by_query_type_local',
                        templateUrl: 'public/pages/views/general_network/dns_by_query_type_local.html',
                        data: {
                            title: 'Local DNS by Query Type',
                            subtitleElm: {
                                'Query Type': 'qtype'
                            },
                            daterange: true
                        }
                    })
                    // DNS BY QUERY TYPE DRILL
                        .state('pages.dns_by_query_type_local_drill', {
                            url: '/dns_by_query_type_local_drill',
                            templateUrl: 'public/pages/views/general_network/dns_by_query_type_local_drill.html',
                            data: {
                                title: 'Local DNS by Query Type',
                                subtitleElm: {
                                    'Query Type': 'qtype',
                                    'LAN IP': 'lan_ip',
                                    'Zone': 'lan_zone'
                                },
                                daterange: true
                            }
                        })
            // LOCAL FTP 
                .state('pages.ftp_local`', {
                    url: '/ftp_local',
                    templateUrl: 'public/pages/views/general_network/ftp_local.html',
                    data: {
                        title: 'Local FTP',
                        daterange: true
                    }
                })
                // LOCAL2REMOTE FTP
                    .state('pages.ftp_local2remote', {
                        url: '/ftp_local2remote',
                        templateUrl: 'public/pages/views/general_network/ftp_local2remote.html',
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
                        .state('pages.ftp_shared', {
                            url: '/ftp_shared',
                            templateUrl: 'public/pages/views/general_network/ftp_shared.html',
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
                .state('pages.ftp_remote', {
                    url: '/ftp_remote',
                    templateUrl: 'public/pages/views/general_network/ftp_remote.html',
                    data: {
                        title: 'Remote FTP',
                        daterange: true
                    }
                })
                // REMOTE2LOCAL FTP
                    .state('pages.ftp_remote2local', {
                        url: '/ftp_remote2local',
                        templateUrl: 'public/pages/views/general_network/ftp_remote2local.html',
                        data: {
                            title: 'Remote to Local FTP',
                            subtitleElm: {
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })
            // SSH STATUS
                .state('pages.ssh_status', {
                    url: '/ssh_status',
                    templateUrl: 'public/pages/views/general_network/ssh_status.html',
                    data: {
                        title: 'SSH Status',
                        daterange: true
                    }
                })
                // SSH STATUS LOCAL
                    .state('pages.ssh_status_local', {
                        url: '/ssh_status_local',
                        templateUrl: 'public/pages/views/general_network/ssh_status_local.html',
                        data: {
                            title: 'Local SSH Status',
                            subtitleElm: {
                                'Status Code': 'status_code'
                            },
                            daterange: true
                        }
                    })
                    // SSH STATUS LOCAL DRILL
                        .state('pages.ssh_status_local_drill', {
                            url: '/ssh_status_local_drill',
                            templateUrl: 'public/pages/views/general_network/ssh_status_local_drill.html',
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
                .state('pages.ssh_local', {
                    url: '/ssh_local',
                    templateUrl: 'public/pages/views/general_network/ssh_local.html',
                    data: {
                        title: 'Local SSH',
                        daterange: true
                    }
                })
                // SSH LOCAL2REMOTE
                    .state('pages.ssh_local2remote', {
                        url: '/ssh_local2remote',
                        templateUrl: 'public/pages/views/general_network/ssh_local2remote.html',
                        data: {
                            title: 'SSH Local to Remote',
                            subtitleElm: {
                                'Local IP': 'lan_ip'
                            },
                            daterange: true
                        }
                    })
                    // SSH SHARED
                    .state('pages.ssh_shared', {
                        url: '/ssh_shared',
                        templateUrl: 'public/pages/views/general_network/ssh_shared.html',
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
                .state('pages.ssh_remote', {
                    url: '/ssh_remote',
                    templateUrl: 'public/pages/views/general_network/ssh_remote.html',
                    data: {
                        title: 'Remote SSH',
                        daterange: true
                    }
                })
                // SSH REMOTE2LOCAL
                    .state('pages.ssh_remote2local', {
                        url: '/ssh_remote2local',
                        templateUrl: 'public/pages/views/general_network/ssh_remote2local.html',
                        data: {
                            title: 'SSH Remote to Local',
                            subtitleElm: {
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })
            // LOCAL IRC
                .state('pages.irc_local', {
                    url: '/irc_local',
                    templateUrl: 'public/pages/views/general_network/irc_local.html',
                    data: {
                        title: 'Local IRC',
                        daterange: true
                    }
                })
                // LOCAL2REMOTE IRC
                    .state('pages.irc_local2remote', {
                        url: '/irc_local2remote',
                        templateUrl: 'public/pages/views/general_network/irc_local2remote.html',
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
                        .state('pages.irc_shared', {
                            url: '/irc_shared',
                            templateUrl: 'public/pages/views/general_network/irc_shared.html',
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
                .state('pages.irc_remote', {
                    url: '/irc_remote',
                    templateUrl: 'public/pages/views/general_network/irc_remote.html',
                    data: {
                        title: 'Remote IRC',
                        daterange: true
                    }
                })
                // REMOTE2LOCAL IRC
                    .state('pages.irc_remote2local', {
                        url: '/irc_remote2local',
                        templateUrl: 'public/pages/views/general_network/irc_remote2local.html',
                        data: {
                            title: 'Remote to Local IRC',
                            subtitleElm: {
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })                    
            // FIREWALL
                .state('pages.firewall', {
                    url: '/firewall',
                    templateUrl: 'public/pages/views/general_network/firewall.html',
                    data: {
                        title: 'Firewall Rules',
                        daterange: true
                    }
                })
        // STEALTH
            // STEALTH DEPLOY CONFIG
                .state('pages.stealth_deploy_config', {
                    url: '/stealth_deploy_config',
                    templateUrl: 'public/pages/views/stealth/stealth_deploy_config.html',
                    data: {
                        title: 'Stealth Deployment Configuration',
                        daterange: true
                    }
                })  
            // STEALTH OP VIEW
                .state('pages.stealth_op_view', {
                    url: '/stealth_op_view',
                    templateUrl: 'public/pages/views/stealth/stealth_op_view.html',
                    data: {
                        title: 'Stealth Operational View',
                        daterange: true
                    }
                })       
            // STEALTH CONN
                .state('pages.stealth_conn', {
                    url: '/stealth_conn',
                    templateUrl: 'public/pages/views/stealth/stealth_conn.html',
                    data: {
                        title: 'Stealth User Connections',
                        daterange: true
                    }
                })         
                // STEALTH CONN BY USER
                    .state('pages.stealth_conn_by_user', {
                        url: '/stealth_conn_by_user',
                        templateUrl: 'public/pages/views/stealth/stealth_conn_by_user.html',
                        data: {
                            title: 'Stealth User Connections',
                            subtitleElm: {
                                'Zone': 'lan_zone',
                                'Local Machine': 'lan_machine',
                                'Local User': 'lan_user',
                                'Local IP': 'lan_ip'
                            },
                            daterange: true
                        }
                    })   
                    // STEALTH CONN BY USER AND REMOTE
                        .state('pages.stealth_conn_by_userANDremote', {
                            url: '/stealth_conn_by_userANDremote',
                            templateUrl: 'public/pages/views/stealth/stealth_conn_by_userANDremote.html',
                            data: {
                                title: 'Local User Connections',
                                subtitleElm: {
                                    'Zone': 'lan_zone',
                                    'Local Machine': 'lan_machine',
                                    'Local User': 'lan_user',
                                    'Local IP': 'lan_ip',
                                    'Remote IP': 'remote_ip'
                                },
                                daterange: true
                            }
                        }) 
            // STEALTH EVENTS
                .state('pages.stealth_events', {
                    url: '/stealth_events',
                    templateUrl: 'public/pages/views/stealth/stealth_events.html',
                    data: {
                        title: 'Stealth Events',
                        daterange: true
                    }
                })
                // STEALTH EVENTS USER
                    .state('pages.stealth_events_by_type_and_user', {
                        url: '/stealth_events_by_type_and_user',
                        templateUrl: 'public/pages/views/stealth/stealth_events_by_type_and_user.html',
                        data: {
                            title: 'Stealth Users Triggering Event',
                            subtitleElm: {
                                'Event Type': 'event_type'
                            },
                            daterange: true
                        }
                    })
                    // STEALTH EVENTS USER DRILL
                        .state('pages.stealth_events_full', {
                            url: '/stealth_events_full',
                            templateUrl: 'public/pages/views/stealth/stealth_events_full.html',
                            data: {
                                title: 'Stealth Event Full Logs',
                                subtitleElm: {
                                    'Zone': 'lan_zone',
                                    'User': 'lan_user',
                                    'Event Type': 'event_type',
                                },
                                daterange: true
                            }
                        })
            // STEALTH QUARANTINE
                .state('pages.stealth_quarantine', {
                    url: '/stealth_quarantine',
                    templateUrl: 'public/pages/views/stealth/stealth_quarantine.html',
                    data: {
                        title: 'Quarantined Endpoints',
                        daterange: true
                    }
                })           
        // LOCAL EVENTS
            // ENDPOINT MAP
                .state('pages.endpoint_map', {
                    url: '/endpoint_map',
                    templateUrl: 'public/pages/views/local_events/endpoint_map.html',
                    data: {
                        title: 'Endpoint Map',
                        daterange: true
                    }
                })
            // ENDPOINT BY TYPE
                .state('pages.endpoint_by_type', {
                    url: '/endpoint_by_type',
                    templateUrl: 'public/pages/views/local_events/endpoint_by_type.html',
                    data: {
                        title: 'Endpoint Events By Type',
                        daterange: true
                    }
                })
                // ENDPOINT EVENTS USER
                    .state('pages.endpoint_by_type_and_user', {
                        url: '/endpoint_by_type_and_user',
                        templateUrl: 'public/pages/views/local_events/endpoint_by_type_and_user.html',
                        data: {
                            title: 'Endpoints Triggering Event',
                            subtitleElm: {
                                'Event Type': 'event_type'
                            },
                            daterange: true
                        }
                    })
                    // ENDPOINT EVENTS USER DRILL
                        .state('pages.endpoint_full', {
                            url: '/endpoint_full',
                            templateUrl: 'public/pages/views/local_events/endpoint_full.html',
                            data: {
                                title: 'Endpoint Event Full Logs',
                                subtitleElm: {
                                    'Zone': 'lan_zone',
                                    'User': 'lan_user',
                                    'Event Type': 'event_type',
                                },
                                daterange: true
                            }
                        })
            // ENDPOINT BY LOCAL IP
                .state('pages.endpoint_by_user', {
                    url: '/endpoint_by_user',
                    templateUrl: 'public/pages/views/local_events/endpoint_by_user.html',
                    data: {
                        title: 'Endpoint Events By Local IP',
                        daterange: true
                    }
                })
                // ENDPOINT EVENTS LOCAL BY ALERT INFO 
                    .state('pages.endpoint_by_user_and_type', {
                        url: '/endpoint_by_user_and_type',
                        templateUrl: 'public/pages/views/local_events/endpoint_by_user_and_type.html',
                        data: {
                            title: 'Endpoints Triggering Event',
                            subtitleElm: {
                                'Zone': 'lan_zone',
                                'User': 'lan_user',
                            },
                            daterange: true
                        }
                    })
            // ENDPOINT EVENTS SHAREPOINT
                .state('pages.endpoint_events_sharepoint', {
                    url: '/endpoint_events_sharepoint',
                    templateUrl: 'public/pages/views/local_events/endpoint_events_sharepoint.html',
                    data: {
                        title: 'Endpoint Sharepoint Events by Type',
                        daterange: true
                    }
                })
                // ENDPOINT EVENTS SHAREPOINT DRILL
                    .state('pages.endpoint_events_sharepoint_drill', {
                        url: '/endpoint_events_sharepoint_drill',
                        templateUrl: 'public/pages/views/local_events/endpoint_events_sharepoint_drill.html',
                        data: {
                            title: 'Endpoint Sharepoint Local Events',
                            subtitleElm: {
                                'Event Type': 'event_type'
                            },
                            daterange: true
                        }
                    })
                        // ENDPOINT EVENTS SHAREPOINT FULL
                        .state('pages.endpoint_events_sharepoint_full', {
                            url: '/endpoint_events_sharepoint_full',
                            templateUrl: 'public/pages/views/local_events/endpoint_events_sharepoint_full.html',
                            data: {
                                title: 'Endpoint Sharepoint Event Full Logs',
                                subtitleElm: {
                                    'Event Type': 'event_type',
                                    'Local IP': 'lan_ip',
                                    'Zone': 'lan_zone',
                                    'User': 'lan_user'
                                },
                                daterange: true
                            }
                        })
                // ENDPOINT EVENTS LOCAL BY IP 
                    .state('pages.endpoint_by_user_and_ip', {
                        url: '/endpoint_by_user_and_ip',
                        templateUrl: 'public/pages/views/local_events/endpoint_by_user_and_ip.html',
                        data: {
                            title: 'Endpoints Triggering Event',
                            subtitleElm: {
                                'Zone': 'lan_zone',
                                'Local IP': 'lan_ip'
                            },
                            daterange: true
                        }
                    })
        // APPLICATIONS
            // BY APPLICATION
                .state('pages.app_by_application', {
                    url: '/app_by_application',
                    templateUrl: 'public/pages/views/applications/app_by_application.html',
                    data: {
                        title: 'Applications',
                        daterange: true
                    }
                })
                // APPLICATION DRILL
                    .state('pages.application_drill', {
                        url: '/application_drill',
                        templateUrl: 'public/pages/views/applications/application_drill.html',
                        data: {
                            title: 'Applications',
                            subtitleElm: {
                                'L7 Protocol': 'l7_proto'
                            },
                            daterange: true
                        }
                    })
                    // APPLICATION LOCAL
                        .state('pages.application_local', {
                            url: '/application_local',
                            templateUrl: 'public/pages/views/applications/application_local.html',
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
                .state('pages.app_by_local_ip', {
                    url: '/app_by_local_ip',
                    templateUrl: 'public/pages/views/applications/app_by_local_ip.html',
                    data: {
                        title: 'Applications',
                        daterange: true
                    }
                })
                // L7 LOCAL APP
                    .state('pages.l7_local_app', {
                        url: '/l7_local_app',
                        templateUrl: 'public/pages/views/applications/l7_local_app.html',
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
                    .state('pages.l7_local_drill', {
                        url: '/l7_local_drill',
                        templateUrl: 'public/pages/views/applications/l7_local_drill.html',
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
                        .state('pages.l7_shared', {
                            url: '/l7_shared',
                            templateUrl: 'public/pages/views/applications/l7_shared.html',
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
                .state('pages.app_by_remote_ip', {
                    url: '/app_by_remote_ip',
                    templateUrl: 'public/pages/views/applications/app_by_remote_ip.html',
                    data: {
                        title: 'Applications',
                        daterange: true
                    }
                })
                // L7 REMOTE APP
                    .state('pages.l7_remote_app', {
                        url: '/l7_remote_app',
                        templateUrl: 'public/pages/views/applications/l7_remote_app.html',
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
                    .state('pages.l7_remote_drill', {
                        url: '/l7_remote_drill',
                        templateUrl: 'public/pages/views/applications/l7_remote_drill.html',
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
                .state('pages.http_by_domain', {
                    url: '/http_by_domain',
                    templateUrl: 'public/pages/views/http/http_by_domain.html',
                    data: {
                        title: 'HTTP By Domain',
                        daterange: true
                    }
                })
                // HTTP BY DOMAIN LOCAL
                    .state('pages.http_by_domain_local', {
                        url: '/http_by_domain_local',
                        templateUrl: 'public/pages/views/http/http_by_domain_local.html',
                        data: {
                            title: 'Local HTTP By Domain',
                            subtitleElm: {
                                'Domain': 'host'
                            },
                            daterange: true
                        }
                    })
                    // HTTP BY DOMAIN LOCAL DRILL
                        .state('pages.http_by_domain_local_drill', {
                            url: '/http_by_domain_local_drill',
                            templateUrl: 'public/pages/views/http/http_by_domain_local_drill.html',
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
            // HTTP BY USER AGENT
                .state('pages.http_by_user_agent', {
                    url: '/http_by_user_agent',
                    templateUrl: 'public/pages/views/http/http_by_user_agent.html',
                    data: {
                        title: 'HTTP By User Agent',
                        daterange: true
                    }
                })
                // HTTP BY USER AGENT LOCAL
                    .state('pages.http_by_user_agent_local', {
                        url: '/http_by_user_agent_local',
                        templateUrl: 'public/pages/views/http/http_by_user_agent_local.html',
                        data: {
                            title: 'Local HTTP By User Agent',
                            subtitleElm: {
                                'User Agent': 'user_agent'
                            },
                            daterange: true
                        }
                    })
                    // HTTP BY USER AGENT LOCAL DRILL
                        .state('pages.http_by_user_agent_local_drill', {
                            url: '/http_by_user_agent_local_drill',
                            templateUrl: 'public/pages/views/http/http_by_user_agent_local_drill.html',
                            data: {
                                title: 'Local HTTP By User Agent',
                                subtitleElm: {
                                    'User Agent': 'user_agent',
                                    'LAN IP': 'lan_ip',
                                    'Zone': 'lan_zone'
                                },
                                daterange: true
                            }
                        })
            // HTTP LOCAL
                .state('pages.http_local', {
                    url: '/http_local',
                    templateUrl: 'public/pages/views/http/http_local.html',
                    data: {
                        title: 'Local HTTP',
                        daterange: true
                    }
                })
                // HTTP LOCAL BY DOMAIN
                    .state('pages.http_local_by_domain', {
                        url: '/http_local_by_domain',
                        templateUrl: 'public/pages/views/http/http_local_by_domain.html',
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
                .state('pages.http_remote', {
                    url: '/http_remote',
                    templateUrl: 'public/pages/views/http/http_remote.html',
                    data: {
                        title: 'Remote HTTP',
                        daterange: true
                    }
                })
                // HTTP REMOTE2LOCAL
                    .state('pages.http_remote2local', {
                        url: '/http_remote2local',
                        templateUrl: 'public/pages/views/http/http_remote2local.html',
                        data: {
                            title: 'Remote to Local HTTP',
                            subtitleElm: {
                                'Remote IP': 'remote_ip'
                            },
                            daterange: true
                        }
                    })
                    // HTTP REMOTE2LOCAL DRILL
                        .state('pages.http_remote2local_drill', {
                            url: '/http_remote2local_drill',
                            templateUrl: 'public/pages/views/http/http_remote2local_drill.html',
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
            // HTTP LOCAL BLOCKED
                .state('pages.http_local_blocked', {
                    url: '/http_local_blocked',
                    templateUrl: 'public/pages/views/http/http_local_blocked.html',
                    data: {
                        title: 'Local HTTP Blocked By Web Proxy',
                        daterange: true
                    }
                })
                // HTTP LOCAL BY DOMAIN BLOCKED
                    .state('pages.http_local_by_domain_blocked', {
                        url: '/http_local_by_domain_blocked',
                        templateUrl: 'public/pages/views/http/http_local_by_domain_blocked.html',
                        data: {
                            title: 'Local HTTP by Domain Blocked By Web Proxy',
                            subtitleElm: {
                                    'Zone': 'lan_zone',
                                    'Local IP': 'lan_ip'
                                },
                            daterange: true
                        }
                    })
                    // HTTP BY DOMAIN LOCAL DRILL BLOCKED
                    .state('pages.http_by_domain_local_drill_blocked', {
                        url: '/http_by_domain_local_drill_blocked',
                        templateUrl: 'public/pages/views/http/http_by_domain_local_drill_blocked.html',
                        data: {
                            title: 'Local HTTP By Domain Blocked By Web Proxy',
                            subtitleElm: {
                                'Zone': 'lan_zone',
                                'LAN IP': 'lan_ip',
                                'Domain': 'host'
                            },
                            daterange: true
                        }
                    })
        // SSL
            // SSL SERVER
                .state('pages.ssl_server', {
                    url: '/ssl_server',
                    templateUrl: 'public/pages/views/ssl/ssl_server.html',
                    data: {
                        title: 'SSL Server',
                        daterange: true
                    }
                })
            // LOCAL SSL
                .state('pages.ssl_local', {
                    url: '/ssl_local',
                    templateUrl: 'public/pages/views/ssl/ssl_local.html',
                    data: {
                        title: 'Local SSL',
                        daterange: true
                    }
                })
            // REMOTE SSL
                .state('pages.ssl_remote', {
                    url: '/ssl_remote',
                    templateUrl: 'public/pages/views/ssl/ssl_remote.html',
                    data: {
                        title: 'Remote SSL',
                        daterange: true
                    }
                })
        // EMAIL
            // LOCAL SMTP 
                .state('pages.smtp_senders', {
                    url: '/smtp_senders',
                    templateUrl: 'public/pages/views/email/smtp_senders.html',
                    data: {
                        title: 'Email Senders',
                        daterange: true
                    }
                })
                // SMTP SENDER2RECEIVER
                    .state('pages.smtp_sender2receiver', {
                        url: '/smtp_sender2receiver',
                        templateUrl: 'public/pages/views/email/smtp_sender2receiver.html',
                        data: {
                            title: 'Senders/Reveivers',
                            subtitleElm: {
                                'Sender': 'mailfrom'
                            },
                            daterange: true
                        }
                    })
                    // SMTP FROM SENDER 
                        .state('pages.smtp_from_sender', {
                            url: '/smtp_from_sender',
                            templateUrl: 'public/pages/views/email/smtp_from_sender.html',
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
                .state('pages.smtp_receivers', {
                    url: '/smtp_receivers',
                    templateUrl: 'public/pages/views/email/smtp_receivers.html',
                    data: {
                        title: 'Email Receivers',
                        daterange: true
                    }
                })
                // SMTP RECEIVER2SENDER
                    .state('pages.smtp_receiver2sender', {
                        url: '/smtp_receiver2sender',
                        templateUrl: 'public/pages/views/email/smtp_receiver2sender.html',
                        data: {
                            title: 'Receivers/Senders',
                            subtitleElm: {
                                'Receiver': 'receiptto'
                            },
                            daterange: true
                        }
                    })
            // SMTP SUBJECTS 
                .state('pages.smtp_subjects', {
                    url: '/smtp_subjects',
                    templateUrl: 'public/pages/views/email/smtp_subjects.html',
                    data: {
                        title: 'Email Subjects',
                        daterange: true
                    }
                })
                // SMTP SUBJECTS SENDER RECEIVER PAIRS
                .state('pages.smtp_subject_sender_receiver_pairs', {
                    url: '/smtp_subject_sender_receiver_pairs',
                    templateUrl: 'public/pages/views/email/smtp_subject_sender_receiver_pairs.html',
                    data: {
                        title: 'Receiver/Sender pairs for Subject',
                        subtitleElm: {
                            'Subject': 'subject'
                        },
                        daterange: true
                    }
                })
                    // SMTP FROM SENDER BY SUBJECT
                    .state('pages.smtp_from_sender_by_subject', {
                        url: '/smtp_from_sender_by_subject',
                        templateUrl: 'public/pages/views/email/smtp_from_sender_by_subject.html',
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
            // BY MIME TYPE
                .state('pages.files_by_mime_type', {
                    url: '/files_by_mime_type',
                    templateUrl: 'public/pages/views/extracted_files/files_by_mime_type.html',
                    data: {
                        title: 'Extracted Files by Type',
                        daterange: true
                    }
                })
                // BY MIME TYPE
                    .state('pages.files_mime_local', {
                        url: '/files_mime_local',
                        templateUrl: 'public/pages/views/extracted_files/files_mime_local.html',
                        data: {
                            title: 'Extracted Files by Type',
                            subtitleElm: {
                                'File Type': 'mime'
                            },
                            daterange: true
                        }
                    })
            // BY LOCAL IP
                .state('pages.files_by_local_ip', {
                    url: '/files_by_local_ip',
                    templateUrl: 'public/pages/views/extracted_files/files_by_local_ip.html',
                    data: {
                        title: 'Extracted Files by Local IP',
                        daterange: true
                    }
                })
                // BY FILE NAME
                .state('pages.files_by_file_name', {
                    url: '/files_by_file_name',
                    templateUrl: 'public/pages/views/extracted_files/files_by_file_name.html',
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
                    .state('pages.files_local', {
                        url: '/files_local',
                        templateUrl: 'public/pages/views/extracted_files/files_local.html',
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
                .state('pages.files_by_remote_ip', {
                    url: '/files_by_remote_ip',
                    templateUrl: 'public/pages/views/extracted_files/files_by_remote_ip.html',
                    data: {
                        title: 'Extracted Files by Remote IP',
                        daterange: true
                    }
                })
                // BY FILE NAME
                .state('pages.files_by_file_name_remote', {
                    url: '/files_by_file_name_remote',
                    templateUrl: 'public/pages/views/extracted_files/files_by_file_name_remote.html',
                    data: {
                        title: 'File Types',
                        subtitleElm: {
                            'Remote IP': 'remote_ip'
                        },
                        daterange: true
                    }
                })
                    // FILE REMOTE
                    .state('pages.files_remote', {
                        url: '/files_remote',
                        templateUrl: 'public/pages/views/extracted_files/files_remote.html',
                        data: {
                            title: 'Extracted Files for Remote IP',
                            subtitleElm: {
                                'Remote IP': 'remote_ip',
                                'File Type': 'mime'
                            },
                            daterange: true
                        }
                    })
            // BY DOMAIN
                .state('pages.files_by_domain', {
                    url: '/files_by_domain',
                    templateUrl: 'public/pages/views/extracted_files/files_by_domain.html',
                    data: {
                        title: 'Extracted Files by Domain',
                        daterange: true
                    }
                })
                // BY DOMAIN LOCAL
                    .state('pages.files_by_domain_local', {
                        url: '/files_by_domain_local',
                        templateUrl: 'public/pages/views/extracted_files/files_by_domain_local.html',
                        data: {
                            title: 'Local Extracted Files by Domain',
                            subtitleElm: {
                                'Domain': 'http_host'
                            },
                            daterange: true
                        }
                    })
                    // BY DOMAIN LOCAL MIME by_domain_local_mime_drill
                        .state('pages.files_by_domain_local_mime', {
                            url: '/files_by_domain_local_mime',
                            templateUrl: 'public/pages/views/extracted_files/files_by_domain_local_mime.html',
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
                            .state('pages.files_by_domain_local_mime_drill', {
                                url: '/files_by_domain_local_mime_drill',
                                templateUrl: 'public/pages/views/extracted_files/files_by_domain_local_mime_drill.html',
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
                .state('pages.new_remote', {
                    url: '/new_remote',
                    templateUrl: 'public/pages/views/first_seen/new_remote.html',
                    data: {
                        title: 'New Remote IPs Detected',
                        daterange: true
                    }
                })
            // NEW DNS QUERIES
                .state('pages.new_dns_queries', {
                    url: '/new_dns_queries',
                    templateUrl: 'public/pages/views/first_seen/new_dns_queries.html',
                    data: {
                        title: 'New DNS Queries Detected',
                        daterange: true
                    }
                })
            // NEW HTTP HOSTS
                .state('pages.new_http_domains', {
                    url: '/new_http_domains',
                    templateUrl: 'public/pages/views/first_seen/new_http_domains.html',
                    data: {
                        title: 'New HTTP Domains Detected',
                        daterange: true
                    }
                })
            // NEW SSL HOSTS
                .state('pages.new_ssl_hosts', {
                    url: '/new_ssl_hosts',
                    templateUrl: 'public/pages/views/first_seen/new_ssl_hosts.html',
                    data: {
                        title: 'New Remote Server Detected Serving SSL Traffic',
                        daterange: true
                    }
                })
            // NEW SSL REMOTE IPS
                .state('pages.new_ssh_remote', {
                    url: '/new_ssh_remote',
                    templateUrl: 'public/pages/views/first_seen/new_ssh_remote.html',
                    data: {
                        title: 'New Remote IP Detected Serving SSH Traffic',
                        daterange: true
                    }
                })
            // NEW FTP REMOTE IPS
                .state('pages.new_ftp_remote', {
                    url: '/new_ftp_remote',
                    templateUrl: 'public/pages/views/first_seen/new_ftp_remote.html',
                    data: {
                        title: 'New Remote IP Detected Serving FTP Traffic',
                        daterange: true
                    }
                })
        // // SYSTEM HEALTH
        //     // OVERVIEW
        //         .state('pages.overview', {
        //             url: '/overview',
        //             templateUrl: 'public/pages/views/health/overview.html',
        //             data: {
        //                 title: 'RapidPHIRE Health',
        //                 daterange: true
        //             }
        //         })
        //         // HEALTH DRILL
        //         .state('pages.health_drill', {
        //             url: '/health_drill',
        //             templateUrl: 'public/pages/views/health/health_drill.html',
        //             data: {
        //                 title: 'Overall Zone Health',
        //                 subtitleElm: {
        //                     'Client': 'client',
        //                     'Zone': 'zone'
        //                 },
        //                 daterange: true
        //             }
        //         })
        // REPORTS
            // IOC EVENTS
                .state('pages.ioc_events_report', {
                    url: '/ioc_events_report',
                    templateUrl: 'public/pages/views/reports/ioc_events.html',
                    data: {
                        title: 'IOC Events Report',
                        daterange: false
                    }
                })
        // ARCHIVE
            .state('pages.archive', {
                url: '/archive',
                templateUrl: 'public/pages/views/archive.html',
                data: {
                    title: 'Archive',
                    daterange: false
                }
            })
        // SITE SURVEY
            .state('pages.survey', {
                url: '/survey',
                templateUrl: 'public/pages/views/survey/survey.html',
                data: {
                    title: 'Site Survey',
                    daterange: false
                }
            })        
        // USERS
            // USER MANAGEMENT
                .state('pages.create_user', {
                    url: '/create_user',
                    templateUrl: 'public/pages/views/users/create_user.html',
                    data: {
                        title: 'User Management',
                        daterange: false
                    }
                })
            // FIRST LOGIN
                .state('pages.first_login', {
                    url: '/first_login',
                    templateUrl: 'public/pages/views/users/first_login.html',
                    data: {
                        title: 'Set Initial Password',
                        daterange: false
                    }
                })
    }
]);