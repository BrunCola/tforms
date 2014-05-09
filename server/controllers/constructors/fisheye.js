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
	var max = 0;
	connection.query(this.query)
		.on('result', function(data){
			data.class = params.sClass;
			data.id = count++;
			dat.push(data);
		})
		.on('end', function(){
			// convert time to unix and add a rounded value
			dat.forEach(function (item){
				var time = moment(item.time).unix();
				item.time = time;
				item.rTime = Math.round(time/3000)*3000;
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
				var d = [];
				for (var o in newarr) {
					if ((newarr[o].rTime === item.time) && (newarr[o].class === item.class)) {
						d.push(newarr[o]);
					}
				}
				item.data = d;
				item.columns = params.columns;
				if (d.length >= max) {
					max = d.length;
				}
				// PUSH FINISHED PRODUCT BACK TO ORIGINAL ARRAY (dat)
			});
			callback(null, b, max);
			connection.destroy();
		});
		//group by type and push a main and sub-group for each time slice
};