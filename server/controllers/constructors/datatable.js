'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
	var arr = [];
	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		connection.query(sql.query, sql.insert, function(err, result) {
			connection.release();
			if (err) {
				console.log(err)
				callback(err, null);
			} else {
				//var arr = this.arr;
				for (var d in sql.params) {
					if (sql.params[d].dView === undefined) {
						sql.params[d].dView = true;
					}
					if (sql.params[d].access !== undefined) {
						if (sql.params[d].access.indexOf(sql.settings.access) !== -1) {
							sql.params[d].dView = true;
						} else {
							sql.params[d].dView = false;
						}
					}
					if (sql.params[d].select === 'Archive') {
						sql.params[d].select = null;
					}
					if (!sql.params[d].sClass) {
						sql.params[d].sClass = null;
					}
					// if (sql.params[d].dType === undefined) {
					//	sql.params[d].dType = 'string-case';
					// }
					//	if ((this.sql.params[d].title === null) && (this.sql.params[d].select==='remote_cc')) {
					//	//do something
					//	//replace type with html
					//	//wrap response
					//	}
					arr.push({
						'sTitle': sql.params[d].title,
						'mData': sql.params[d].select,
						'sType': sql.params[d].dType,
						'bVisible': sql.params[d].dView,
						'link': sql.params[d].link,
						'sClass': sql.params[d].sClass
					});
				}

				if (!sql.settings.pagebreakBefore) {
					sql.settings.pagebreakBefore = false;
				}

				var table;
				if (result.length === 0) {
					table = null;
				} else {
					table = {
						aaData: result,
						params: arr,
						sort: sql.settings.sort,
						div: sql.settings.div,
						title: sql.settings.title,
						pagebreakBefore: sql.settings.pagebreakBefore
					};
				}
				callback(null, table);
			}
		});
	});
};