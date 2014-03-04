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
	l7_drill = require('../controllers/l7_drill'),
	l7_local = require('../controllers/l7_local'),
	top_local = require('../controllers/top_local'),
	top_local2remote = require('../controllers/top_local2remote'),
	top_remote = require('../controllers/top_remote'),
	ioc_top_remote2local = require('../controllers/ioc_top_remote2local'),
	top_remote2local = require('../controllers/top_remote2local'),
	archive = require('../controllers/archive'),

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
    app.get('/l7_drill', l7_drill.render);
    app.get('/l7_local', l7_local.render);
    app.get('/top_local', top_local.render);
    app.get('/top_local2remote', top_local2remote.render);
    app.get('/top_remote', top_remote.render);
    app.get('/ioc_top_remote2local', ioc_top_remote2local.render);
    app.get('/top_remote2local', top_remote2local.render);
    app.get('/archive', archive.render);
};