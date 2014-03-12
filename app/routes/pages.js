'use strict';

var iochits = require('../controllers/iochits'),
	ioc_drill = require('../controllers/ioc_drill'),
	ioc_event = require('../controllers/ioc_event'),
	ioc_top_remote = require('../controllers/ioc_top_remote'),
	local_drill = require('../controllers/local_drill'),
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
	app.get('/iochits', authorization.requiresLogin, iochits.render);
	app.get('/ioc_drill', authorization.requiresLogin, ioc_drill.render);
	app.get('/ioc_event', authorization.requiresLogin, ioc_event.render);
	app.get('/ioc_top_remote', authorization.requiresLogin, ioc_top_remote.render);
	app.get('/local_drill', local_drill.render);
	app.get('/new_remote_ip', authorization.requiresLogin, new_remote_ip.render);
	app.get('/new_dns_query', authorization.requiresLogin, new_dns_query.render);
	app.get('/new_http_hosts', authorization.requiresLogin, new_http_hosts.render);
	app.get('/new_ssl_hosts', authorization.requiresLogin, new_ssl_hosts.render);
	app.get('/l7', authorization.requiresLogin, l7.render);
	app.get('/l7_drill', authorization.requiresLogin, l7_drill.render);
	app.get('/l7_local', authorization.requiresLogin, l7_local.render);
	app.get('/top_local', authorization.requiresLogin, top_local.render);
	app.get('/top_local2remote', authorization.requiresLogin, top_local2remote.render);
	app.get('/top_remote', authorization.requiresLogin, top_remote.render);
	app.get('/ioc_top_remote2local', authorization.requiresLogin, ioc_top_remote2local.render);
	app.get('/top_remote2local', authorization.requiresLogin, top_remote2local.render);
	app.get('/archive', authorization.requiresLogin, archive.render);
};