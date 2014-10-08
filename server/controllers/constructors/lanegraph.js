'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
    var results = [];
    function laneInfo(d) {
        switch(d.type) {
            case 'Conn':
                return d.lan_ip+' connected to '+d.remote_ip;
            case 'Conn_ioc':
                return 'IOC - '+d.ioc;
            case 'IOC Severity':
                return'IOC - '+d.ioc;
            case 'Stealth':
                return 'Stealth securely connected '+d.lan_ip+' with '+d.remote_ip;
            case 'Stealth_drop':
                return 'Stealth dropped connection attempts between '+d.lan_ip+' and '+d.remote_ip;
            case 'Applications':
                return 'Application - '+d.l7_proto;
            case 'DNS':
                return 'DNS query for '+d.query;
            case 'DNS_ioc':
                return 'IOC - '+d.ioc;
            case 'HTTP':
                return 'HTTP connection to '+d.host+d.uri;
            case 'HTTP_ioc':
                return 'IOC - '+d.ioc;
            case 'SSL':
                return 'SSL connection to '+d.server_name;
            case 'SSL_ioc':
                return 'IOC - '+d.ioc;
            case 'Email':
                return 'Email - '+d.subject;
            case 'Email_ioc':
                return 'IOC - '+d.ioc;
            case 'File':
                return 'File Seen - '+d.name;
            case 'File_ioc':
                return 'IOC - '+d.ioc;
            case 'Endpoint':
                return ''+d.event_type;
            default:
                return d.time;
        }
    }
    var index = null; var count = 0; var type = null;

    var denied = [];
    (function() {
        if (sql.settings === undefined) {return}
        if (sql.settings.access === undefined) {return}
        sql.params.forEach(function(item){
            if (item.access === undefined) {return}
            if (item.access.indexOf(sql.settings.access) === -1) {
                denied.push(item.select);
            }
        })
    })();

    conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            // console.log(err);
            if (err) { console.log(err); throw err; }
        });
        connection.query(sql.query, sql.insert)
            .on('result', function(data){
                for (var i in data){
                    if (denied.indexOf(i) !== -1){
                        delete data[i];
                    }
                }
                count++;
                type = data.type;
                if (index === null) {
                    index = conn.lanes.indexOf(data.type);
                    if (data.type.search('ioc') !== -1) {
                        index = conn.lanes.indexOf('IOC');
                    }
                    if (data.type.search('Stealth') !== -1) {
                        index = conn.lanes.indexOf('Stealth');
                    }
                }
                data.lane = index;
                var expand = [];
                for (var d in sql.params) {
                    // check if value is undefined... it may be because of our veriable denial process above 
                    if (data[sql.params[d].select] !== undefined) {
                        expand.push({
                            name: sql.params[d].title,
                            value: data[sql.params[d].select]
                        })
                    }
                }
                data.info = laneInfo(data);
                data.expand = expand;
                results.push(data);
            })
            .on('end', function(){
                console.log(type+': '+count)
                callback(null, results);
            });
        connection.release();
    });
};