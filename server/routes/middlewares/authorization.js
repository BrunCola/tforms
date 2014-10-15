'use strict';

module.exports = function() {
    return {
        test: function(req, res, next) {
            console.log('TEST')
        },
        requiresLogin: function(req, res, next) {
            if (!req.isAuthenticated()) {
                return res.status(401).send('User is not authorized');
            }
            next();
        },
        requiresAdmin: function(req, res, next) {
            if (!req.isAuthenticated() || !req.user.hasRole('admin')) {
                return res.status(401).send('User is not authorized');
            }
            next();
        },
        permission: function(req, res, next) {
            req.session.passport.user.blacklist = []; // remove this once check function is created
            // check if logged in
            if (!req.isAuthenticated()) {
                return res.status(401).send('User is not authorized');
            }
            // check if the user doesn't have permission for the route
            if (req.session.passport.user.blacklist) {
                var page = req.route.path.match(/.*\/(\S+)/);
                if ((req.session.passport.user.blacklist.length > 0) && (page[page.length-1].indexOf(req.session.passport.user.blacklist) !== -1)) {
                    return res.status(401).send('User is not authorized');
                } else {
                    next();
                }
            } else {
                return res.status(500).send('Something went wrong, please contact support');
            }
        }
    }
}