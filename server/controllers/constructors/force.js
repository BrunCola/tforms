'use strict';

var config = require('../../config/config'),
	mysql = require('mysql');

module.exports = function (sql, database, lanIP, callback) {
	config.db.database = database;
	var connection = mysql.createConnection(config.db);

	this.sql = sql;

	var node = [];
	var link = [];
	var count = 1;

	node.push({
		name: lanIP,
		group: 1
	});
	connection.query(this.sql)
		.on('result', function(data){
			if (data.remote_ip.match(/(^192\.168|^10|^172\.16)\.(\d+)/g) === true) {
				node.push({
					name: data.remote_ip,
					group: 3,
					width: data.count
				});
			} else {
				node.push({
					name: data.remote_ip,
					group: 2,
					width: data.count
				});
			}
			link.push({
				target: 0,
				source: count++,
				value: data.count
			});
		})
		.on('end', function(){
			var results = {
				links: link,
				nodes: node
			};
			callback(null, results);
			connection.destroy();
		});
		//group by type and push a main and sub-group for each time slice
};