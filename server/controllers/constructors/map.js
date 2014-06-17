'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var result = [];
	var lastResult = {};
	var index = -1;
	var mapData = {
		'type': 'FeatureCollection',
		'features': []
	};
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert)
			.on('result', function(data){
				if ((data.time === lastResult.time) && (data.remote_long === lastResult.remote_long) && (data.remote_lat === lastResult.remote_lat)) {
					result[index].count++;
					if (data.ioc_severity > result[index].ioc_severity) {
						result[index].ioc_severity = data.ioc_severity;
					}
				} else {
					data.count = 1;
					result.push(data);
					index++;
				}
				lastResult = data;
			})
			.on('end', function(){
				result.forEach(function(d){
					if (d.remote_country !== '-' && ((d.remote_lat !== 0) && (d.remote_long !== 0))) {
						mapData.features.push({
							'type':'Feature',
							'properties':{
								'date_filed': d.time,
								'severity': d.ioc_severity,
								'ioc': d.ioc,
								'l7_proto': d.l7_proto,
								'units': d.ioc_count,
								'count': d.count,
								'country': d.remote_country,
								'remote_ip': d.remote_ip,
								'lan_ip': d.lan_ip
							},
							'geometry':{
								'type':'Point',
								'coordinates':[
									d.remote_long,
									d.remote_lat
								]
							}
						});
					}
				});
				// console.log(result);
				callback(null, mapData);
				connection.destroy();
			});
	})
};