'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    multer = require('multer'),
    errorHandler = require('errorhandler'),
    mean = require('./meanio'),
    consolidate = require('consolidate'),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    config = require('./config'),
    expressValidator = require('express-validator'),
    appPath = process.cwd(),
    util = require('./util'),
    assetmanager = require('assetmanager');

module.exports = function(app, version, io, pool) {
    // app.param('end', /^[0-9]{1,10}$/);
    app.set('showStackError', true);

    // Prettify HTML
    app.locals.pretty = true;

    // cache=memory or swig dies in NODE_ENV=production
    app.locals.cache = 'memory';

    // Should be placed before express.static
    // To ensure that all assets and data are compressed (utilize bandwidth)
    app.use(compression({
        // Levels are specified in a range of 0 to 9, where-as 0 is
        // no compression and 9 is best compression, but slowest
        level: 9
    }));

    // Only use logger for development environment //NOW USING IN ALL ENVIRONMENTS
    if (process.env.NODE_ENV === 'development') {
       app.use(morgan('dev'));
    } 

    app.use('/api', expressJwt({secret: config.sessionSecret}));

    //
    // replace in morgan/index.js for slightly more interesting logging
    //

    // exports.format('dev', function(tokens, req, res){

    //     var console_timestamp = function() {
    //         return function() {
    //             var df = require('dateformat');
    //             return df(new Date(), 'yy-mm-dd HH:MM:ss');
    //         }
    //     }
    //     var timestamp = console_timestamp()

    //   var status = res.statusCode
    //     , len = parseInt(res.getHeader('Content-Length'), 10)
    //     , color = 32;

    //   if (status >= 500) color = 31
    //   else if (status >= 400) color = 33
    //   else if (status >= 300) color = 36;

    //   len = isNaN(len)
    //     ? ''
    //     : len = ' - ' + bytes(len);
      
    //   return '[' + timestamp() + '] \x1b[90m' + req.method
    //     + ' ' + (req.originalUrl || req.url) + ' '
    //     + '\x1b[' + color + 'm' + res.statusCode
    //     + ' \x1b[90m'
    //     + req.ip + ' '
    //     + (new Date - req._startTime)
    //     + 'ms' + len
    //     + '\x1b[0m';
    // });

    // assign the template engine to .html files
    app.engine('html', consolidate[config.templateEngine]);

    // set .html as the default extension
    app.set('view engine', 'html');

    // Set views path, template engine and default layout
    app.set('views', config.root + '/server/views');

    // Enable jsonp
    app.enable('jsonp callback');

    // Request body parsing middleware should be above methodOverride
    app.use(expressValidator());
    // app.use(bodyParser());

    app.use(bodyParser());
    app.use(methodOverride());
    app.use(multer());
    // app.set('pool', pool);
    // Import your asset file
    var assets = require('./assets.json');
    assetmanager.init({
        js: assets.js,
        css: assets.css,
        debug: (process.env.NODE_ENV !== 'production'),
        webroot: 'public/public'
    });

    // Add assets to local variables
    app.use(function(req, res, next) {
        res.locals.assets = assetmanager.assets;
        next();
    });

    // Dynamic helpers
    app.use(helpers(config.app.name));

    //mean middleware from modules before routes
    app.use(mean.chainware.before);

    // Connect flash for flash messages
    app.use(flash());

    // Setting the fav icon and static folder
    app.use(favicon(appPath + '/public/system/assets/img/favicon.ico'));
    app.use('/public', express.static(config.root + '/public'));

    app.get('/modules/aggregated.js', function(req, res) {
        res.setHeader('content-type', 'text/javascript');
        res.send(mean.aggregated.js);
    });

    app.get('/modules/aggregated.css', function(req, res) {
        res.setHeader('content-type', 'text/css');
        res.send(mean.aggregated.css);
    });
    // app.use(multer({ dest: '/public/uploads'}));
    mean.events.on('modulesFound', function() {

        for (var name in mean.modules) {
            app.use('/' + name, express.static(config.root + '/' + mean.modules[name].source + '/' + name + '/public'));
        }

        console.log(version)
        function bootstrapRoutes() {
            // Skip the app/routes/middlewares directory as it is meant to be
            // used and shared by routes as further middlewares and is not a
            // route by itself
            util.walk(appPath + '/server/routes', 'middlewares', function(path) {
                require(path)(app, version, io, pool);
            });
        }

        bootstrapRoutes();

        //mean middlware from modules after routes
        app.use(mean.chainware.after);

        // Assume "not found" in the error msgs is a 404. this is somewhat
        // silly, but valid, you can do whatever you like, set properties,
        // use instanceof etc.
        app.use(function(err, req, res, next) {
            // Treat as 404
            if (~err.message.indexOf('not found')) return next();

            // Log it
            console.error(err.stack);

            // Error page
            res.status(500).render('500', {
                error: err.stack
            });
        });

        // Assume 404 since no middleware responded
        app.use(function(req, res) {
            res.status(404).render('404', {
                url: req.originalUrl,
                error: 'Not found'
            });
        });

        // Error handler - has to be last
        if (process.env.NODE_ENV === 'development') {
            app.use(errorHandler());
        }
    });
    
    //----REGEX----

    // any ip address without a port
    // app.param('ipWithPort', /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\:\d{1,5}$/);
    // any ip address with a port
    // app.param('ipWithoutPort', /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);

    // email address
    // app.param('email', /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/);
    
    // pure text
    // app.param('pureText', /^[a-zA-Z0-9]*$/); //DOES NOT MATCH SPACES or underscore!
    
    // text with spaces
    // app.param('pureTextWW', /^[a-zA-Z0-9_\s]*$/); //matches whitespace AND underscore
    
    // pure numbers
    // app.param('pureNumbers', /^[0-9]*$/);
    
    // pure text containing _
    // app.param('pureTextWU', /^[a-zA-Z0-9_]*$/); //DOES NOT MATCH SPACES, but matches underscore!
    
    // 'start' & 'end' unix times (see any url when date is changed) 
    // app.param('unixTS', /^\d{10}$/);
    
    // lan_zone 
    // app.param('lanZone', /^[a-zA-Z0-9_\s]*$/); //for now made this the same as pureTextWU because i don't know what all of the possibilities are...
    
    // http_host and host
    // app.param('httpHost', /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/);
    
    // status_code 
    // app.param('httpStatusCode', /^\d{3}$/); 
    
    // src_user 
    // app.param('srcUser', /^[a-zA-Z0-9_\-\.]*$/);
    
    // ioc_attrID
    // app.param('iocAttrID', /^0|\d{6}$/); 

    // ---- The remaining should mostly be checking AGAINST sql escape characters, which i still need to figure out. ----
    // The following regexes may be possible ones to use: 
    // ----> /((\%27)|(\'))union/ix 
    // ----> /((\%27)|(\'))drop/ix 
    // ----> /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/ix 
    
    // ioc
    // app.param('ioc', //);
    // l7_proto 
    // app.param('knownl7Proto', //);
    // mime
    // app.param('mime', //);
    // email subject
    // app.param('emailSubject', //);
    // alert_info 
    // app.param('alertInfo', //);    
};