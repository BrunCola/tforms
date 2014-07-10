'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var node = [];
	var link = [];
	var count = 0;
	var ip_nodes = [];
	var group_nodes = [];

	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query)
			.on('result', function(data){
				//populate the IP nodes
				if(node.indexOf(data.lan_ip) === -1) {//this check is only kinda necessary...
					var stealthGroups = data.stealth_COIs.split(", ");
					//group of the IP determines the colour of the node, and is dependent on how may stealth groups it belongs to
					//console.log(data.lan_ip + ' group ' +stealthGroups.length);
					node.push({
						name: data.lan_ip,
						group: stealthGroups.length,
						width: 0.25,
						gateway: data.gateway
					});
					var current_ip_index = count;
					count ++;
					//split the stealth groups up into an array
					//add the stealth groups as level 1 nodes if they are not added already
					stealthGroups.forEach(function(d){
						var alreadyInserted = false;
						node.forEach(function(n){
							if(n.name == d){
								alreadyInserted = true;
							}
						});

						if(!alreadyInserted){
							//add stealth group nodes as group 0 to differentiate from any possible IP nodes
							node.push({
								name: d,
								group: 0,
								width: 0.75,
								gateway: 0
							});
							group_nodes.push({
								index: count,
								groupName: d
							});
							count ++;
						}

						//get the force chart index of the stealth group
						var current_group_index;
						group_nodes.forEach(function(g){
							if(g.groupName == d) {
								current_group_index = g.index;
								//break;
							}
						});

						//create the links from the IP to the groups
						link.push({
							target: current_group_index,
							source: current_ip_index,
							value: 1
						});

					});
				}
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
			//group by type and push a main and sub-group for each time slice
	})
};