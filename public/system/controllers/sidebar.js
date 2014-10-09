'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$location', function ($scope, Global, $location) {
    $scope.global = Global;
    $scope.select = function(url){
        if (url !== '') {
            if ($location.$$search.start && $location.$$search.end) {
                $location.path(url).search({'start':$location.$$search.start, 'end':$location.$$search.end});
            } else {
                $location.path(url);
            }
            $.noty.closeAll();
        }
    };
    $scope.display = function (accessLevel) {
        if ((accessLevel === undefined) || (accessLevel.length === 0)) {
            return true;
        } else if (accessLevel.length > 0) {
            if (accessLevel.indexOf($scope.global.user.level) !== -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    $scope.parentClass = function (link) {
        var currentRoute = $location.path().substring(1) || 'home';
        // return page === currentRoute ? 'start active' : '';
        var linkClass = '';
        if (link.url === currentRoute) {
            linkClass = 'start active';
        }
        if (link.children.length >0) {
            link.children.forEach(function(d){
                if (d.url === currentRoute) {
                    linkClass = 'start active open';
                }
                if (d.orphans.length > 0) {
                    d.orphans.forEach(function(e){
                        if (e === currentRoute) {
                            linkClass = 'start active open';
                        }
                    });
                }
            });
        }
        return linkClass;
    };
    $scope.parentClassSelected = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'selected' : '';
    };
    $scope.childClass = function (link) {
        var currentRoute = $location.path().substring(1) || 'home';
        var linkClass = '';
        if (link.url === currentRoute){
            linkClass = 'active';
        }
        if (link.orphans.length >0) {
            link.orphans.forEach(function(d){
                if (d === currentRoute) {
                    linkClass = 'active';
                }
            });
        }
        return linkClass;
    };
    $scope.sidebaritems = [
        { // LIVE CONNECTIONS
            'title': 'Live Connections',
            'url': 'live_connections',
            'icon': 'fa-map-marker',
            'children': []
        },
        { // IOC NOTIFICATIONS
            'title': 'IOC Notifications',
            'url': '',
            'icon': 'fa-warning',
            'children':
            [
                {
                    'title': 'By Event',
                    'url': 'ioc_events',
                    'icon': 'fa-warning',
                    // 'accessLevel': [1], // if you'd like to limit access to a specific child instead
                    'orphans': ['ioc_drill', 'ioc_events_drilldown']
                },
                {
                    'title': 'By Local IP',
                    'url': 'ioc_local',
                    'icon': 'fa-warning',
                    'orphans': ['ioc_local_drill']
                },
                {
                    'title': 'By Remote IP',
                    'url': 'ioc_remote',
                    'icon': 'fa-warning',
                    'orphans': ['ioc_remote2local']
                }
            ]
        },
        { // GENERAL NETWORK
            'title': 'General Network',
            'url': '',
            'icon': 'fa-sitemap',
            'children':
            [
                {
                    'title': 'Local Connections',
                    'url': 'local',
                    'icon': 'fa-cloud-download',
                    'orphans': ['local2remote', 'shared']
                },
                {
                    'title': 'Remote Connections',
                    'url': 'remote',
                    'icon': 'fa-cloud-upload',
                    'orphans': ['remote2local', 'shared']
                },
                {
                    'title': 'Local FTP',
                    'url': 'ftp_local',
                    'icon': 'fa-file',
                    'orphans': ['ftp_local2remote', 'ftp_shared']
                },
                {
                    'title': 'Remote FTP',
                    'url': 'ftp_remote',
                    'icon': 'fa-file',
                    'orphans': ['ftp_remote2local', 'ftp_shared']
                },
                {
                    'title': 'SSH Status',
                    'url': 'ssh_status',
                    'icon': 'fa-chevron-right',
                    'orphans': ['ssh_status_local', 'ssh_status_local_drill']
                },
                {
                    'title': 'Local SSH',
                    'url': 'ssh_local',
                    'icon': 'fa-chevron-right',
                    'orphans': ['ssh_local2remote', 'ssh_shared']
                },
                {
                    'title': 'Remote SSH',
                    'url': 'ssh_remote',
                    'icon': 'fa-chevron-right',
                    'orphans': ['ssh_remote2local', 'ssh_shared']
                },
                {
                    'title': 'Local IRC',
                    'url': 'irc_local',
                    'icon': 'fa-comment',
                    'orphans': ['irclocal2remote', 'irc_shared']
                },
                {
                    'title': 'Remote IRC',
                    'url': 'irc_remote',
                    'icon': 'fa-comment',
                    'orphans': ['irc_remote2local', 'irc_shared']
                },                
            ]
        },
        { // STEALTH
            'title': 'Stealth',
            'accessLevel': [3], 
            'url': '',
            'icon': 'fa-shield',
            'children':
            [
                {
                    'title': 'Stealth Deploy Config',
                    'url': 'stealth_COI_map',
                    'icon': 'fa-code-fork',
                    'orphans': []
                },
                {
                    'title': 'Stealth Ops View',
                    'url': 'local_COI_remote',
                    'icon': 'fa-shield',
                    'orphans': []
                },
                {
                    'title': 'Local User Connections',
                    'url': 'local_user_conn',
                    'icon': 'fa-user',
                    'orphans': []
                },
            ]
        },
        { // LOCAL EVENTS
            'title': 'Local Events',
            'url': '',
            'icon': 'fa-user',
            'children':
            [
                // {
                //     'title': 'Local Network Map',
                //     'url': 'local_network_map',
                //     'icon': 'fa-sitemap',
                //     'orphans': []
                // },
                {
                    'title': 'Endpoint Map',
                    'url': 'local_floor_plan',
                    'icon': 'fa-user',
                    'orphans': []
                },
                {
                    'title': 'Endpoint By Type',
                    'url': 'endpoint_by_type',
                    'icon': 'fa-desktop',
                    'orphans': ['endpoint_by_type_and_user','endpoint_full']
                },
                {
                    'title': 'Endpoint By User',
                    'url': 'endpoint_by_user',
                    'icon': 'fa-desktop',
                    'orphans': ['endpoint_by_user_and_type', 'endpoint_full']
                },
                {
                    'title': 'Sharepoint Access',
                    'url': 'endpoint_events_sharepoint',
                    'icon': 'fa-desktop',
                    'orphans': ['endpoint_events_sharepoint_drill']
                }
            ]
        },
        //
            // {
            //     'title': 'DNS',
            //     'url': '',
            //     'icon': 'fa-level-up',
            //     'children':
            //     [
            //         {
            //             'title': 'Local DNS',
            //             'url': 'dns_local',
            //             'icon': 'fa-level-down',
            //             'orphans': []
            //         },
            //         {
            //             'title': 'Remote DNS',
            //             'url': 'dns_remote',
            //             'icon': 'fa-level-up',
            //             'orphans': []
            //         }
            //     ]
            // },
            // {
            //     'title': 'SSL',
            //     'url': '',
            //     'icon': 'fa-lock',
            //     'children':
            //     [
            //         {
            //             'title': 'SSL Server',
            //             'url': 'ssl_server',
            //             'icon': 'fa-lock',
            //             'orphans': []
            //         },
            //         {
            //             'title': 'Local SSL',
            //             'url': 'ssl_local',
            //             'icon': 'fa-lock',
            //             'orphans': []
            //         },
            //         {
            //             'title': 'Remote SSL',
            //             'url': 'ssl_remote',
            //             'icon': 'fa-lock',
            //             'orphans': []
            //         }
            //     ]
            // },
        { // APPLICATIONS
            'title': 'Applications',
            'url': '',
            'icon': 'fa-bars',
            'children':
            [
                {
                    'title': 'By Application',
                    'url': 'app_by_application',
                    'icon': 'fa-bars',
                    'orphans': ['application_drill', 'application_local', 'l7_shared']
                },
                {
                    'title': 'By Local IP',
                    'url': 'app_by_local_ip',
                    'icon': 'fa-bars',
                    'orphans': ['l7_local_app', 'l7_local_drill', 'l7_shared']
                },
                {
                    'title': 'By Remote IP',
                    'url': 'app_by_remote_ip',
                    'icon': 'fa-bars',
                    'orphans': ['l7_remote_app', 'l7_remote_drill', 'l7_shared']
                }
            ]
        },
        { // HTTP
            'title': 'HTTP',
            'url': '',
            'icon': 'fa-globe',
            'children':
            [
                {
                    'title': 'HTTP by Domain',
                    'url': 'http_by_domain',
                    'icon': 'fa-arrows-h',
                    'orphans': ['http_by_domain_local', 'http_by_domain_local_drill']
                },
                {
                    'title': 'Local HTTP',
                    'url': 'http_local',
                    'icon': 'fa-long-arrow-left',
                    'orphans': ['http_local_by_domain', 'http_by_domain_local_drill']
                },
                {
                    'title': 'Remote HTTP',
                    'url': 'http_remote',
                    'icon': 'fa-long-arrow-right',
                    'orphans': ['http_remote2local', 'http_remote2local_drill']
                },
                {
                    'title': 'Local Blocked HTTP',
                    'accessLevel': [2],   
                    'url': 'http_local_blocked',
                    'icon': 'fa-times',
                    'orphans': ['http_local_by_domain_blocked', 'http_by_domain_local_drill_blocked']
                },
            ]
        },
        { // EMAIL
            'title': 'Email',
            'url': '',
            'icon': 'fa-envelope',
            'children':
            [
                {
                    'title': 'By Sender',
                    'url': 'smtp_senders',
                    'icon': 'fa-mail-forward',
                    'orphans': ['smtp_sender2receiver','smtp_from_sender']
                },
                {
                    'title': 'By Receiver',
                    'url': 'smtp_receivers',
                    'icon': 'fa-mail-reply',
                    'orphans': ['smtp_receiver2sender','smtp_from_sender']
                },
                {
                    'title': 'By Subject',
                    'url': 'smtp_subjects',
                    'icon': 'fa-envelope',
                    'orphans': ['smtp_subject_sender_receiver_pairs', 'smtp_from_sender_by_subject']
                }
            ]
        },
        { // EXTRACTED FILES
            'title': 'Extracted Files',
            'url': '',
            'icon': 'fa-folder',
            'children':
            [
                {
                    'title': 'By File Type',
                    'url': 'by_mime_type',
                    'icon': 'fa-folder-open',
                    'orphans': ['file_mime_local', 'file_local']
                },
                {
                    'title': 'By Local IP',
                    'url': 'by_local_ip',
                    'icon': 'fa-folder-open',
                    'orphans': ['by_file_name','file_local']
                },
                {
                    'title': 'By Remote IP',
                    'url': 'by_remote_ip',
                    'icon': 'fa-folder-open',
                    'orphans': ['by_file_name_remote','file_remote']
                },
                {
                    'title': 'By Domain',
                    'url': 'by_domain',
                    'icon': 'fa-folder-open',
                    'orphans': ['by_domain_local', 'by_domain_local_mime', 'by_domain_local_mime_drill']
                }
            ]
        },
        { // FIRST SEEN
            'title': 'First Seen',
            'url': '',
            'icon': 'fa-asterisk',
            'children':
            [
                {
                    'title': 'New Remote IPs',
                    'url': 'new_remote',
                    'icon': 'fa-exchange',
                    'orphans': []
                },
                {
                    'title': 'New DNS Queries',
                    'url': 'new_dns_queries',
                    'icon': 'fa-info-circle',
                    'orphans': []
                },
                {
                    'title': 'New HTTP Domains',
                    'url': 'new_http_domains',
                    'icon': 'fa-globe',
                    'orphans': []
                },
                {
                    'title': 'New SSL Hosts',
                    'url': 'new_ssl_hosts',
                    'icon': 'fa-lock',
                    'orphans': []
                },
                {
                    'title': 'New SSH Remote IPs',
                    'url': 'new_ssh_remote',
                    'icon': 'fa-lock',
                    'orphans': []
                },
                {
                    'title': 'New FTP Remote IPs',
                    'url': 'new_ftp_remote',
                    'icon': 'fa-lock',
                    'orphans': []
                }
            ]
        },
        { // HEALTH
            'title': 'Health',
            'url': '',
            'icon': 'fa-plus-square',        
            'accessLevel': [4],    
            'children':
            [
                {
                    'title': 'RapidPHIRE Health',
                    'url': 'overview',
                    'icon': 'fa-plus-square',
                    'orphans': ['health_drill']
                }
            ]
        }
    ];
}]);