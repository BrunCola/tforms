'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var results = [];
	function laneInfo(d) {
		switch(d.type) {
			case 'http':
				return 'test '+d.time+'';
			case '':
				return '';
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