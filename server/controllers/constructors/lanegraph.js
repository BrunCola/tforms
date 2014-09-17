'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var results = [];
	function laneInfo(d) {
		switch(d.type) {
			case 'conn':
				return d.time_info+': '+d.lan_ip+' connected to '+d.remote_ip;
			case 'conn_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'applications':
                return d.time_info+': Application - '+d.l7_proto;
            case 'stealth':
                return d.time_info+': Stealth securely connected '+d.src_ip+' with '+d.dst_ip;
            case 'stealth_drop':
                return d.time_info+': Stealth dropped connection attempts between '+d.src_ip+' and '+d.dst_ip;
            case 'dns':
				return d.time_info+': DNS query for '+d.query;
			case 'dns_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'http':
				return d.time_info+': HTTP connection to '+d.host+d.uri;
			case 'http_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'ssl':
				return d.time_info+': SSL connection to '+d.server_name;
			case 'ssl_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'file':
				return d.time_info+': File Seen - '+d.name;
			case 'file_ioc':
                return d.time_info+': IOC - '+d.ioc;
            case 'endpoint':
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
					if (data.type.search('ioc') !== -1) {
						index = conn.lanes.indexOf('ioc');
					}
					if (data.type.search('stealth') !== -1) {
						index = conn.lanes.indexOf('stealth');
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