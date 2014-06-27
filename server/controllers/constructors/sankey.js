'use strict';

var config = require('../../config/config'),
	moment = require('moment');

module.exports = function (params, conn, callback) {
	var result = {};
	var src = []; //unique nodes
	var links = []; //{source, target, value}
	var totalCount = 0;
	console.log(params.insert)
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(params.query, params.insert)
			.on('result', function(data){
				//split the stealth groups up into an array
				var stealthGroups = data.stealth_groups.split(", ");
				var remoteStealthGroups = data.stealth_groups_remote.split(", ");
				//create the nodes for the stealth groups
				//TODO expensive to check this for every row...technically only need to do it once, so consider optimizing
				stealthGroups.forEach(function(d){
					if(src.indexOf(d) === -1) {
						src.push(d);
					}
				});

				//populate the root node (lan_ip)
				if(src.indexOf(data.lan_ip) === -1) {
					src.push(data.lan_ip);
					//set up the first level of connections (between local IP and it's stealth groups)
					stealthGroups.forEach(function(d){
						links.push({
							"source":data.lan_ip,
							"target":d,
							"value":0
						});
						//value is 0 because it will be incremented later
					});
				}

				//populate the nodes for remote IPs, and all third-level links (between stealth groups and remote IPs)
				if(src.indexOf(data.remote_ip) === -1) {
					src.push(data.remote_ip);
					totalCount += data.count;
					stealthGroups.forEach(function(d){
						if(remoteStealthGroups.indexOf(d) !== -1){
							links.push({
								"source":d,
								"target":data.remote_ip,
								"value":data.count
							});
							//increment the value of the connections between the local IP and it's stealth groups
							links.forEach(function(l){
								if(l.source == data.lan_ip && l.target == d) {
									l.value += data.count;
								}
							});
						}
					});
				}
			})
			.on('end', function(){
				var src_formatted = [];
				src.forEach(function(d){
					src_formatted.push({"name":d});
				});
				result.nodes = src_formatted;

				result.links = links;

				result.totalCount = totalCount;

				callback(null, result);
			});
			connection.release();
			//group by type and push a main and sub-group for each time slice
	});
};