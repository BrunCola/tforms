'use strict';

var config = require('../../config/config'),
	moment = require('moment'),
	async = require('async');

module.exports = function (sql1, sql2, sql3, conn, callback) {
	var result = {};
	var src = []; //unique nodes
	var links = []; //{source, target, value}
	var central_populated = false;
	var totalCount = 0;
//	console.log(params.insert)
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		async.series([
			function(callback){
				connection.query(sql1.query, sql1.insert, function(err, result) {
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){ 
							//populate central node (node 0)
							if(!central_populated){
								src.push({
									"name":data.dst_ip,
									"value": data.in_bytes + 10, //??
									"coverageCount":data.in_bytes + 10, //??
									"utilizationCount":data.in_bytes + 10, //??
									"scale":0.2//??
								});	
								central_populated = true;
							}
							else {
								src[0].value += data.in_bytes;
								src[0].utilizationCount += data.in_bytes;
								src[0].coverageCount += data.in_bytes; //????????????*(******)
							}
							//populate stealth nodes that try to connect to the central node
							if(data.out_bytes < 0.5) {
								src.push({
									"name":data.src_ip,
									"value":0.2, //??
									"coverageCount":10, //??
									"utilizationCount":1, //??
									"scale":0.3//??
								});
							} else {
								src.push({
									"name":data.src_ip,
									"value":data.out_bytes, //??
									"coverageCount":data.out_bytes, //??
									"utilizationCount":2, //??
									"scale":0.3//??
								});
							}
							//create link between stealth IP and central node
							links.push({
								"source":src.length -1,
								"target":0,
								"value":data.out_bytes + 0.01,
								"targetCount":data.in_bytes + 0.01//????
							});
				
						})		
					}
				
					callback();
				});
				
			},
			function(callback){
				connection.query(sql2.query, sql2.insert, function(err, result) {
					
					if (err) {
						callback(err, null);
					} else {
						//this query returns the local cleartext connections to and from the central IP
						result.forEach(function(data){ 
							//if the remote IP = the central add the local
							if(data.remote_ip === src[0].name) {
								if(data.out_bytes < 0.5) {
									src.push({
										"name":data.lan_ip + " (cleartext)",
										"value":0.2, //??
										"coverageCount":10, //??
										"utilizationCount":1, //??
										"scale":0.3//??
									});
								} else {
									src.push({
										"name":data.lan_ip + " (cleartext)",
										"value":data.out_bytes, //??
										"coverageCount":10, //??
										"utilizationCount":2, //??
										"scale":0.3//??
									});
								}
								//create link between central IP and local IP, with the data going IN to the local IP being the value from the central
								links.push({
									"source":0,
									"target":src.length -1,
									"value":data.in_bytes + 0.01,
									"targetCount":data.out_bytes + 0.01//????
								});
							}
							//if the lan_ip = the central add the "remote" node
							else if(data.lan_ip === src[0].name) {
								if(data.in_bytes < 0.5) {
									src.push({
										"name":data.remote_ip + " (cleartext)",
										"value":0.2, //??
										"coverageCount":10, //??
										"utilizationCount":1, //??
										"scale":0.3//??
									});
								} else {
									src.push({
										"name":data.remote_ip + " (cleartext)",
										"value":data.in_bytes, //??
										"coverageCount":10, //??
										"utilizationCount":2, //??
										"scale":0.3//??
									});
								}
								//create link between central IP and local IP, with the data going OUT FROM the local IP being the value from the central
								links.push({
									"source":0,
									"target":src.length -1,
									"value":data.out_bytes + 0.01,
									"targetCount":data.in_bytes + 0.01//????
								});
							}
						});

						callback();
					}
				});				
			},
			function(callback){
				connection.query(sql3.query, sql3.insert, function(err, result) {
					
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){ 
							if(data.in_bytes < 0.5) {
								src.push({
									"name":data.remote_ip + " (cleartext-remote)",
									"value":0.2, //??
									"coverageCount":10, //??
									"utilizationCount":1, //??
									"scale":0.3//??
								});
							} else {
								src.push({
									"name":data.remote_ip + " (cleartext-remote)",
									"value":data.in_bytes, //??
									"coverageCount":10, //??
									"utilizationCount":2, //??
									"scale":0.3//??
								});
							}
							//create link between central IP and local IP, with the data going OUT FROM the local IP being the value from the central
							links.push({
								"source":0,
								"target":src.length -1,
								"value":data.out_bytes + 0.01,
								"targetCount":data.in_bytes + 0.01//????
							});
						});
						callback();
					}
				});
				connection.release(); //SHOULD GO ON LAST FUNCTION!! (if more are added move to the last)
				
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
				result.nodes = src;

				result.links = links;

				//result.totalCount = totalCount;

				callback(null, result);
		});
	});
};