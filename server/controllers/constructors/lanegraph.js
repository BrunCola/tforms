'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
    var results = [];
    function laneInfo(d) {
        switch(d.type) {
            case 'Conn':
                return d.time_info+': '+d.lan_ip+' connected to '+d.remote_ip;
            case 'Conn_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'Applications':
                return d.time_info+': Application - '+d.l7_proto;
            case 'Stealth':
                return d.time_info+': Stealth securely connected '+d.src_ip+' with '+d.dst_ip;
            case 'Stealth_drop':
                return d.time_info+': Stealth dropped connection attempts between '+d.src_ip+' and '+d.dst_ip;
            case 'DNS':
                return d.time_info+': DNS query for '+d.query;
            case 'DNS_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'HTTP':
                return d.time_info+': HTTP connection to '+d.host+d.uri;
            case 'HTTP_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'SSL':
                return d.time_info+': SSL connection to '+d.server_name;
            case 'SSL_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'Email':
                return d.time_info+': Email - '+d.subject;
            case 'Email_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'File':
                return d.time_info+': File Seen - '+d.name;
            case 'File_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'Endpoint':
                return d.time_info+': '+d.event_type;
            default:
                return d.time;
        }
    }

    var index = null; var count = 0; var type = null;
    conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            if (err) throw err;
        });
        connection.query(sql.query, sql.insert)
            .on('result', function(data){

                count++;
                type = data.type;

                if (index === null) {
                    index = conn.lanes.indexOf(data.type);
                    if (data.type.search('IOC') !== -1) {
                        index = conn.lanes.indexOf('IOC');
                    }
                    if (data.type.search('Stealth') !== -1) {
                        index = conn.lanes.indexOf('Stealth');
                    }
                }
                data.lane = index;

                var expand = [];
                for (var d in sql.params) {
                    expand.push({
                        name: sql.params[d].title,
                        value: data[sql.params[d].select]
                    })
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