'use strict';

var config = require('../../../config/config'),
	mysql = require('mysql');

var connection = mysql.createConnection(config.db);

module.exports = function (sql, params, callback) {
	this.sql = sql;
	this.params = params;
	this.callback = callback;
	var arr = [];
	connection.query(this.sql, function(err, result) {
		if (err) {
			callback(err, null);
		} else {
			//var arr = this.arr;
			for (var d in params) {
				if (params[d].dView === undefined) {
					params[d].dView = true;
				}
				// if (params[d].dType === undefined) {
				// 	params[d].dType = 'string-case';
				// }
				//	if ((this.params[d].title === null) && (this.params[d].select==='remote_cc')) {
				//	//do something
				//	//replace type with html
				//	//wrap response
				//	}
				arr.push({
					'sTitle': params[d].title,
					'mData': params[d].select,
					'sType': params[d].dType,
					'bVisible': params[d].dView
				});
			}
			var table = {
				aaData: result,
				params: arr
			};
			callback(null, table);
		}
	});
};