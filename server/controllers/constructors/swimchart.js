'use strict';

var config = require('../../config/config'),
	mysql = require('mysql');

module.exports = function (sql, options, callback) {
	config.db.database = options.database;
	var connection = mysql.createConnection(config.db);
	// function sortByKey(array, key, key2) {
	// 	return array.sort(function(a, b) {
	// 		// var x = a[key]; var y = b[key];
	// 		// return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	// 		if (a[key2] === b[key2])
	// 		return a[key] < b[key] ? -1 : 1;
	// 		return a[key2] < b[key2] ? 1 : -1;
	// 	});
	// }
	function parseDate(dateString) {
		//convert the returnes unix time to a javascript date Object
		var date = new Date(Math.ceil(dateString/1000)*1000000);
		return date;
	}
	this.sql = sql;
	// connection.query(this.sql, function(err, result) {
	// 	if (err) {
	// 		callback(err, null);
	// 		connection.destroy();
	// 	} else {
	// 		callback(null, result);
	// 		connection.destroy();
	// 	}
	// });
	var dat = [];
	var count = 0;
	// var today = new Date(),
	// 	tracks = [],
		// yearMillis = 31622400000,
		//x-axis offset (change this to be dynamic)
		// instantOffset = yearMillis;
	connection.query(this.sql)
		.on('result', function(data){
			data.class = options.sClass;
			data.id = count++;
			data.start = data.time;
			data.end = '';
			dat.push(data);
		})
		.on('end', function(){
			// ROUND ALL TIMES TOGETHER
			console.log(options.end);
			console.log(options.start);

			var dateRange = (options.end - options.start)/3.08;
			dat.forEach(function (item){
				item.time = Math.ceil(item.start/dateRange)*dateRange;
				item.start = parseDate(item.start);
			});
			var a = [], b = [], newarr = dat;
			// SORT ITEMS BY TIME THEN CLASS
			// var objSorted = sortByKey(dat, 'start');
			for (var d in dat) {
				dat[d].time = Math.round(dat[d].time);
				if (a.indexOf(dat[d].time) === -1) {
					a.push(dat[d].time);
					b.push({
						time: dat[d].time,
						preStart: dat[d].start,
						end: dat[d].end,
						label: 'label',
						class: dat[d].class //set to unique identifier based on group returned
						//label should be a timestamp maybe
						//and figure out whats happening with time ra3nges + classes
					});
				}
			}
			// for (var n in objSorted) {
			// 	objSorted[n].time = Math.round(objSorted[n].time);
			// 	// console.log(objSorted[n].time);
			// 	if ((objSorted[n].time !== pTime)) {
			// 		a.push({
			// 			time: objSorted[n].time,
			// 			preStart: objSorted[n].start,
			// 			end: objSorted[n].end,
			// 			label: 'label',
			// 			class: objSorted[n].class //set to unique identifier based on group returned
			// 			//label should be a timestamp maybe
			// 			//and figure out whats happening with time ra3nges + classes
			// 		});
			// 	}
			// 	//set previous time value (because its all in order, above wont append anything new if the next matches this)
			// 	pTime = objSorted[n].time;
			// }
			// CLEAR ORIGINAL ARRAY (FOR BELOW)
			// dat = [];
			// FOR EVERY UNIQUE MATCH IN A PUSH
			b.forEach(function (item){
				var d = [];
				for (var o in newarr) {
					if ((newarr[o].time === item.time) && (newarr[o].class === item.class)) {
						d.push(newarr[o]);
					}
				}
				item.data = d;
				// PUSH FINISHED PRODUCT BACK TO ORIGINAL ARRAY (dat)
				// dat.push(item);
			});
			// dat.forEach(function (item){
			// 	if (item.end === '') {
			// 		item.end = new Date(item.start.getTime() + instantOffset);
			// 		item.instant = true;
			// 	} else {
			// 		item.end = parseDate(item.end);
			// 		item.instant = false;
			// 	}
			// 	if (item.end > today) { item.end = today;}
			// });
			callback(null, b);
			connection.destroy();
		});
		//group by type and push a main and sub-group for each time slice
};