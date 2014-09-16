'use strict';

var config = require('../../config/config'),
    crossfilter = require('crossfilter');

module.exports = function (sql, conn, callback) {

    var result = {
        'name': 'Origin',
        'value': 'Network',
        'children': []
    }

    function networkFormat(data) {
        var crossfilterData = crossfilter(data);
        var mainDim = crossfilterData.dimension(function(d){return d});
        // get list of unique lan_zones.. this can only be used at top level since children will be affected by available parents
        var lanZoneDim = crossfilterData.dimension(function(d){return d.lan_zone});
        var lanZoneUnique = lanZoneDim.group().reduceCount().top(Infinity);

        var lan_zones = [];
        for (var i in lanZoneUnique) {
            var pushToFirst = [];
            var secondChildren = mainDim.top(Infinity).filter(function(d){return (d.lan_zone === lanZoneUnique[i].key)});
            var secondChildIndex = [];
            for (var s in secondChildren) {
                // if the OS is unique (in our index array), continue
                if (secondChildIndex.indexOf(secondChildren[s].operating_system) === -1) {
                    // whild matching second, lets start filtering and pushing the third children
                    var pushToThird = [];
                    var thirdChildren = mainDim.top(Infinity).filter(function(d){return ((d.lan_zone === lanZoneUnique[i].key) && (d.operating_system === secondChildren[s].operating_system))});
                    for (var t in thirdChildren){
                        pushToThird.push({
                            name: "IP",
                            value: thirdChildren[t].lan_ip
                        });
                        // pushToThird.push(thirdChildren[t]);
                    }
                    // push to children of parent lan_ip
                    pushToFirst.push({
                        name: "OS",
                        value: secondChildren[s].operating_system,
                        children: pushToThird
                    })
                    // push the name to our index array
                    secondChildIndex.push(secondChildren[s].operating_system);
                }
            }
            result.children.push({
                name: "Zone",
                value: lanZoneUnique[i].key,
                children: pushToFirst // perhaps i should map out the children here before pushing
            })
        }
        return result;
    }

    function usersFormat(data) {
        function getVal(type) {
            switch (type) {
                case 'Connections':
                    return 'remote_ip';
                case 'DNS':
                    return 'remote_ip';
                case 'HTTP':
                    return 'host';
                case 'SSL':
                    return 'server_name';
                case 'SSH':
                    return 'remote_ip';
                case 'FTP':
                    return 'remote_ip';
                case 'IRC':
                    return 'remote_ip';
                case 'Files':
                    return 'mime';    
                case 'Connections Dropped':
                    return 'remote_ip';       
                case 'Stealth':
                    return 'remote_ip';       
                case 'Stealth Dropped':
                    return 'remote_ip';       
            }
        }
        var crossfilterData = crossfilter(data);
        var mainDim = crossfilterData.dimension(function(d){return d});
        // get list of unique lan_zones.. this can only be used at top level since children will be affected by available parents
        var trafficTypeDim = crossfilterData.dimension(function(d){return d.type});
        var trafficTypeUnique = trafficTypeDim.group().reduceCount().top(Infinity);

        var traffic_types = [];
        for (var i in trafficTypeUnique) {
            var pushToFirst = [];
            var secondChildren = mainDim.top(Infinity).filter(function(d){return (d.type === trafficTypeUnique[i].key)});
            var secondChildIndex = [];
            for (var s in secondChildren) {
                // if the OS is unique (in our index array), continue
                if (secondChildIndex.indexOf(secondChildren[s][getVal(secondChildren[s].type)]) === -1) {
                    pushToFirst.push({
                        name: secondChildren[s].type,
                        value: secondChildren[s][getVal(secondChildren[s].type)]
                    })
                    // push the name to our index array
                    secondChildIndex.push(secondChildren[s][getVal(secondChildren[s].type)]);
                }
            }
            result.children.push({
                name: "Traffic",
                value: trafficTypeUnique[i].key,
                children: pushToFirst // perhaps i should map out the children here before pushing
            })
        }
        return result;
    }

    // var levels = ['lan_zone', 'operating_system', 'lan_ip'];
    // var testArrays = [];
    // function format2(data) {
    //     var crossfilterData = crossfilter(data);
    //     var mainDim = crossfilterData.dimension(function(d){return d});

    //     // get list of unique lan_zones.. this can only be used at top level since children will be affected by available parents
    //     var lvl1Dim = crossfilterData.dimension(function(d){return d[levels[0]]});
    //     var lvl1Unique = lvl1Dim.group().reduceCount().top(Infinity);

    //     for (var l in levels) {
    //         var thisLevel = levels[l];
            
    //         for (var i in lvl1Unique) {
    //             var pushToFirst = [];
    //             var secondChildren = mainDim.top(Infinity).filter(function(d){return (d.lan_zone === lvl1Unique[i].key)});
    //             var secondChildIndex = [];
    //             for (var s in secondChildren) {
    //                 // if the OS is unique (in our index array), continue
    //                 if (secondChildIndex.indexOf(secondChildren[s].operating_system) === -1) {
    //                     // whild matching second, lets start filtering and pushing the third children
    //                     var pushToThird = [];
    //                     var thirdChildren = mainDim.top(Infinity).filter(function(d){return ((d.lan_zone === lvl1Unique[i].key) && (d.operating_system === secondChildren[s].operating_system))});
    //                     for (var t in thirdChildren){
    //                         // pushToThird.push({
    //                         //     name: "IP",
    //                         //     value: thirdChildren[t].lan_ip
    //                         // });
    //                         pushToThird.push(thirdChildren[t]);
    //                     }
    //                     // push to children of parent lan_ip
    //                     pushToFirst.push({
    //                         name: "OS",
    //                         value: secondChildren[s].operating_system,
    //                         children: pushToThird
    //                     })
    //                     // push the name to our index array
    //                     secondChildIndex.push(secondChildren[s].operating_system);
    //                 }
    //             }
    //             result.children.push({
    //                 name: "Zone",
    //                 value: lvl1Unique[i].key,
    //                 children: pushToFirst // perhaps i should map out the children here before pushing
    //             })
    //         }
    //         return result;

    //     }
    // }
    // 
    // 
    // 
    switch(conn.type) {
        case 'network':
            conn.pool.getConnection(function(err, connection) {
                connection.changeUser({database : conn.database}, function(err) {
                    if (err) throw err;
                });
                connection.query(sql.query, sql.insert, function(err, data) {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, networkFormat(data));
                    }
                });
            })
            break;
        case 'users':
            callback(null, usersFormat(sql));
            break;
    }
    
    
};