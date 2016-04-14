'use strict';
module.exports = function(app, version, pool) {
    var auth = require('./middlewares/authorization')();

    // Home routes 
    var home = require('../controllers/home')(pool, version);
    
    app.route('/api/home/getClient').get(auth.permission, home.getclient);
    app.route('/api/home/createClient').post(auth.permission, home.createclient);
    app.route('/api/home/editClient').post(auth.permission, home.editclient);
    app.route('/api/home/deleteClient').post(auth.permission, home.deleteclient);

};
