'use strict';

var config = require('../../config/config'),
	async = require('async');

module.exports = function (sql1, sql2, sql3, conn, callback) {
	var node = [];
	var link = [];
	var users = [];
	var roles = [];
	var groups = [];
	var connections = [];

	function processData(data) {
		var current_user_index; 
		var current_group_index;
		var current_role_index;

		//insert the user node if it is not already there and grab its index either way
		if(users.indexOf(data.user) === -1) {
			node.push({
				name: data.user,
				group: 1, //or greater denotes users
				width: 0.25,
				gateway: 0
			});
			users.push(data.user);
			current_user_index = node.length - 1; //since just pushed to end of array

		} else {
			for(var i = 0; i < node.length; i++) {
				if(node[i].name === data.user && node[i].group > 0) {
					node[i].group ++; //increment the number of groups this user belongs to.
					current_user_index = i;
					break;
				}
			}
		}

		//if there's group between user and role and it is not already there insert it, grab its index
		if(data.group !== undefined) {
			if(groups.indexOf(data.group) === -1) {
			node.push({
				name: data.group,
				group: -1, //denotes groups
				width: 0.50,
				gateway: 0
			});
			groups.push(data.group);
			current_group_index = node.length - 1; //since just pushed to end of array

			} else {
				for(var i = 0; i < node.length; i++) {
					if(node[i].name === data.group && node[i].group === -1) {
						current_group_index = i;
						break;
					}
				}
			}
		}	

		//insert the group node if it is not already there and grab its index either way
		if(roles.indexOf(data.role) === -1) {
			if(data.role === "ClearText") {
				node.push({
					name: data.role,
					group: 0, //denotes roles
					width: 0.75,
					gateway: 1
				});
				roles.push(data.role);
				current_role_index = node.length - 1;
			}
			else {
				node.push({
					name: data.role,
					group: 0,
					width: 0.75,
					gateway: 0
				});
				roles.push(data.role);
				current_role_index = node.length - 1;
			}
		} else {
			for(var i = 0; i < node.length; i++) {
				if(node[i].name === data.role && node[i].group === 0) {
					current_role_index = i;
					break;
				}
			}
		}

		if(data.group !== undefined) {
			//create the links from the user to the group then the group to the role
			link.push({
				target: current_group_index,
				source: current_user_index,
				value: 1
			});

			link.push({
				target: current_role_index,
				source: current_group_index,
				value: 1
			});
		}
		else {
			//create the links from the user to the role
			link.push({
				target: current_role_index,
				source: current_user_index,
				value: 1
			});
		}

		connections.push(data.user + "" + data.role);
	}

	conn.pool.getConnection(function(err, connection) {
		connection.changeUser({database : conn.database}, function(err) {
			if (err) throw err;
		});
		async.series([
			function(callback){
				connection.query(sql1.query, sql1.insert, function(err, result) {
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){ 
							processData(data);
						})
						callback();
					}
				})
			},
			function(callback){
				connection.query(sql2.query, sql2.insert, function(err, result) {
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){ 
							if (connections.indexOf(data.user + "" + data.role) === -1) {
								processData(data);
							}
						})
						callback();
					}
				})
			},
			function(callback){
				connection.query(sql3.query, sql3.insert, function(err, result) {
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){
							for(var i = 0; i < node.length; i++) {
								if(node[i].name === data.role && node[i].group === 0) {
									if(node[i].cois === undefined) {
										node[i].cois = [data.cois];
									} else {
										node[i].cois.push(data.cois);
									}
									if(node[i].rules === undefined) {
										node[i].rules = [{
											rule: data.rule, 
											order: data.rule_order
										}];
									} else {
										node[i].rules.push({
											rule: data.rule, 
											order: data.rule_order
										});
									}
									break;
								}
							}
						})
						callback();
					}
				})
			}
		], function(err) { 
			if (err) throw console.log(err);
			connection.release();
			var results = {
				links: link,
				nodes: node
			};
			callback(null, results);
		});

	})
};