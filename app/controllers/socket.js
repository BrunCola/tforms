'use strict';

var config = require('../../config/config'),
	mysql = require('mysql');

exports.init = function(req, res) {
	var io = req.app.get('io');
	var connection = req.app.get('connection');
	var alerts = []
	var isInitIoc = false
	var socketCount = 0

	io.sockets.on('connection', function(socket){
		// Socket has connected, increase socket count
		socketCount++
		// Let all sockets know how many are connected
		io.sockets.emit('users connected', socketCount)

		socket.on('disconnect', function() {
			// Decrease the socket count on a disconnect, emit
			socketCount--
			io.sockets.emit('users connected', socketCount)
		})

		// socket.on('new note', function(data){
		// 	// New note added, push to all sockets and insert into db
		// 	notes.push(data)
		// 	io.sockets.emit('new note', data)
		// 	// Use node's db injection format to filter incoming data
		// 	connection.query('INSERT INTO notes (note) VALUES (?)', data.note)
		// })

		// Check to see if initial query/notes are set
		if (! isInitIoc) {
			// Initial app start, run connection query
			connection.query("SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = 'rapidPHIRE' AND alert.trash is null ORDER BY alert.added DESC LIMIT 5")
				.on('result', function(data){
					// Push results onto the notes array
					alerts.push(data)
				})
				.on('end', function(){
					// Only emit notes after query has been completed
					socket.emit('initial iocs', alerts)
				})

			isInitIoc = true
		} else {
			// Initial iocs already exist, send out
			socket.emit('initial iocs', alerts)
		}
	})
};
