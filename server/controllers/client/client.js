'use strict';

var query = require('../constructors/query'),
    async = require('async');

var database = "tform";

module.exports = function(pool) {
    return {
        getclientinfo: function(req, res) {
            var getArea = {
                query: 'SELECT '+
                        '* '+
                    'FROM '+
                        '`injury_area` '+
                    'WHERE '+
                        '`client_id` = ?',
                insert: [req.query.client_id]
            }
            var getType = {
                query: 'SELECT '+
                        '* '+
                    'FROM '+
                        '`injury_type` '+
                    'WHERE '+
                        '`client_id` = ?',
                insert: [req.query.client_id]
            }
            var getRepair = {
                query: 'SELECT '+
                        '* '+
                    'FROM '+
                        '`injury_repair` '+
                    'WHERE '+
                        '`client_id` = ?',
                insert: [req.query.client_id]
            }
            var clientInfo = {};
            async.series([
                function(callback) { // INJURY AREA
                    new query(getArea, {database: database, pool: pool}, function(err,data){
                        if (err) { res.status(500).end(); return }
                        clientInfo.area = data;
                        callback();
                    });
                },
                function(callback) { // INJURY TYPE
                    new query(getType, {database: database, pool: pool}, function(err,data){
                        if (err) { res.status(500).end(); return }
                        clientInfo.type = data;
                        callback();
                    });
                },
                function(callback) {// INJURY REAPAIR
                    new query(getRepair, {database: database, pool: pool}, function(err,data){
                        if (err) { res.status(500).end(); return }
                        clientInfo.repair = data;
                        callback();
                    });
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                console.log(clientInfo)
                res.json(clientInfo);
            });
        },
        createclient: function(req, res) {
            var get = {
                query: 'INSERT INTO  `client` (`name`,`age`,`sexe`) values (?,?,?) ',
                insert: [req.body.name, req.body.age, req.body.sexe]
            }
            new query(get, {database: database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        editClientInfo: function(req, res) {
            console.log(req.body)
            let areaArray = [];
            let typeArray = [];
            let repairArray = [];
            let areaString = "UPDATE injury_area SET "
            let typeString = "UPDATE injury_type SET "
            let repairString = "UPDATE injury_repair SET "

            if (Object.keys(req.body.area).length > 0) {
                for (let i = 0, len = Object.keys(req.body.area).length; i < len; i++) {
                    areaString += Object.keys(req.body.area)[i]+"=?"
                    if (i < Object.keys(req.body.area).length-1) {
                        areaString += ","
                    }
                    areaArray.push(Number(req.body.area[Object.keys(req.body.area)[i]]))
                }
                areaArray.push(Number(req.body.client_id))
                areaString += " WHERE client_id = ?"
                let areaQuery = {
                    query:areaString,
                    insert:areaArray
                }
            }            
            if (Object.keys(req.body.type).length > 0) {
                for (let i = 0, len = Object.keys(req.body.type).length; i < len; i++) {
                    typeString += Object.keys(req.body.type)[i]+"=?"
                    if (i < Object.keys(req.body.type).length-1) {
                        typeString += ","
                    }
                    typeArray.push(Number(req.body.type[Object.keys(req.body.type)[i]]))
                }
                typeArray.push(Number(req.body.client_id))
                typeString += " WHERE client_id = ?"
                let typeQuery = {
                    query:typeString,
                    insert:typeArray
                }
            }
            if (Object.keys(req.body.repair).length > 0) {
                for (let i = 0, len = Object.keys(req.body.repair).length; i < len; i++) {
                    repairString += Object.keys(req.body.repair)[i]+"=?"
                    if (i < Object.keys(req.body.repair).length-1) {
                        repairString += ","
                    }
                    repairArray.push(Number(req.body.repair[Object.keys(req.body.repair)[i]]))
                }
                repairArray.push(Number(req.body.client_id))
                repairString += " WHERE client_id = ?"
                let repairQuery = {
                    query:repairString,
                    insert:repairArray
                }
            }
             async.series([
                function(callback) { // INJURY AREA
                    if (areaArray.length > 0) {
                        new query(areaQuery, {database: database, pool: pool}, function(err,data){
                            if (err) { res.status(500).end(); return }
                            callback();
                        });
                    } else {
                        callback();
                    }
                },
                function(callback) { // INJURY TYPE
                    if (typeArray.length > 0) {
                        new query(typeQuery, {database: database, pool: pool}, function(err,data){
                            if (err) { res.status(500).end(); return }
                            callback();
                        });
                    } else {
                        callback();
                    }
                },
                function(callback) {// INJURY REAPAIR
                    if (repairArray.length > 0) {
                        new query(repairQuery, {database: database, pool: pool}, function(err,data){
                            if (err) { res.status(500).end(); return }
                            callback();
                        });
                    } else {
                        callback();
                    }
                },
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) throw console.log(err);
                res.json({});
            });
            // var getArea = {
            //     query: 'SELECT '+
            //             '* '+
            //         'FROM '+
            //             '`injury_area` '+
            //         'WHERE '+
            //             '`client_id` = ?',
            //     insert: [req.query.client_id]
            // }
            // var getType = {
            //     query: 'SELECT '+
            //             '* '+
            //         'FROM '+
            //             '`injury_type` '+
            //         'WHERE '+
            //             '`client_id` = ?',
            //     insert: [req.query.client_id]
            // }
            // var getRepair = {
            //     query: 'SELECT '+
            //             '* '+
            //         'FROM '+
            //             '`injury_repair` '+
            //         'WHERE '+
            //             '`client_id` = ?',
            //     insert: [req.query.client_id]
            // }
            // var clientInfo = {};
            // async.series([
            //     function(callback) { // INJURY AREA
            //         new query(getArea, {database: database, pool: pool}, function(err,data){
            //             if (err) { res.status(500).end(); return }
            //             clientInfo.area = data;
            //             callback();
            //         });
            //     },
            //     function(callback) { // INJURY TYPE
            //         new query(getType, {database: database, pool: pool}, function(err,data){
            //             if (err) { res.status(500).end(); return }
            //             clientInfo.type = data;
            //             callback();
            //         });
            //     },
            //     function(callback) {// INJURY REAPAIR
            //         new query(getRepair, {database: database, pool: pool}, function(err,data){
            //             if (err) { res.status(500).end(); return }
            //             clientInfo.repair = data;
            //             callback();
            //         });
            //     },
            // ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
            //     if (err) throw console.log(err);
            //     // res.json(clientInfo);
            // });



            // var get = {
            //     query: 'UPDATE  `client` SET `name` = ?, `age`= ? ,`sexe`=? WHERE id=?',
            //     insert: [req.body.name, req.body.age, req.body.sexe, req.body.id]
            // }
            // new query(get, {database: database, pool: pool}, function(err,data){
            //     if (err) { res.status(500).end(); return }
            //     res.json(data);
            // });
        },
    }
};