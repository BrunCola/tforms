'use strict';

var config = require('../../config/config'),
	async = require('async');

module.exports = function (sql1, sql2, sql3, sql4, conn, callback) {
	var node = [];
	var link = [];
	var users = [];
	var roles = [];
	var groups = [];
	var cois = [];
	var connections = [];

	function processData(data) {
		var current_user_index; 
		var current_group_index;
		var current_role_index;

		//insert the user node if it is not already there and grab its index either way
		if(users.indexOf(data.user) === -1) {
			node.push({
				name: data.user,
				group: 0, //1
				width: 0.25,
				type: "user",
				gateway: 0
			});
			users.push(data.user);
			current_user_index = node.length - 1; //since just pushed to end of array

		} else {
			for(var i = 0; i < node.length; i++) {
				if(node[i].name === data.user && node[i].type === "user") {
					// node[i].group ++; //increment the number of groups this user belongs to.
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
					group: 0, 
					width: 0.50,
					type: "group",
					gateway: 0
				});
				groups.push(data.group);
				current_group_index = node.length - 1; //since just pushed to end of array

			} else {
				for(var i = 0; i < node.length; i++) {
					if(node[i].name === data.group && node[i].type === "group") {
						current_group_index = i;
						break;
					}
				}
			}
		}	

		//insert the group node if it is not already there and grab its index either way
		if(roles.indexOf(data.role) === -1) {
			node.push({
				name: data.role,
				group: 0,
				width: 0.68,
				type: "role",
				gateway: 0
			});
			roles.push(data.role);
			current_role_index = node.length - 1;
		} else {
			for(var i = 0; i < node.length; i++) {
				if(node[i].name === data.role && node[i].type === "role") {
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
			function(callback){ //first query deals with role to user relationship
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
			function(callback){ //second query deals with role to user relationship
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
			function(callback){ //third query deals with role to COI relationship
				connection.query(sql3.query, sql3.insert, function(err, result) {
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){
							for(var i = 0; i < node.length; i++) {
								if(node[i].name === data.role && node[i].type === "role") { //loop over current nodes until the role is found
									
									var current_coi_index;
									var current_role_index = i; 
									if (cois.indexOf(data.cois) === -1) { //if its a new coi, add it, grab the index
										if(data.cois === "CleartextCOI") {
											node.push({
												name: data.cois,
												group: 0,
												width: 0.75,
												type: "coi",
												rules: [{
													rule: data.rule, 
													order: data.rule_order
												}],
												gateway: 1
											});
										}
										else {
											node.push({
												name: data.cois,
												group: 0,
												width: 0.75,
												type: "coi",
												rules: [{
													rule: data.rule, 
													order: data.rule_order
												}],
												gateway: 0
											}); //push the coi node
										}
										cois.push(data.cois);
										current_coi_index = node.length - 1; //set the coi index

									} else { //if the coi already exists, grab its index, and add the rule to it
										for(var j = 0; j < node.length; j++) {
											if(node[j].name === data.cois && node[j].type === "coi") {
												current_coi_index = j;
												if (node[j].rules.length > 0) { //if there's already rules
													var ruleinserted = 0; 
													//check if this rule is already inserted
													for(var k = 0; k < node[j].rules.length; k++) {
														ruleinserted = (node[j].rules[k].rule === data.rule);
													}

													if(!ruleinserted){ //if it's not, insert it
														node[j].rules.push({
															rule: data.rule, 
															order: data.rule_order
														});
													}
												} else { //if there's no rules yet push this one
													node[j].rules.push({
														rule: data.rule, 
														order: data.rule_order
													});
												}
											}
										}
									}
									//create the link between the role and the COI if it does not already exist
									
									if (connections.indexOf(data.role + "" + data.cois) === -1) {
										if(data.role === "LegalCOI" && data.cois === "OpenCOI"){
											console.log("target: "+current_role_index+" source: "+current_coi_index);
										}
										link.push({
											target: current_role_index,
											source: current_coi_index,
											value: 1
										});		

										connections.push(data.role + "" + data.cois);
									}
									// break;
								}
							}
						})
						callback();
					}
				})
			},
			function(callback){ //second query deals with role to user relationship
				connection.query(sql4.query, sql4.insert, function(err, result) {
					if (err) {
						callback(err, null);
					} else {
						result.forEach(function(data){ 
							for(var i = 0; i < node.length; i++) {
								if(node[i].name === data.user && node[i].type === "user") {
									
									node[i].group ++; //increment the number of groups this user belongs to.
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