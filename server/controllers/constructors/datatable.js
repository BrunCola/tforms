'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
    var arr = [];
    function check(obj) {

        // if (obj.access !== undefined) {
        //     if (obj.access.indexOf(sql.settings.access) === -1) {
        //         console.log(obj)
        //         return;
        //     }
        // }
        if (obj.hide_stealth !== undefined) {
            if (obj.hide_stealth.indexOf(sql.settings.hide_stealth) !== -1) {
                return;
            }
        }
        if (obj.hide_proxy !== undefined) {
            if (obj.hide_proxy.indexOf(sql.settings.hide_proxy) !== -1) {
                return;
            }
        }
        if (obj.dView === undefined) {
            obj.dView = true;
        }
        if (obj.select === 'Archive') {
            obj.select = null;
        }
        if (!obj.sClass) {
            obj.sClass = null;
        }
        // if (sql.params[d].dType === undefined) {
        //  sql.params[d].dType = 'string-case';
        // }
        //  if ((this.sql.params[d].title === null) && (this.sql.params[d].select==='remote_cc')) {
        //  //do something
        //  //replace type with html
        //  //wrap response
        //  }
        arr.push({
            'sTitle': obj.title,
            'mData': obj.select,
            'sType': obj.dType,
            'bVisible': obj.dView,
            'link': obj.link,
            'sClass': obj.sClass
        });
    }
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
                    check(sql.params[d]);                   
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