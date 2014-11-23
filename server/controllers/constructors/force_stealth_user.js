'use strict';

var config = require('../../config/config'),
    async = require('async');

module.exports = function (sql, queries, conn, callback) {
    var nodes = [], uniqueNodes = [];
    var links = [], uniqueLinks = {};
    var usersList = [], userLinks = [];
    var nodesObject = {}; // for use on the front
    var clearTextIndex = -1;

    function uniqueUsers(user, group) {
        // if lan_user is not in unique object
        if (!(user in uniqueLinks)) {
            // add user to object and add value to unique nodes
            uniqueLinks[user] = {};
            // place the current node into the nodesIn object
            uniqueLinks[user][group] = {
                count: 1
            }
        // if lan_user is already in unique object
        } else {
            // if coi is not already in nodesIn, place it in
            if (!(group in uniqueLinks[user])) {
                uniqueLinks[user][group] = {
                    count: 1
                }
            // otherwise increase value by 1
            } else {
                uniqueLinks[user][group].count++;
            }
        }
    }

    function uniqueNodesCompare(user, group) {
        // if lan_user is not in unique object
        if (!(group in nodesObject)) {
            // add user to object and add value to unique nodes
            nodesObject[group] = {};
            // place the current node into the nodesIn object
            nodesObject[group][user] = [];
            nodesObject[group][user].push(group);
        // if lan_user is already in unique object
        } else {
            // if coi is not already in nodesIn, place it in
            if (!(user in nodesObject[group])) {
                nodesObject[group][user] = [];
                nodesObject[group][user].push(group);
            // otherwise increase value by 1
            } else {
                nodesObject[group][user].push(group);
            }
        }
    }

    function compareUsers(obj) {
        var user = obj.lan_user;
        if (user in uniqueLinks) {
            //for (var i in uniqueLinks[user]) { // -- extra loop *** Prints double the nodes ***
                var arr = [];
                arr = Object.keys(uniqueLinks[user]);
                for (var o = 0; o < arr.length; o++) {
                    if (arr[o] !== 'ClearText') {
                        // push a new entry for every single node
                        nodes.push({
                            "name": obj.lan_user,
                            "group": 'child', // type goes here at some point
                            "count": 1,
                            "value": obj
                        });
                        // source should be at the end of the 'nodes' array (since we just pushed it in)
                        var source = nodes.length-1;
                        // target is the index of the corresponding main node
                        var target = uniqueNodes.indexOf(arr[o])
                        // push links to its own array
                        userLinks.push({
                            "source": source,
                            "target": target,
                            "class": 'child',
                            "allowed": obj.allow
                        })
                        
                    }
                }
           // }
        }
    }

    conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            if (err) throw err;
        });
        async.parallel([
            // Crossfilter function
            function(callback) {
                connection.query(sql.query)
                    .on('result', function(data){
                        // if (data.group.toLowerCase().indexOf('clear') !== -1)  {return }
                        // SETTING UP UNIQUE NODES
                        // if coi is not in uniqe coi array
                        if (uniqueNodes.indexOf(data.group) === -1) {
                            // push to nodes
                            nodes.push({
                                "name": data.group,
                                "group": 'coi', // type goes here at some point
                                "count": 1
                            });
                            // record the unique type
                            uniqueNodes.push(data.group);
                        // otherwise, increase total count of the coi
                        } else {
                            // find the index (location in the node array based on where the value returned from data.x is in the unique array)
                            var index = uniqueNodes.indexOf(data.group);
                            // increase total node count by 1
                            nodes[index].count++;
                        }
                        // SETTING UP LOGIC FOR LINK RELATIONSHIPS
                        uniqueUsers(data.lan_user, data.group);
                        uniqueNodesCompare(data.lan_user, data.group);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
            // PLACE ALL EXTRA QUERIES HERE, IN ASYNC FORMAT
            // also, increase the index of the array being queried
            function(callback) {
                connection.query(queries[0].query, queries[0].insert)
                    .on('result', function(data){
                        // console.log(" ");
                        usersList.push(data);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
            function(callback) {
                connection.query(queries[1].query, queries[1].insert)
                    .on('result', function(data){
                        usersList.push(data);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
            function(callback) {
                connection.query(queries[2].query, queries[2].insert, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        result.forEach(function(data){
                            for(var i = 0; i < nodes.length; i++) {
                                if(nodes[i].name+"COI" === data.cois){
                                    nodes[i].rules = [{
                                        rule: data.rule, 
                                        order: data.rule_order
                                    }];                                       
                                }
                            }
                        })
                        callback();
                    }
                })
            },
            function(callback) {
                connection.query(queries[3].query, queries[3].insert, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        result.forEach(function(data){
                            for(var i = 0; i < nodes.length; i++) {
                                if(nodes[i].name === data.name){
                                    nodes[i].x = data.x;
                                    nodes[i].y = data.y;
                                }                       
                            }
                        })
                        callback();
                    }
                })
            },
            function(callback) {
                connection.query(queries[4].query, queries[4].insert)
                    .on('result', function(data){
                        usersList.push(data);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
            function(callback) {
                connection.query(queries[5].query, queries[5].insert)
                    .on('result', function(data){
                        usersList.push(data);
                    })
                    .on('end', function(){
                        callback();
                    });
            },
        ], function(err) {
            if (err) throw console.log(err);
            connection.release();
            // LINK USERS QUERIES TO OUR MAIN NODES
            for (var i in usersList) {
                compareUsers(usersList[i]);
            }
            // SETTING UP LINKS
            // for every item that is in 'uniqueLinks' object, with more than one children in 'nodesIn', push links
            for (var i in uniqueLinks) {
                // console.log(i)
                // continue if item is in more than 1 node
                if (Object.keys(uniqueLinks[i]).length > 1) {
                    // get keys in 'nodesIn'
                    var arr = Object.keys(uniqueLinks[i])
                    // set source of link ALSO REMEMBER THE FIRST NODE FOR LOOPING THE CONNECTIONS
                    // set first node in case of more than 2 children
                    var source = uniqueNodes.indexOf(arr[0]), target;
                    for (var o = 1; o < arr.length; o++) {
                        target = uniqueNodes.indexOf(arr[o])
                         // if index (o) is at the end of the array AND the array is greater than 2
                        if ((o === arr.length-1) && (arr.length > 2)) {
                            // set source back to begining
                            source = uniqueNodes.indexOf(arr[o]);
                            target = uniqueNodes.indexOf(arr[0]);
                        }
                        // push values to links
                        links.push({
                            "source": source,
                            "target": target,
                            "value": 1
                        })
                        // set source to current target
                        source = uniqueNodes.indexOf(arr[o]);
                    }
                }
            }
            // REDUCE GENERATED LINKS 
            var uniqueSources = {};
            for (var i in links) {
                var target = links[i].target;
                var source = links[i].source;
                var value = links[i].value;
                // first check for a previously existing inverse
                if ((target in uniqueSources) && (source in uniqueSources[target])) {
                    uniqueSources[target][source] += value;
                // then for every value in links, check if it is in our unique obj
                } else if (!(source in uniqueSources)) {
                    // if not, create a new source parent and push in the target with value
                    uniqueSources[source] = {};
                    uniqueSources[source][target] = value;
                // otherwise, continue
                } else {
                    // do the same thing if just the target doesnt exist in the source
                    if (!(target in uniqueSources[source])) {
                        uniqueSources[source][target] = value;
                    // otherwise just increase the existing value
                    } else {
                        uniqueSources[source][target] += value;
                    }
                }
            }
            // clear original links array
            links = [];
            // push in the values of our reduce object
            for (var s in uniqueSources) {
                for (var t in uniqueSources[s]) {
                    links.push({
                        "source": parseInt(s),
                        "target": parseInt(t),
                        "value": uniqueSources[s][t]
                    })
                }
            }
            // add userLinks to end of current link array
            links = links.concat(userLinks);
            var results = {
                uniqueUsers: uniqueLinks,
                uniqueNodes: nodesObject,
                links: links,
                nodes: nodes
            }
            callback(null, results);
            // res.json(uniqueLinks);
        });
    })
};