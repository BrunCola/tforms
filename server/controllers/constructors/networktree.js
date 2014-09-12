'use strict';

var config = require('../../config/config'),
	crossfilter = require('crossfilter');

module.exports = function (sql, conn, callback) {

	var result = {
		'name': 'Origin',
		'value': 'Network',
		'children': []
	}

	// var originalParents = {
	// 	'lan_zone': [], 
	// 	'operating_system': [], 
	// 	'lan_ip': []
	// }; // our levels to check

	// // F*** EVERYTHING ABOVE.. I'M DOING IT THE LONG WAY
	// var lan_zoneArr = [], osArr = [], lanArr = [];
	// var levels = ['lan_zone', 'operating_system', 'lan_ip'];
	// function finish(data){
	// 	var parent = result.children;
	// 	for (var l in levels) {
	// 		var value = data[levels[l]].toString();
	// 		var checkArr = originalParents[levels[l]];
	// 		var checkIndex = checkArr.indexOf(value);
	// 		// if the value is not in the check arrray
	// 		if (checkIndex === -1) {
	// 			checkArr.push(value);
	// 			parent.push({
	// 				name: value,
	// 				children: []
	// 			})
	// 			parent = parent[parent.length-1].children;
	// 		} else {
	// 			console.log(checkIndex)
	// 			console.log(parent[checkIndex])
	// 			parent = parent[checkIndex].children;
	// 		}
	// 	}
	// 	return data;§
	// }

	// function res(data) {
	// 	console.log(data)
	// 	var temp1 = [];
		
	// 	// for (var i in data) {
	// 	// 	if (data.lan_ip + ) {

	// 	// 	}
	// 	// }
	// }

	function format(data) {
		var crossfilterData = crossfilter(data);

		var mainDim = crossfilterData.dimension(function(d){return d});

		// get list of unique lan_zones.. this can only be used at top level since children will be affected by available parents
		var lanZoneDim = crossfilterData.dimension(function(d){return d.lan_zone});
		var lanZoneUnique = lanZoneDim.group().reduceCount().top(Infinity);

		var lan_zones = [];
		for (var i in lanZoneUnique) {
			var pushToFirst = [];
			var secondChildren = mainDim.top(Infinity).filter(function(d){return (d.lan_zone === lanZoneUnique[i].key)});
			var secondChildIndex = [];
			for (var s in secondChildren) {
				// if the OS is unique (in our index array), continue
				if (secondChildIndex.indexOf(secondChildren[s].operating_system) === -1) {
					// whild matching second, lets start filtering and pushing the third children
					var pushToThird = [];
					var thirdChildren = mainDim.top(Infinity).filter(function(d){return ((d.lan_zone === lanZoneUnique[i].key) && (d.operating_system === secondChildren[s].operating_system))});
					for (var t in thirdChildren){
						// pushToThird.push({
						// 	name: "IP",
						// 	value: thirdChildren[t].lan_ip
						// });
						pushToThird.push(thirdChildren[t]);
					}
					// push to children of parent lan_ip
					pushToFirst.push({
						name: "OS",
						value: secondChildren[s].operating_system,
						children: pushToThird
					})
					// push the name to our index array
					secondChildIndex.push(secondChildren[s].operating_system);
				}
			}
			result.children.push({
				name: "Zone",
				value: lanZoneUnique[i].key,
				children: pushToFirst // perhaps i should map out the children here before pushing
			})
		}
		return result;
	}

	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert, function(err, data) {
			connection.release();
			if (err) {
				callback(err, null);
			} else {
				callback(null, format(data));
			}
		});
	})
};