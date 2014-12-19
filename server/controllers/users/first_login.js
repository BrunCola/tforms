'use strict';

var fs = require('fs'),
    config = require('../../config/config'),
    query = require('../constructors/query'),
    user = require('../constructors/user'),
    bcrypt = require('bcrypt'),
    async = require('async');

var permissions = [3];

module.exports = function(pool) {
    return {
        render: function(req, res) {        
        },
        insert: function(req, res) {
            var database = "rp_users";
            if (req.query.type === 'savePassword') {
                if (req.user.first_login == 1) {
                bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            var create_user = {
                                query: "UPDATE `user` SET `password`=?, `first_login`=? WHERE `email`=? ",
                                insert: [hash, 0, req.user.email]
                            }
                            new query(create_user, {database: database, pool: pool}, function(err,data){
                                if (err) {
                                    res.status(500).end();
                                    return;
                                } 
                                res.status(200).end();
                            });
                        });
                    });                      
                }               
            } 
        }
    }
};