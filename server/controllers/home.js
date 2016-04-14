'use strict';

var query = require('./constructors/query');

var database = "tform";

module.exports = function(pool) {
    return {
        getclient: function(req, res) {
            var get = {
                query: 'SELECT '+
                        '* '+
                    'FROM '+
                        '`client` ',
                insert: []
            }
            new query(get, {database: database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        createclient: function(req, res) {
            var get = {
                query: 'INSERT INTO  `client` (`name`,`age`,`sexe`) values (?,?,?) ',
                insert: [req.body.name, req.body.age, req.body.sexe]
            }
            new query(get, {database: database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        editclient: function(req, res) {
            var get = {
                query: 'Update  `client` SET `name` = ?, `age`= ? ,`sexe`=? WHERE id=?',
                insert: [req.body.name, req.body.age, req.body.sexe, req.body.id]
            }
            new query(get, {database: database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        },
        deleteclient: function(req, res) {
            var get = {
                query: 'DELETE FROM  `client` where id=? ',
                insert: [req.body.id]
            }
            new query(get, {database: database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json(data);
            });
        }
    }
};