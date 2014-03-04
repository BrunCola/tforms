'use strict';
	var index = require('../controllers/index'),
		report = require('../controllers/report'),
		socket = require('../controllers/socket');

module.exports = function(app, passport, connection, io) {

    app.set('io', io);
    app.set('connection', connection);
    app.get('/', index.render, socket.init);
    app.get('/report', report.render, socket.init);
};
