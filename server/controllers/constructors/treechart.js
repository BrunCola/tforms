'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, lanIP, attrID, callback) {
	var tree = [];
	var newarr = [];
	var unique = {};
	var countGrandChildren = 0;
	var iocID = parseInt(attrID);

	// adds an element to the array if it does not already exist using a comparer 
	// function
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert)
			.on('result', function(data){
				tree.push(data);
			})
			.on('end', function(){
				var result = {
					'name': lanIP,
					'severity': 0
				};
				tree.forEach(function(item){
					if (!unique[item.ioc_parentID]) {
						newarr.push({
							'parentID': item.ioc_parentID,
							'name': item.ioc,
							'severity': 0
						});
						unique[item.ioc_parentID] = item;
					}
				});
				for (var n in newarr) {
					var nn = [];
					// var finalarr = [];
					for (var t in tree) {
						if (newarr[n].parentID === tree[t].ioc_parentID){
							nn.push({
								'name': tree[t].ioc_childID,
								'severity': 0
							});
						}
					}
					newarr[n].children = nn;
				}
				for (var v in newarr) {
					for (var c in newarr[v].children) {
						var cn = [];
						for (var y in tree) {
							if (newarr[v].children[c].name === tree[y].ioc_childID){
								if (tree[y].ioc_attrID === iocID) {
									newarr[v].children[c].idRoute = true;
									newarr[v].idRoute = true;
									result.idRoute = true;
									cn.push({
										'name': tree[y].ioc_attrID+' '+tree[y].ioc_typeIndicator+' *',
										'severity': tree[y].ioc_severity,
										'idRoute': true
									});
								} else {
									cn.push({
										'name': tree[y].ioc_attrID+' '+tree[y].ioc_typeIndicator,
										'severity': tree[y].ioc_severity
									});
								}
								// var severity = tree[y].ioc_severity;
								if (tree[y].ioc_severity > newarr[v].children[c].severity) {
									newarr[v].children[c].severity = tree[y].ioc_severity;
								}
								if (tree[y].ioc_severity > newarr[v].severity) {
									newarr[v].severity = tree[y].ioc_severity;
								}
								if (tree[y].ioc_severity > result.severity) {
									result.severity = tree[y].ioc_severity;
								}

								countGrandChildren++;
							}
						}
						newarr[v].children[c].children = cn;
					}
				}
				result.children = newarr;
				result.childCount = countGrandChildren;
				callback(null, result);
				// console.log(newarr);
			});
		connection.release();
			//group by type and push a main and sub-group for each time slice
	});
};