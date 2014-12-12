'use strict';

var mean = require('../config/meanio'),
    config = require('../config/config');

module.exports = function (version) {
    return {
        render: function (req, res) {
            // Send some basic starting info to the view
            var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
            var end = Math.round(new Date().getTime() / 1000);
            
            // res.render('index', {
            //     user: req.user ? JSON.stringify({
            //         email: req.user.email,
            //         checkpoint: req.user.checkpoint,
            //         _id: req.user._id,
            //         username: req.user.username,
            //         id: req.user.id,
            //         database: req.user.database,
            //         uploads: config.localUploads.enabled,
            //         level: req.user.level,
            //         // roles: (req.user ? req.user.roles : ['anonymous'])
            //     }) : 'null',
            //     modules: JSON.stringify(modules),
            //     version: version,
            //     start: start,
            //     end: end,
            //     report: 'null'
            // });            
            res.render('index', {
                version: version,
                start: start,
                end: end,
                report: 'null'
            });

        }
    };
};
