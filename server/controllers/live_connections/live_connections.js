'use strict';

var map = require('../constructors/map'),
    query = require('../constructors/query'),
    config = require('../../config/config'),
    async = require('async'),
    moment = require('moment');

module.exports = function(pool) {
    return {
        render: function(req, res) {
            var database = req.user.database;
            //var database = "rp_users";
            var start = moment().subtract('minutes', 9).unix();
            var end = moment().subtract('minutes', 8).unix();
            var queryResult, zoneResult;
            var mapSQL = {
                query: 'SELECT '+
                            '`time`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '`ioc_severity`,'+
                            '`ioc_rule`,'+
                            '`lan_zone`,'+
                            '`ioc`,'+
                            '`remote_long`,'+
                            '`l7_proto`,'+
                            '`remote_lat`,'+
                            '`ioc_count`,'+
                            '`remote_ip`,'+
                            '`lan_ip` '+
                        'FROM '+
                            '`conn` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ?',
                insert: [start, end]
            }
            var mapZone = {
                query: 'SELECT '+
                            '`zone`,'+
                            '`zone_country`,'+
                            '`zone_region`,'+
                            '`zone_city`,'+
                            '`zone_long`,'+
                            '`zone_lat`'+
                        'FROM '+
                            '`zone` '+
                        'GROUP BY '+
                            '`zone`',
                insert: [start, end]
            }
            async.parallel([
            function(callback) {
                new map(mapSQL, {database: database, pool: pool}, function(err,data){
                    // console.log(data);
                    queryResult = data;
                    callback();
                });
            },
            function(callback) {
                new query(mapZone, {database: "rp_users", pool: pool}, function(err,data){
                    // console.log(data);
                    zoneResult = data;
                    callback();
                });
            },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
            if (err) throw console.log(err);
                
                for (var i in queryResult.features) {
                    for (var y in zoneResult) {
                        if (queryResult.features[i].properties.lan_zone === zoneResult[y].zone) {
                            queryResult.features[i].zone = {
                                'zone': zoneResult[y].zone,
                                'coordinates':[
                                    zoneResult[y].zone_long,
                                    zoneResult[y].zone_lat
                                ]}
                        }
                    }
                }
                var results = {
                    map: queryResult,
                    zone: zoneResult,
                    start: start*1000,
                    end: end*1000
                };
                res.json(results);
            });
        }
    }
};
