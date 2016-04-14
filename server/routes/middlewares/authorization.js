'use strict';

module.exports = function() {
    return {
        permission: function(req, res, next) {
            // if (req.user === undefined) { return }
            // req.user.blacklist = []; // remove this once check function is created
            // // check if logged in
            // if (!req.isAuthenticated()) {
            //     return res.status(401).send('User is not authorized');
            // }
            // // check if the user doesn't have permission for the route
            // if (req.user.blacklist) {
            //     var page = req.route.path.match(/.*\/(\S+)/);
            //     if ((req.user.blacklist.length > 0) && (page[page.length-1].indexOf(req.user.blacklist) !== -1)) {
            //         return res.status(401).send('User is not authorized');
            //     } else {
            //         next();
            //     }
            // } else {
            //     return res.status(500).send('Something went wrong, please contact support');
            // }
            next()
        }
    }
}