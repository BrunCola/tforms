'use strict'

//
// OPTION -> if MySQL uses SSL
// var fs = require('fs');
//
var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
    defaultDateRange: 1,
    root: rootPath,
    port: process.env.port || 3000,
    environment: process.env.NODE_ENV || 'production', // OPTIONS: development, production
    site_url: 'https://localhost:3000', // used for activation email config
    sslAssets: {
        // remeber this is also set in .gitignore if you plan on moving it
        key: './ssl/server.key',
        cert: './ssl/server.crt'
    },
    readDB: {
        port: 3306,
        host: '127.0.0.1',
        user: 'root',
        password: 'KUTCORNERS',
        database: 'tform',
        connectionLimit: 10000
    },
    writeDB: {
        port: 3306,
        host: '127.0.0.1',
        user: 'root',
        password: 'KUTCORNERS',
        database: 'tform',
        connectionLimit: 10000
    },
    xhttpAccess: {
        origin: 'http://localhost:1991',
        methods: 'GET,PUT,POST,DELETE',
        headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    },
    // templateEngine: 'swig',
    // The secret should be set to a non-guessable string that
    // is used to compute a session hash
    sessionSecret: 'har4aC6Mix3dVot7',
    // 2auth secret is a temporart token ONLY for the user who is 1/2 way through the login process
    // twoAuthSecret: '+2{B}M?0b5^.78j',
    resetPassSecret: '+2{B}M?0b5^.78j', // secret for email storage when changing pass
};