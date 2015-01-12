'use strict';

var config = require('../../config/config')

module.exports = function() {
    return {
        // test: function(req, res, next) {
        //     console.log('TEST')
        // },
        // requiresLogin: function(req, res, next) {
        //     if (!req.isAuthenticated()) {
        //         return res.status(401).send('User is not authorized');
        //     }
        //     next();
        // },
        // requiresAdmin: function(req, res, next) {
        //     if (!req.isAuthenticated() || !req.user.hasRole('admin')) {
        //         return res.status(401).send('User is not authorized');
        //     }
        //     next();
        // },
        permission: function(req, res, next) {
            // insert 24 hour window if there is no time defined in query
            if (!(req.query.start && req.query.end)) {
                req.query.start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
                req.query.end = Math.round(new Date().getTime() / 1000);
            }

        //     if (req.user === undefined) { return }
        //     req.user.blacklist = []; // remove this once check function is created
        //     // check if logged in
        //     if (!req.isAuthenticated()) {
        //         return res.status(401).send('User is not authorized');
        //     }
        //     // check if the user doesn't have permission for the route
        //     if (req.user.blacklist.length > -1) {
        //         var page = req.route.path.match(/.*\/(\S+)/);
        //         if ((req.user.blacklist.length > 0) && (page[page.length-1].indexOf(req.user.blacklist) !== -1)) {
        //             return res.status(401).send('User is not authorized');
        //         } else {
                    next();
        //         }
        //     } else {
        //         return res.status(500).send('Something went wrong, please contact support');
        //     }
        }
    }
}