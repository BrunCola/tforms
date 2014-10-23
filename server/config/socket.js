'use strict';
var mysql = require('mysql'),
    config = require('./config');

module.exports = function(app, passport, io, pool) {
    var alerts = [];
    var isInitIoc = false;
    var socketCount = 0;
    io.sockets.on('connection', function(socket){
        var POLLCheckpoint, timer;
        socketCount++;
        // Let all sockets know how many are connected
        io.sockets.emit('users connected', socketCount);

        socket.on('disconnect', function() {
            // Decrease the socket count on a disconnect, emit
            socketCount--;
            io.sockets.emit('users connected', socketCount);
        })
        // socket.on('init', function(userData) {
        //     var alerts = [], newIOCcount = 0;
        //     // get user's checkpoint from session data (to avoid caching)
        //     pool.getConnection(function(err, connection) {
        //         connection.query("SELECT checkpoint FROM user WHERE username = ?", [userData.username], function(err, results){
        //             if (err) throw err;
        //             if (results.length > 0) {
        //                 // if result is returned, run query checking for new alerts
        //                 var checkpoint = results[0].checkpoint;
        //                 connection.changeUser({database : userData.database}, function(err) {
        //                     if (err) throw err;
        //                 });
        //                 // connection.query("SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = ? AND alert.added >= ? ORDER BY alert.added", [userData.username, checkpoint], function (err, results) {
        //                 //  if (results) {
        //                 //      newIOCcount = results.length;
        //                 //  }
        //                 // });
        //                 // connection.query("SELECT "+
        //                 //  "alert.added, "+
        //                 //  "conn_ioc.ioc, "+
        //                 //  "conn_ioc.ioc_severity "+
        //                 //  "FROM alert, conn_ioc "+
        //                 //  "WHERE alert.conn_uids = conn_ioc.conn_uids "+
        //                 //  "AND alert.username = ? "+
        //                 //  "AND alert.trash is null "+
        //                 //  "ORDER BY alert.added DESC "+
        //                 //  "LIMIT 10", [userData.username])
        //                 // .on('result', function(data) {
        //                 //  if (data.added >= checkpoint) {
        //                 //      data.newIOC = true;
        //                 //  }
        //                 //  alerts.push(data);
        //                 // })
        //                 // .on('end', function(){
        //                 //  socket.emit('initial iocs', alerts, newIOCcount);
        //                 //  POLLCheckpoint = Math.round(new Date().getTime() / 1000);
        //                 //  timer = setInterval(function(){polling(userData.username, POLLCheckpoint, userData.database)}, 5000);
        //                 // })
        //                 connection.release();
        //             }
        //         })
        //     });
        // });
        // // socket.on('checkpoint', function(userData){
        // //  function newCP() {
        // //      var newCheckpoint = Math.round(new Date().getTime() / 1000);
        // //      POLLCheckpoint = newCheckpoint;
        // //      console.log('checkpoint now set to: '+newCheckpoint);
        // //      clearInterval(timer);
        // //      timer = setInterval(function(){polling(userData.username, POLLCheckpoint, userData.database)}, 5000);
        // //      pool.query("UPDATE `user` SET `checkpoint`= ? WHERE `username` = ?", [newCheckpoint, userData.username]);
        // //  }
        // //  newCP();
        // // });
        // function polling(username, POLLCheckpoint, database) {
        //     pool.getConnection(function(err, connection) {
        //         connection.changeUser({database : database}, function(err) {
        //             if (err) throw err;
        //         });
        //         var newarr = []; var arr = []; var topAdded = 0;
        //         connection.query("SELECT "+
        //                     "alert.added, "+
        //                     "conn_ioc.ioc, "+
        //                     "conn_ioc.ioc_severity "+
        //                     "FROM alert, conn_ioc "+
        //                     "WHERE alert.conn_uids = conn_ioc.conn_uids "+
        //                     "AND alert.username = ? "+
        //                     "AND alert.added >= ? "+
        //                     "ORDER BY alert.added", [username, POLLCheckpoint])
        //             .on('result', function(data) {
        //                 data.newIOC = true;
        //                 arr.push(data);
        //                 if (data.added > topAdded) {
        //                     topAdded = data.added;
        //                 }
        //             })
        //             .on('end', function(){
        //                 if (arr.length > 0) {
        //                     for (var d = 1; d < 11; d++){
        //                         if (arr[arr.length-d] !== undefined) {
        //                             newarr.push(arr[arr.length-d]);
        //                         }
        //                     }
        //                     topAdded += 1;
        //                     clearInterval(timer); // add a second to the timer
        //                     socket.emit('newIOC', newarr, arr.length);
        //                     timer = setInterval(function(){polling(username, topAdded, database)}, 300000); //change to 5 minutes on result
        //                 }
        //             })
        //             connection.release();
        //     });
        // }
    })
};