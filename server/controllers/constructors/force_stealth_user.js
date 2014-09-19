'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
    var nodes = [], uniqueNodes = [];
    var links = [], uniqueLinks = {};
    conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            if (err) throw err;
        });
        connection.query(sql.query)
            .on('result', function(data){
                // SETTING UP UNIQUE NODES
                // if coi is not in uniqe coi array
                if (uniqueNodes.indexOf(data.group) === -1) {
                    // push to nodes
                    nodes.push({
                        "name": data.group,
                        "group": null, // type goes here at some point
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
                // if lan_user is not in unique object
                if (!(data.lan_user in uniqueLinks)) {
                    // add user to object and add value to unique nodes
                    uniqueLinks[data.lan_user] = {
                        nodesIn: {}
                    }
                    // place the current node into the nodesIn object
                    uniqueLinks[data.lan_user].nodesIn[data.group] = {
                        count: 1
                    }
                // if lan_user is already in unique object
                } else {
                    // if coi is not already in nodesIn, place it in
                    if (!(data.group in uniqueLinks[data.lan_user].nodesIn)) {
                        uniqueLinks[data.lan_user].nodesIn[data.group] = {
                            count: 1
                        }
                    // otherwise increase value by 1
                    } else {
                        uniqueLinks[data.lan_user].nodesIn[data.group].count++;
                    }
                }
                // count up total node users
            })
            .on('end', function(){
                // SETTING UP LINKS
                // for every item that is in 'uniqueLinks' object, with more than one children in 'nodesIn', push links
                for (var i in uniqueLinks) {
                    // console.log(i)
                    // continue if item is in more than 1 node
                    if (Object.keys(uniqueLinks[i].nodesIn).length > 1) {
                        // get keys in 'nodesIn'
                        var arr = Object.keys(uniqueLinks[i].nodesIn).sort();
                        // set source of link ALSO REMEMBER THE FIRST NODE FOR LOOPING THE CONNECTIONS
                        // set first node in case of more than 2 children
                        var source = uniqueNodes.indexOf(arr[0]), target;
                        for (var o = 1; o < arr.length; o++) {
                             // if index (o) is at the end of the array AND the array is greater than 2
                            if ((o === arr.length-1) && (arr.length > 2)) {
                                // set source back to begining
                                source = uniqueNodes.indexOf(arr[arr.length-1]);
                                target = uniqueNodes.indexOf(arr[0]);
                            } else {
                                target = uniqueNodes.indexOf(arr[o])
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
                    // for every value in links, check if it is in our unique obj
                    if (!(links[i].source in uniqueSources)) {
                        // if not, create a new source parent and push in the target with value
                        uniqueSources[links[i].source] = {};
                        uniqueSources[links[i].source][links[i].target] = links[i].value;
                    } else {
                        // do the same thing if just the target doesnt exist in the source
                        if (!(links[i].target in uniqueSources[links[i].source])) {
                            uniqueSources[links[i].source] = {};
                            uniqueSources[links[i].source][links[i].target] = links[i].value;
                        // otherwise just increase the existing value
                        } else {
                            uniqueSources[links[i].source][links[i].target] += links[i].value;
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
                connection.release();
                var results = {
                    nodes: nodes,
                    links: links
                };
                callback(null, results);
            }); 
            connection.release();            
        
    })
};