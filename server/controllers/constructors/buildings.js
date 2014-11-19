'use strict';

var config = require('../../config/config'),
    async = require('async');

module.exports = function (floors, bldg, conn, callback) {
    var flr = [];
    var bld = [];
    var groupedFloors = [];

	conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            if (err) throw err;
        });
        async.parallel([
            function(callback) {
                connection.query(bldg.query, bldg.insert)
                    .on('result', function(data){
                        bld.push(data);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
            function(callback) {
                connection.query(floors.query, floors.insert)
                    .on('result', function(data){
                        flr.push(data);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
        ], function(err) {
            if (err) throw console.log(err);
            connection.release();
	        for (var b in bld) {
	            var floor = [];
	            floor = flr.filter(function(fl){
                    if (fl.building === bld[b].building){ 
                        return true;
                    }
                });
	            groupedFloors.push(floor);     
	        }
            var results = {
                building: groupedFloors
            }
            callback(null, groupedFloors);
        });
    })
};