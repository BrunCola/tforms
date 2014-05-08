'use strict';

var config = require('../../config/config'),
	mysql = require('mysql');

module.exports = function (sql, params, settings, database, callback) {
	config.db.database = database;
	var connection = mysql.createConnection(config.db);

	this.sql = sql;
	this.params = params;
	this.callback = callback;
	var arr = [];
	connection.query(this.sql, function(err, result) {
		if (err) {
			callback(err, null);
			connection.destroy();
		} else {
			//var arr = this.arr;
			for (var d in params) {
				if (params[d].dView === undefined) {
					params[d].dView = true;
				}
				if (params[d].select === 'Archive') {
					params[d].select = null;
				}
				if (!params[d].sClass) {
					params[d].sClass = null;
				}
				// if (params[d].dType === undefined) {
				//	params[d].dType = 'string-case';
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
					'bVisible': params[d].dView,
					'link': params[d].link,
					'sClass': params[d].sClass
				});
			}

			if (!settings.pagebreakBefore) {
				settings.pagebreakBefore = false;
			}

			var table;
			if (result.length === 0) {
				table = null;
			} else {
				table = {
					aaData: result,
					params: arr,
					sort: settings.sort,
					div: settings.div,
					title: settings.title,
					pagebreakBefore: settings.pagebreakBefore
				};
			}
			callback(null, table);
			connection.destroy();
		}
	});
};