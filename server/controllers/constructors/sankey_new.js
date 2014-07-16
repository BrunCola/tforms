'use strict';

var config = require('../../config/config'),
	moment = require('moment');

module.exports = function (params, conn, callback) {
	var result = {};
	var src = []; //unique nodes
	var links = []; //{source, target, value}
	var central_populated = false;
	var totalCount = 0;
	console.log(params.insert)
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(params.query, params.insert)
			.on('result', function(data){
				
				//populate central node (node 0)
				if(!central_populated){
					src.push({
						"name":data.dst_ip,
						"value":data.out_bytes, //??
						"coverageCount":10, //??
						"utilizationCount":15, //??
						"scale":3.0//??
					});	
					central_populated = true;
				}

				//populate stealth nodes that try to connect to the central node
				src.push({
					"name":data.src_ip,
					"value":data.out_bytes, //??
					"coverageCount":10, //??
					"utilizationCount":15, //??
					"scale":1.0//??
				});
				//create link between stealth IP and central node
				links.push({
					"source":src.length -1,
					"target":0,
					"value":20,
					"targetCount":10//????
				});



			})
			.on('end', function(){
				result.nodes = src;

				result.links = links;

				//result.totalCount = totalCount;

				callback(null, result);
			});
			connection.release();
			//group by type and push a main and sub-group for each time slice
	});
};