'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var results = [];
	function laneInfo(d) {
		switch(d.type) {
			case 'conn':
				return d.time_info+': '+d.lan_ip+' connected to '+d.remote_ip;
			case 'dns':
				return d.time_info+': DNS query for '+d.query;
			case 'http':
                return d.time_info+': HTTP connection to '+d.host+d.uri;
            case 'ssl':
                return d.time_info+': SSL connection to '+d.server_name;
            case 'file':
                return d.time_info+': File Seen - '+d.name;
            case 'endpoint':
                return d.time_info+': '+d.event_type;
            case 'stealth':
                return d.time_info+': Stealth securely connected '+d.src_ip+' with '+d.dst_ip;
            case 'stealth_drop':
                return d.time_info+': Stealth dropped connection attempts between '+d.src_ip+' and '+d.dst_ip;    
            default:
				return d.time;
		}
	}

	var index = null;
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert)
			.on('result', function(data){

				if (index !== null) {
					data.lane = index;
				} else {
					index = conn.lanes.indexOf(data.type);
					if (data.type.search('ioc') !== -1) {
						index = 0;
					}
				}

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
				callback(null, results);
			});
			connection.release();
	});
};