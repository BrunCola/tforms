'use strict';

var iochits = require('../controllers/iochits'),
	ioc_drill = require('../controllers/ioc_drill'),
	ioc_event = require('../controllers/ioc_event'),
	ioc_top_remote = require('../controllers/ioc_top_remote'),
	new_remote_ip = require('../controllers/new_remote_ip'),
	new_dns_query = require('../controllers/new_dns_query'),
	new_http_hosts = require('../controllers/new_http_hosts'),
	new_ssl_hosts = require('../controllers/new_ssl_hosts'),
	l7 = require('../controllers/l7'),
	top_local = require('../controllers/top_local'),

	authorization = require('./middlewares/authorization.js');

module.exports = function(app) {
    // Home route
    //app.get('/iochits', authorization.requiresLogin, iochits.render);
    app.get('/iochits', iochits.render);
    app.get('/ioc_drill', ioc_drill.render);
    app.get('/ioc_event', ioc_event.render);
    app.get('/ioc_top_remote', ioc_top_remote.render);
    app.get('/new_remote_ip', new_remote_ip.render);
    app.get('/new_dns_query', new_dns_query.render);
    app.get('/new_http_hosts', new_http_hosts.render);
    app.get('/new_ssl_hosts', new_ssl_hosts.render);
    app.get('/l7', l7.render);
    app.get('/top_local', top_local.render);
};