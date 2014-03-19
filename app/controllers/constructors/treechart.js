'use strict';

var config = require('../../../config/config'),
	mysql = require('mysql');

module.exports = function (sql, database, lanIP, attrID, callback) {
	config.db.database = database;
	var connection = mysql.createConnection(config.db);

	this.sql = sql;

	var tree = [];
	var newarr = [];
	var unique = {};
	var countGrandChildren = 0;
	var iocID = parseInt(attrID);

	// adds an element to the array if it does not already exist using a comparer 
	// function
	connection.query(this.sql)
		.on('result', function(data){
			tree.push(data);
		})
		.on('end', function(){
			var result = {
				"name": lanIP,
				"severity": 0
			}
			tree.forEach(function(item){
				if (!unique[item.ioc_parentID]) {
					newarr.push({
						"parentID": item.ioc_parentID,
						"name": item.ioc,
						"severity": 0
					});
					unique[item.ioc_parentID] = item;
				}
			})
			for (var n in newarr) {
				var nn = [];
				// var finalarr = [];
				for (var t in tree) {
					if (newarr[n]["parentID"] === tree[t].ioc_parentID){
						nn.push({
							"name": tree[t].ioc_childID,
							"severity": 0
						})
					}
				}
				newarr[n]["children"] = nn;
			}
			for (var n in newarr) {
				for (var c in newarr[n]["children"]) {
					var cn = [];
					for (var t in tree) {
						if (newarr[n]["children"][c]["name"] === tree[t].ioc_childID){
							if (tree[t].ioc_attrID === iocID) {
								newarr[n]["children"][c].idRoute = true;
								newarr[n].idRoute = true;
								result.idRoute = true;
								cn.push({
									"name": tree[t].ioc_attrID+' '+tree[t].ioc_typeIndicator+' *',
									"severity": tree[t].ioc_severity,
									"idRoute": true
								})
							} else {
								cn.push({
									"name": tree[t].ioc_attrID+' '+tree[t].ioc_typeIndicator,
									"severity": tree[t].ioc_severity
								})
							}
							var severity = tree[t].ioc_severity;
							if (tree[t].ioc_severity > newarr[n]["children"][c].severity) {
								newarr[n]["children"][c].severity = tree[t].ioc_severity;
							}
							if (tree[t].ioc_severity > newarr[n].severity) {
								newarr[n].severity = tree[t].ioc_severity;
							}
							if (tree[t].ioc_severity > result.severity) {
								result.severity = tree[t].ioc_severity;
							}

							countGrandChildren++;
						}
					}
					newarr[n]["children"][c]["children"] = cn;
				}
			}
			result["children"] = newarr;
			result["childCount"] = countGrandChildren;
			callback(null, result);
			// console.log(newarr);
			connection.destroy();
		})
		//group by type and push a main and sub-group for each time slice
};