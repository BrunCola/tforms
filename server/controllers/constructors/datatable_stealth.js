'use strict';


var config = require('../../config/config'),
	async = require('async');

module.exports = function (sql1, sql2, userLevel, conn, callback) {
	var page_data = []; //data other than stealth enpoint data
	var table; //final table data
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
						page_data = result;
						callback();
					}
				});
			},
			function(callback){
				connection.query(sql2.query, sql2.insert, function(err, result) {
					connection.release();
					if (err) {
						callback(err, null);
					} else {
						var endpoint_tracking_data = result;

						var to_display = [];
						var param_array = [];

						page_data.forEach(function(d){
							var mostRecentLogon;
							endpoint_tracking_data.forEach(function(e){
								//if the IPs match and the logon event's time is less than or equal to the time of the connection event
								if (d.lan_ip === e.lan_ip && e.time <= d.time ) {
									//grab the logon event if there is not one already
									if(typeof mostRecentLogon === 'undefined') {
										mostRecentLogon = e;
									} else if (e.time > mostRecentLogon.time) {
										//grab the logon event if it happened more recently than the previous one seen
										mostRecentLogon = e;
									}
								}
							})
							//create object to push to view
							if(typeof mostRecentLogon === 'undefined') {
								d.stealth = null;
								d.stealth_COIs = null;
								d.user = null;
								to_display.push(d);
								to_display.push(d);
							} else {
								d.stealth = mostRecentLogon.stealth;
								d.stealth_COIs = mostRecentLogon.stealth_COIs;
								d.user = mostRecentLogon.user;
								to_display.push(d);
							}
						})
						//build the table itself
						for (var d in sql1.params) {
							if (sql1.params[d].dView === undefined) {
								sql1.params[d].dView = true;
							}
							if (sql1.params[d].select === 'Archive') {
								sql1.params[d].select = null;
							}
							if (!sql1.params[d].sClass) {
								sql1.params[d].sClass = null;
							}

							param_array.push({
								'sTitle': sql1.params[d].title,
								'mData': sql1.params[d].select,
								'sType': sql1.params[d].dType,
								'bVisible': sql1.params[d].dView,
								'link': sql1.params[d].link,
								'sClass': sql1.params[d].sClass
							});
							//put the stealth columns in after Last Seen/Time
							if((sql1.params[d].title === 'Last Seen' || sql1.params[d].title === 'Time') && userLevel === 3) {
								for (var e in sql2.params) {
									if (sql2.params[e].dView === undefined) {
										sql2.params[e].dView = true;
									}
									if (sql2.params[e].select === 'Archive') {
										sql2.params[e].select = null;
									}
									if (!sql2.params[e].sClass) {
										sql2.params[e].sClass = null;
									}

									param_array.push({
										'sTitle': sql2.params[e].title,
										'mData': sql2.params[e].select,
										'sType': sql2.params[e].dType,
										'bVisible': sql2.params[e].dView,
										'link': sql2.params[e].link,
										'sClass': sql2.params[e].sClass
									});
								}
							}
						}
						

						
						if (result.length === 0) {
							table = null;
						} else {
							table = {
								"aaData": to_display, 
								"params": param_array,
								"sort": sql1.settings.sort,
								"div": sql1.settings.div,
								"title": sql1.settings.title,
								"pagebreakBefore": sql1.settings.pagebreakBefore
							};
						}

						callback();
					}
				});
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) throw console.log(err);
						
			callback(null, table);
		});
	});
};