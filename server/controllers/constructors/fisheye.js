'use strict';

var config = require('../../config/config'),
	mysql = require('mysql'),
	moment = require('moment');

module.exports = function (params, callback) {
	config.db.database = params.database;
	var connection = mysql.createConnection(config.db);
	this.query = params.query;
	var dat = [];
	var count = 0;
	var maxConn = 0;
	var maxIOC = 0;
	var tArr = [];
	connection.query(this.query)
		.on('result', function(data){
			data.class = params.sClass;
			data.id = count++;
			dat.push(data);
		})
		.on('end', function(){
			// convert time to unix and add a rounded value
			dat.forEach(function (item){
				var time = Math.round(item.time);
				item.time = time;
				item.rTime = (time/60)*60;
			});
			var a = [], b = [], newarr = dat;
			// SORT ITEMS BY TIME THEN CLASS
			for (var d in dat) {
				// if the time value does not exist in a (a is just to keep track of what is true/false)
				if (a.indexOf(dat[d].rTime) === -1) {
					a.push(dat[d].rTime);
					// b becomes the higher level of the result
					b.push({
						time: dat[d].rTime,
						class: dat[d].class //set to unique identifier based on group returned
					});
				}
			}
			// FOR EVERY UNIQUE MATCH IN A PUSH
			b.forEach(function (item){
				var f = 0;
				var d = [];
				for (var o in newarr) {
					if ((newarr[o].rTime === item.time) && (newarr[o].class === item.class)) {
						d.push(newarr[o]);
						if (newarr[o].ioc_count !== undefined) {
							f += newarr[o].ioc_count;
						}
					}
				}
				item.ioc_hits = f;
				// convert table times to human readable
				d.forEach(function(e){
					var time = moment.unix(e.time).format('MMMM Do YYYY, h:mm:ss a');
					e.time = time;
				});
				item.data = d;
				item.columns = params.columns;
				if (d.length >= maxConn) {
					maxConn = d.length;
				}
				if (f >= maxIOC) {
					maxIOC = f;
				}
				// PUSH FINISHED PRODUCT BACK TO ORIGINAL ARRAY (dat)
			});

			// spread items on top of each other
			// for (var n in b) {
			// 	var time = Math.round(b[n].time/1000)*1000;
			// 	if (tArr.indexOf(JSON.stringify({time: time, count: b[n].data.length})) === -1) {
			// 		b[n].time = time;
			// 		tArr.push(JSON.stringify({time: time, count: b[n].data.length}));
			// 	} else {
			// 		do {
			// 			time += 3000;
			// 			b[n].time = time;
			// 			tArr.push(JSON.stringify({time: time, count: b[n].data.length}));
			// 		}
			// 		while (tArr.indexOf(JSON.stringify({time: time, count: b[n].data.length})) !== -1);
			// 	}
			// }

			console.log(tArr)
			callback(null, b, maxConn, maxIOC);
			connection.destroy();
		});
		//group by type and push a main and sub-group for each time slice
};