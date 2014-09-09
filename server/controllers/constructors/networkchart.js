'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var node = [];
	var link = [];
	var count = 1;
	var zones = [];
	var zonesAndOS = [];
	var initialized = false;

	// node.push({
	// 	name: "Network",
	// 	type: "network",
	// 	width: 0.75
	// 	//gateway???????????
	// })
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert)
			.on('result', function(data){
				var currentZoneIndex, currentZoneOSIndex;
				
				if(!initialized) {
					node.push({
						name: "Network",
						type: "network",
						width: 0.75
						//gateway???????????
					});
					initialized = true;
				}
				if(zones.indexOf(data.lan_zone) === -1) {
					node.push({
						name: data.lan_zone,
						width: 0.50,
						type: "zone"
					});
					zones.push(data.lan_zone);

					link.push({
						target: 0,
						source: count++,
						type: "gateToZone",
						value: 1
					});
					currentZoneIndex = count - 1; //since just pushed to end of array

				} else {
					for(var i = 0; i < node.length; i++) {
						if(node[i].name === data.lan_zone && node[i].type === "zone") {
							currentZoneIndex = i;
							link.push({
								target: 0,
								source: currentZoneIndex,
								type: "gateToZone",
								value: 1
							});
							break;
						}
					}
				}

				if(zonesAndOS.indexOf(data.lan_zone + "" + data.operating_system) === -1) {
					node.push({
						name: data.operating_system,
						id: data.lan_zone + "" + data.operating_system,
						width: 0.55,
						type: "os"
					});
					zonesAndOS.push(data.lan_zone + "" + data.operating_system);

					link.push({
						target: currentZoneIndex,
						source: count++,
						type: "zoneToOs",
						value: 1
					});
					currentZoneOSIndex = count - 1; //since just pushed to end of array

				} else {
					for(var i = 0; i < node.length; i++) {
						if(node[i].id === (data.lan_zone + "" + data.operating_system) && node[i].type === "os") {
							currentZoneOSIndex = i;
							link.push({
								target: currentZoneIndex,
								source: currentZoneOSIndex,
								type: "zoneToOs",
								value: 1
							});
							break;
						}
					}
				}

				node.push({
					name: data.lan_ip,
					width: 0.15,
					type: "endpoint",
					user: data.username,
					iochits: data.ioc_count
				});

				link.push({
					target: currentZoneOSIndex,
					source: count++,
					type: "osToEndpoint",
					value: 0.1
				});

			})
			.on('end', function(){
				connection.release();
				var results = {
					links: link,
					nodes: node
				};
				callback(null, results);
			});
			connection.release();
	})
};