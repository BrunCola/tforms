'use strict';

var query = require('./constructors/query'),
    bcrypt = require('bcrypt');

module.exports = function(pool) {
    return {
        archive: function(req, res) {
            var database = req.user.database;
            var archive = {
                query: "UPDATE `conn_ioc` SET `trash` = UNIX_TIMESTAMP(NOW()) WHERE `lan_ip`= ? AND `remote_ip`= ? AND ioc= ?",
                insert: [req.body.lan_ip, req.body.remote_ip, req.body.ioc]
            }
            new query(archive, {database: database, pool: pool}, function(err,data){
                if (err) {
                    res.status(500).end();
                } else {
                    res.status(200).end();
                }
            });
        },
        restore: function(req, res) {
            var database = req.user.database;
            var restore = {
                query: "UPDATE `conn_ioc` SET `trash` = null WHERE `lan_ip`= ? AND `remote_ip`= ? AND ioc= ?",
                insert: [req.body.lan_ip, req.body.remote_ip, req.body.ioc]
            }
            new query(restore, {database: database, pool: pool}, function(err,data){
                if (err) {
                    res.status(500).end();
                } else {
                    res.status(200).end();
                }
            });
        },
        clear: function(req, res) {
            var database = req.user.database;
            var clear = {
                query: "DELETE FROM `conn_ioc` WHERE `trash` IS NOT NULL",
                insert: []
            }
            new query(clear, {database: database, pool: pool}, function(err,data){
                if (err) {
                    res.status(500).end();
                } else {
                    res.status(200).end();
                }
            });
        },
        local_cc: function(req, res) {
            var zone = req.body.zone;
            if (zone !== undefined) {
                var clear = {
                    query: "SELECT zone_cc, zone_country FROM zone WHERE `database` = ? AND zone = ?",
                    insert: [req.user.database, zone]
                }
                new query(clear, {database: 'rp_users', pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.json(data[0]);
                    }
                });
            } else {
                res.status(500).end();
            }
        },
        add_user_to_map: function(req, res) {
            var database = req.user.database;
            var lan_ip = req.body.lan_ip;
            var lan_zone = req.body.lan_zone;
            if (lan_ip !== undefined && lan_zone !== undefined) {
                var update_user_ref = {
                    query: "UPDATE `users` SET `x`= ?, `y`=?, `map`=? WHERE `lan_ip` = ? AND `lan_zone` = ?",
                    insert: [req.body.x_coord, req.body.y_coord, req.body.map_name, req.body.lan_ip, req.body.lan_zone]
                }
                new query(update_user_ref, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).end();
                    }
                });
            }else{
                res.status(500).end();
            }
        },
        change_custom_user: function(req, res) {
            var database = req.user.database;
            var lan_ip = req.body.lan_ip;
            var lan_zone = req.body.lan_zone;
            if (lan_ip !== undefined && lan_zone !== undefined) {
                var update_user_ref = {
                    query: "UPDATE `users` SET `custom_user`= ? WHERE `lan_ip` = ? AND `lan_zone` = ?",
                    insert: [req.body.custom_user, req.body.lan_ip, req.body.lan_zone]
                }
                new query(update_user_ref, {database: database, pool: pool}, function(err,data){
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).end();
                    }
                });
            }else{
                res.status(500).end();
            }
        }
    }
}