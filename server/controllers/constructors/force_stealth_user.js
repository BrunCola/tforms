'use strict';

var config = require('../../config/config');

module.exports = function (sql, conn, callback) {
    var nodes = [], uniqueNodes = [];
    var links = [], uniqueLinks = {};
    var count = 0;
    var crossfilterData = crossfilter();
    conn.pool.getConnection(function(err, connection) {
        connection.changeUser({database : conn.database}, function(err) {
            if (err) throw err;
        });
        connection.query(sql.query)
            .on('result', function(data){
                count++;
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
                    // continue if item is in more than 1 node
                    if (uniqueLinks[i].nodesIn.length > 1) {
                        // get keys in 'nodesIn'
                        var arr = Object.keys(uniqueLinks[i].nodesIn);
                        // set source of link ALSO REMEMBER THE FIRST NODE FOR LOOPING THE CONNECTIONS
                        var source = uniqueLinks[i].nodesIn[0];
                        for (var o = 0; o < uniqueLinks[i].nodesIn; o++) {

                        }
                    }
                }
                console.log(count)
                console.log(uniqueLinks)
                connection.release();
                var results = {
                    links: uniqueLinks,
                    nodes: nodes
                };
                callback(null, results);
            }); 
            connection.release();
            //group by type and push a main and sub-group for each time slice
            
        
    })
};